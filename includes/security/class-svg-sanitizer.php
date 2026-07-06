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
 */
class Svg_Sanitizer {

	use Singleton;

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

		$contents = file_get_contents( $tmp );// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		// .svgz is gzip-compressed SVG — decompress before sanitising.
		if ( 'svgz' === $ext && is_string( $contents ) ) {
			$contents = ( 0 === strncmp( $contents, "\x1f\x8b", 2 ) && function_exists( 'gzdecode' ) )
				? gzdecode( $contents )
				: false;
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
	 * Strip disallowed elements and attributes from SVG markup.
	 *
	 * @param string|false $svg Raw SVG content.
	 * @return string|false Sanitised SVG, or false on failure.
	 */
	private function sanitize_svg_content( $svg ) {
		if ( false === $svg || '' === trim( $svg ) ) {
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

		// Disallowed element names (case-insensitive match via strtolower below).
		$blocked_elements = array(
			'script', 'object', 'embed', 'iframe', 'applet',
			'form', 'input', 'button', 'textarea',
		);

		// Disallowed attribute prefixes / names.
		$blocked_attr_prefixes = array( 'on' );  // onload, onclick, etc.
		$blocked_attrs         = array( 'href', 'xlink:href', 'src', 'action', 'formaction' );

		$elements = $dom->getElementsByTagName( '*' );
		$to_remove = array();

		foreach ( $elements as $element ) {
			if ( in_array( strtolower( $element->tagName ), $blocked_elements, true ) ) {
				$to_remove[] = $element;
				continue;
			}

			$attrs_to_remove = array();

			// Iterate via a snapshot array because the live NamedNodeMap changes.
			if ( $element->hasAttributes() ) {
				for ( $i = 0; $i < $element->attributes->length; $i++ ) {
					$attr      = $element->attributes->item( $i );
					$attr_name = strtolower( $attr->nodeName );

					// Block event handlers (on*) and dangerous href/src.
					foreach ( $blocked_attr_prefixes as $prefix ) {
						if ( 0 === strpos( $attr_name, $prefix ) ) {
							$attrs_to_remove[] = $attr->nodeName;
						}
					}

					if ( in_array( $attr_name, $blocked_attrs, true ) ) {
						// Allow xlink:href for SVG <use> references only.
						if ( 'xlink:href' === $attr_name && 'use' === strtolower( $element->tagName ) ) {
							// Only allow fragment references (e.g. #icon).
							if ( 0 !== strpos( $attr->nodeValue, '#' ) ) {
								$attrs_to_remove[] = $attr->nodeName;
							}
						} else {
							$attrs_to_remove[] = $attr->nodeName;
						}
					}
				}
			}

			foreach ( $attrs_to_remove as $attr_name ) {
				$element->removeAttribute( $attr_name );
			}
		}

		foreach ( $to_remove as $element ) {
			if ( $element->parentNode ) {
				$element->parentNode->removeChild( $element );
			}
		}

		$result = $dom->saveXML();

		return false === $result ? false : $result;
	}
}
