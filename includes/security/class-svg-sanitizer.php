<?php
namespace Pnpna\NA\Security;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Traits\Singleton;

/**
 * Sanitises SVG files on upload and registers the SVG MIME type.
 *
 * SVG uploads are disabled by default in WordPress because they can contain
 * arbitrary JavaScript. This class strips dangerous elements and attributes
 * before allowing SVGs to be saved to the Media Library.
 *
 * Hardening notes:
 *  - Elements and attributes are matched by LOCAL name + namespace, never by
 *    qualified/tag name, so prefix tricks (<x:script>, l:href) cannot bypass
 *    the filter.
 *  - Everything outside the SVG namespace (e.g. smuggled XHTML) is removed,
 *    including <foreignObject> content.
 *  - SMIL animation elements may not retarget href attributes.
 *  - Processing instructions (xml-stylesheet) and comments are removed.
 *  - DOCTYPE / ENTITY declarations are rejected outright (XXE).
 *  - File size is capped, including the decompressed size of .svgz uploads
 *    (decompression-bomb guard).
 */
class Svg_Sanitizer {

	use Singleton;

	private const SVG_NS = 'http://www.w3.org/2000/svg';

	/**
	 * Disallowed element local names (lower-case).
	 *
	 * foreignObject is blocked because it embeds arbitrary non-SVG content;
	 * base/meta/link can retarget or pull external resources when the SVG is
	 * opened as a document.
	 */
	private const BLOCKED_ELEMENTS = array(
		'script', 'object', 'embed', 'iframe', 'applet',
		'form', 'input', 'button', 'textarea',
		'foreignobject', 'base', 'meta', 'link',
	);

	/**
	 * Link/resource attribute local names that are stripped everywhere
	 * (with a single exception for fragment-only <use href="#…">).
	 */
	private const BLOCKED_ATTRS = array( 'href', 'src', 'action', 'formaction' );

	/**
	 * SMIL animation element local names whose attributeName may not
	 * reference href (classic `<set attributeName="href" to="javascript:…">`
	 * bypass).
	 */
	private const SMIL_ELEMENTS = array( 'animate', 'set', 'animatemotion', 'animatetransform' );

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		add_filter( 'upload_mimes', array( $this, 'allow_svg_mime' ) );
		add_filter( 'wp_handle_upload_prefilter', array( $this, 'sanitize_svg_upload' ) );
		add_filter( 'wp_check_filetype_and_ext', array( $this, 'fix_svg_filetype' ), 10, 4 );
	}

	/**
	 * Allow the SVG MIME type — only for administrators uploading from this
	 * plugin's own admin page (the cursor/widget icon pickers).
	 *
	 * SVG uploads are intentionally NOT enabled site-wide: the referer check
	 * scopes the capability to our media-frame uploads so the Media Library
	 * and other plugins keep WordPress's default behaviour. The check is a
	 * scoping mechanism, not a security boundary — the security boundary is
	 * sanitize_svg_upload(), which runs on every SVG regardless of context.
	 *
	 * @param array<string, string> $mimes Allowed MIME types.
	 * @return array<string, string>
	 */
	public function allow_svg_mime( array $mimes ): array {
		if ( current_user_can( 'manage_options' ) && $this->is_plugin_upload_context() ) {
			$mimes['svg']  = 'image/svg+xml';
			$mimes['svgz'] = 'image/svg+xml';
		}

		return $mimes;
	}

	/**
	 * Sanitise an SVG file before it is saved, blocking unsafe content.
	 *
	 * @param array<string, string> $file $_FILES entry.
	 * @return array<string, string>
	 */
	public function sanitize_svg_upload( array $file ): array {
		/*
		 * Decide by file EXTENSION, never by $file['type'] — the MIME type
		 * comes from the browser POST and can be spoofed, which would let an
		 * evil.svg skip sanitisation while fix_svg_filetype() still corrects
		 * its type to image/svg+xml later.
		 */
		$ext = strtolower( pathinfo( (string) ( $file['name'] ?? '' ), PATHINFO_EXTENSION ) );

		if ( ! isset( $file['tmp_name'] ) || ! in_array( $ext, array( 'svg', 'svgz' ), true ) ) {
			return $file;
		}

		$tmp = $file['tmp_name'];

		if ( ! is_file( $tmp ) || ! is_readable( $tmp ) ) {
			return $file;
		}

		$max_bytes = $this->get_max_filesize();
		$raw_size  = filesize( $tmp );

		if ( false === $raw_size || $raw_size > $max_bytes ) {
			$file['error'] = __( 'This SVG file exceeds the maximum allowed size and was rejected.', 'ninja-accessibility' );
			return $file;
		}

		$contents = file_get_contents( $tmp );// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		// .svgz is gzip-compressed SVG — decompress (size-capped) before sanitising.
		if ( 'svgz' === $ext ) {
			$contents = is_string( $contents ) ? $this->decompress_svgz( $contents, $max_bytes ) : false;
		}

		$sanitised = $this->sanitize_svg_content( $contents );

		if ( false === $sanitised ) {
			$file['error'] = __( 'This SVG file could not be sanitised and was rejected.', 'ninja-accessibility' );
			return $file;
		}

		if ( 'svgz' === $ext ) {
			$sanitised = gzencode( $sanitised );

			if ( false === $sanitised ) {
				$file['error'] = __( 'This SVG file could not be sanitised and was rejected.', 'ninja-accessibility' );
				return $file;
			}
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $tmp, $sanitised );

		return $file;
	}

	/**
	 * Fix WordPress's incorrect MIME-type detection for SVG files.
	 *
	 * @param array<string, mixed> $data     wp_check_filetype_and_ext() result.
	 * @param string               $file     Full path to the uploaded file.
	 * @param string               $filename The original filename.
	 * @param array<string, string>|null $mimes Allowed MIME types (unused).
	 * @return array<string, mixed>
	 */
	public function fix_svg_filetype( array $data, string $file, string $filename, $mimes ): array {
		if ( ! $data['type'] ) {
			// Only correct the type when SVG is actually an allowed MIME type
			// (i.e. allow_svg_mime() granted it for this request). Otherwise
			// this would resurrect SVG uploads in contexts where they are
			// meant to stay disabled.
			$allowed = is_array( $mimes ) ? $mimes : get_allowed_mime_types();

			if ( ! isset( $allowed['svg'] ) && ! isset( $allowed['svgz'] ) ) {
				return $data;
			}

			$check_ext = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
			if ( in_array( $check_ext, array( 'svg', 'svgz' ), true ) ) {
				$data['ext']             = $check_ext;
				$data['type']            = 'image/svg+xml';
				$data['proper_filename'] = $filename;
			}
		}

		return $data;
	}

	/**
	 * Whether the current upload request originates from this plugin's own
	 * admin page (admin.php?page=ninja-accessibility).
	 *
	 * Media-modal uploads (async-upload.php / REST) carry the admin page as
	 * the HTTP referer. Referers are forgeable, so this is used only to scope
	 * WHERE SVG uploads are offered — sanitisation still runs on every SVG.
	 *
	 * @return bool
	 */
	private function is_plugin_upload_context(): bool {
		$referer = wp_get_referer();

		if ( ! $referer ) {
			return false;
		}

		$query = wp_parse_url( $referer, PHP_URL_QUERY );

		if ( empty( $query ) || ! is_string( $query ) ) {
			return false;
		}

		parse_str( $query, $params );

		return isset( $params['page'] ) && PNPNA_SLUG === $params['page'];
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Maximum allowed SVG size in bytes (raw file and decompressed .svgz).
	 *
	 * @return int
	 */
	private function get_max_filesize(): int {
		/**
		 * Filters the maximum allowed SVG upload size in bytes.
		 *
		 * Applies to the raw file and to the decompressed content of .svgz
		 * uploads. Default 2 MB — far above any real icon.
		 *
		 * @param int $max_bytes Maximum size in bytes.
		 */
		$max = (int) apply_filters( 'pnpna_svg_max_filesize', 2 * 1024 * 1024 );

		return $max > 0 ? $max : 2 * 1024 * 1024;
	}

	/**
	 * Decompress .svgz content with a hard output cap.
	 *
	 * @param string $contents  Raw gzip data.
	 * @param int    $max_bytes Maximum allowed decompressed size.
	 * @return string|false Decompressed SVG, or false on failure/oversize.
	 */
	private function decompress_svgz( string $contents, int $max_bytes ) {
		if ( 0 !== strncmp( $contents, "\x1f\x8b", 2 ) || ! function_exists( 'gzdecode' ) ) {
			return false;
		}

		/*
		 * Cap the decoded output so a small crafted archive cannot expand
		 * into hundreds of megabytes (decompression bomb). Corrupt gzip data
		 * emits a PHP warning, hence the suppression.
		 */
		// phpcs:ignore Generic.PHP.NoSilencedErrors.Discouraged, WordPress.PHP.NoSilencedErrors.Discouraged
		$decoded = @gzdecode( $contents, $max_bytes + 1 );

		if ( ! is_string( $decoded ) || strlen( $decoded ) > $max_bytes ) {
			return false;
		}

		return $decoded;
	}

	/**
	 * Strip disallowed elements and attributes from SVG markup.
	 *
	 * @param string|false $svg Raw SVG content.
	 * @return string|false Sanitised SVG, or false on failure.
	 */
	private function sanitize_svg_content( $svg ) {
		if ( ! is_string( $svg ) || '' === trim( $svg ) ) {
			return false;
		}

		/*
		 * XXE protection: reject any SVG containing a DOCTYPE or ENTITY
		 * declaration before it reaches the XML parser. Valid SVG icons never
		 * need these, and refusing them removes the external-entity attack
		 * vector on all PHP/libxml versions without relying on the deprecated
		 * libxml_disable_entity_loader(). LIBXML_NONET below additionally
		 * blocks all network access during parsing.
		 */
		if ( preg_match( '/<!\s*(?:DOCTYPE|ENTITY)/i', $svg ) ) {
			return false;
		}

		$prev = libxml_use_internal_errors( true );

		$dom    = new \DOMDocument();
		$loaded = $dom->loadXML( $svg, LIBXML_NONET | LIBXML_NOBLANKS );

		libxml_clear_errors();
		libxml_use_internal_errors( $prev );

		if ( false === $loaded ) {
			return false;
		}

		// The document root must be <svg> in the SVG namespace — anything
		// else (e.g. an XHTML document renamed to .svg) is rejected.
		$root = $dom->documentElement;

		if ( ! $root instanceof \DOMElement
			|| 'svg' !== strtolower( (string) $root->localName )
			|| self::SVG_NS !== $root->namespaceURI ) {
			return false;
		}

		// An xml-stylesheet processing instruction can pull external XSLT
		// (which may generate script); comments are removed as inert clutter.
		$this->remove_pis_and_comments( $dom );

		$to_remove = array();

		foreach ( $dom->getElementsByTagName( '*' ) as $element ) {
			if ( $this->is_blocked_element( $element ) ) {
				$to_remove[] = $element;
				continue;
			}

			$this->sanitize_element_attributes( $element );
		}

		foreach ( $to_remove as $element ) {
			if ( $element->parentNode ) {
				$element->parentNode->removeChild( $element );
			}
		}

		$result = $dom->saveXML();

		return false === $result ? false : $result;
	}

	/**
	 * Whether an element must be removed entirely (subtree included).
	 *
	 * @param \DOMElement $element Element under inspection.
	 * @return bool
	 */
	private function is_blocked_element( \DOMElement $element ): bool {
		/*
		 * Anything outside the SVG namespace is removed wholesale. This kills
		 * smuggled XHTML — e.g. <x:script xmlns:x="http://www.w3.org/1999/xhtml">
		 * — which a tag-name blocklist would miss because its tagName is
		 * "x:script", not "script".
		 */
		if ( self::SVG_NS !== $element->namespaceURI ) {
			return true;
		}

		$local = strtolower( (string) $element->localName );

		if ( in_array( $local, self::BLOCKED_ELEMENTS, true ) ) {
			return true;
		}

		// SMIL may not animate link targets:
		// <set attributeName="href" to="javascript:…"> on an <a>.
		if ( in_array( $local, self::SMIL_ELEMENTS, true ) ) {
			$target = strtolower( $element->getAttribute( 'attributeName' ) );

			if ( false !== strpos( $target, 'href' ) ) {
				return true;
			}
		}

		// <style> content may not reference external resources or hide
		// payloads behind CSS escapes.
		if ( 'style' === $local && $this->has_dangerous_css( (string) $element->textContent ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Remove blocked attributes from a single element.
	 *
	 * Attributes are matched by LOCAL name so namespace-prefix tricks
	 * (xlink:href, l:href with xmlns:l bound to xlink, …) cannot slip
	 * through, and removed via removeAttributeNode(), which is reliable for
	 * namespaced attributes where removeAttribute() is not.
	 *
	 * @param \DOMElement $element Element under inspection.
	 */
	private function sanitize_element_attributes( \DOMElement $element ): void {
		if ( ! $element->hasAttributes() ) {
			return;
		}

		$remove = array();

		foreach ( $element->attributes as $attr ) {
			if ( $this->is_blocked_attribute( $element, $attr ) ) {
				$remove[] = $attr;
			}
		}

		foreach ( $remove as $attr ) {
			$element->removeAttributeNode( $attr );
		}
	}

	/**
	 * Whether a single attribute must be stripped.
	 *
	 * @param \DOMElement $element Owning element.
	 * @param \DOMAttr    $attr    Attribute under inspection.
	 * @return bool
	 */
	private function is_blocked_attribute( \DOMElement $element, \DOMAttr $attr ): bool {
		$local = strtolower( (string) ( $attr->localName ?? $attr->nodeName ) );

		// Event handlers: onload, onclick, onbegin, …
		if ( 0 === strpos( $local, 'on' ) ) {
			return true;
		}

		if ( in_array( $local, self::BLOCKED_ATTRS, true ) ) {
			// Single exception: <use> may keep same-document fragment
			// references (href="#icon" / xlink:href="#icon").
			if ( 'href' === $local
				&& 'use' === strtolower( (string) $element->localName )
				&& 0 === strpos( trim( (string) $attr->nodeValue ), '#' ) ) {
				return false;
			}

			return true;
		}

		// Inline style may not reference external resources.
		if ( 'style' === $local && $this->has_dangerous_css( (string) $attr->nodeValue ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Whether CSS content contains constructs that can pull external
	 * resources or obfuscate a payload.
	 *
	 * Backslashes are rejected because CSS escapes (`\75 rl(…)` = `url(…)`)
	 * would otherwise defeat the keyword checks. Legit icon styling never
	 * needs them.
	 *
	 * @param string $css CSS text (rule block or style attribute value).
	 * @return bool
	 */
	private function has_dangerous_css( string $css ): bool {
		return (bool) preg_match( '/url\s*\(|@import|expression\s*\(|javascript:|\\\\/i', $css );
	}

	/**
	 * Remove all processing instructions and comments from the document.
	 *
	 * @param \DOMDocument $dom Parsed SVG document.
	 */
	private function remove_pis_and_comments( \DOMDocument $dom ): void {
		$xpath = new \DOMXPath( $dom );
		$nodes = $xpath->query( '//processing-instruction() | //comment()' );

		if ( false === $nodes ) {
			return;
		}

		$stale = array();

		foreach ( $nodes as $node ) {
			$stale[] = $node;
		}

		foreach ( $stale as $node ) {
			if ( $node->parentNode ) {
				$node->parentNode->removeChild( $node );
			}
		}
	}
}
