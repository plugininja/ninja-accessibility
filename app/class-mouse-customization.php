<?php
namespace Pnpna\NA\App;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Security\Input_Validator;
use Pnpna\NA\Traits\Singleton;
use Pnpna\NA\Utils\Helpers;

/**
 * Custom cursor accessibility feature.
 *
 * Generates a high-visibility cursor as an inline SVG data-URI from the
 * selected shape, colour, and size — or uses a same-site uploaded icon —
 * and applies it via properly-enqueued inline CSS.
 *
 * Security:
 *  - Built-in shapes are rendered from a fixed allowlist.
 *  - Custom icon URLs are validated as same-site before use.
 *  - cursor_size is clamped to 8–128 px; cursor_color must be a hex colour.
 *  - CSS selector scope is sanitised to a safe character set.
 */
class Mouse_Customization {

	use Singleton;

	/** Built-in cursor shapes (viewBox 0 0 20 20), keyed by id. */
	private const SHAPES = array(
		'cursor1' => '<circle cx="10" cy="10" r="3" fill="%1$s"/><circle cx="10" cy="10" r="8" fill="none" stroke="%1$s" stroke-width="1.5"/>',
		'cursor2' => '<circle cx="10" cy="10" r="4" fill="none" stroke="%1$s" stroke-width="2"/>',
		'cursor3' => '<circle cx="10" cy="10" r="9" fill="none" stroke="%1$s" stroke-width="2"/>',
		'cursor4' => '<circle cx="10" cy="10" r="5" fill="%1$s"/>',
		'cursor5' => '<circle cx="10" cy="10" r="8" fill="%1$s"/>',
	);

	/**
	 * File-based cursor designs (accessiy icon set) — fixed artwork shipped in
	 * assets/images/icons/cursor_icon{N}.svg. Keyed by id => file suffix.
	 */
	private const FILE_SHAPES = array(
		'cursor6'  => '6',
		'cursor7'  => '7',
		'cursor8'  => '8',
		'cursor9'  => '9',
		'cursor10' => '10',
	);

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_cursor_style' ), 20 );
	}

	/**
	 * Enqueue the inline cursor CSS on an empty registered handle.
	 */
	public function enqueue_cursor_style(): void {
		$css = $this->build_cursor_css();

		if ( '' === $css ) {
			return;
		}

		wp_register_style( 'pnpna-cursor', false, array(), PNPNA_VERSION );
		wp_enqueue_style( 'pnpna-cursor' );
		wp_add_inline_style( 'pnpna-cursor', $css );
	}

	/**
	 * Build the cursor CSS rule set (empty string = nothing to output).
	 */
	private function build_cursor_css(): string {
		if ( ! $this->applies_to_current_page() ) {
			return '';
		}

		$cursor_url = $this->resolve_cursor_url();

		if ( '' === $cursor_url ) {
			return '';
		}

		$size    = $this->get_cursor_size();
		$hotspot = (int) floor( $size / 2 );

		// Arrow-style file cursors point from the top-left corner.
		if ( $this->is_file_shape() ) {
			$hotspot = 0;
		}

		$selectors = $this->get_scope_selectors();
		$rule      = sprintf(
			'%s { cursor: url("%s") %d %d, auto !important; }',
			$selectors,
			$cursor_url,
			$hotspot,
			$hotspot
		);

		if ( '1' === Helpers::get_setting( 'hide_cursor_on_mobile', '1' ) ) {
			// Only apply on devices with a real pointer.
			$rule = '@media (hover: hover) and (pointer: fine) { ' . $rule . ' }';
		}

		return $rule;
	}

	/**
	 * Whether the cursor should be applied on the currently-viewed page.
	 */
	private function applies_to_current_page(): bool {
		$apply = (string) Helpers::get_setting( 'apply_cursor', 'entire_website' );

		if ( 'entire_website' === $apply || 'all' === $apply ) {
			return true;
		}

		$current_page_id = get_queried_object_id();

		return $current_page_id > 0 && (string) $current_page_id === $apply;
	}

	/**
	 * Resolve the cursor image URL (built-in SVG data-URI or same-site upload).
	 */
	private function resolve_cursor_url(): string {
		$icon = Helpers::get_setting( 'cursor_icon' );

		if ( ! is_array( $icon ) ) {
			$icon = array( 'id' => 'cursor1' );
		}

		// Custom uploaded icon (must be a same-site URL).
		if ( ! empty( $icon['icon'] ) && is_string( $icon['icon'] ) ) {
			$icon_url = $icon['icon'];

			if ( filter_var( $icon_url, FILTER_VALIDATE_URL ) && Input_Validator::is_same_site_url( $icon_url ) ) {
				return esc_url( $icon_url );
			}

			return '';
		}

		$shape_id = isset( $icon['id'] ) ? sanitize_key( (string) $icon['id'] ) : 'cursor1';

		// File-based design (fixed artwork, no recolouring).
		if ( isset( self::FILE_SHAPES[ $shape_id ] ) ) {
			return esc_url( PNPNA_ASSETS . '/images/icons/cursor_icon' . self::FILE_SHAPES[ $shape_id ] . '.svg' );
		}

		// Built-in shape rendered as an SVG data URI.
		if ( ! isset( self::SHAPES[ $shape_id ] ) ) {
			$shape_id = 'cursor1';
		}

		$color = Input_Validator::sanitize_hex_color(
			(string) Helpers::get_setting( 'cursor_color', '#1a1a1a' )
		);

		if ( '' === $color ) {
			$color = '#1a1a1a';
		}

		$size = $this->get_cursor_size();

		$svg = sprintf(
			'<svg xmlns="http://www.w3.org/2000/svg" width="%1$d" height="%1$d" viewBox="0 0 20 20">%2$s</svg>',
			$size,
			sprintf( self::SHAPES[ $shape_id ], $color )
		);

		return 'data:image/svg+xml;charset=utf-8,' . rawurlencode( $svg );
	}

	/**
	 * Whether the selected cursor icon is a file-based design.
	 */
	private function is_file_shape(): bool {
		$icon = Helpers::get_setting( 'cursor_icon' );

		return is_array( $icon )
			&& isset( $icon['id'] )
			&& isset( self::FILE_SHAPES[ sanitize_key( (string) $icon['id'] ) ] );
	}

	/**
	 * Clamped cursor size in pixels (browsers cap cursor images at 128px).
	 */
	private function get_cursor_size(): int {
		$size = (int) Helpers::get_setting( 'cursor_size', 20 );

		return max( 8, min( $size, 128 ) );
	}

	/**
	 * CSS selector scope for the cursor rule.
	 *
	 * Defaults to the whole document (including links and buttons, which would
	 * otherwise keep their own cursor). A saved selector list narrows the scope.
	 */
	private function get_scope_selectors(): string {
		$raw = (string) Helpers::get_setting( 'cursor_css_selectors', '' );
		$raw = trim( $raw );

		if ( '' === $raw ) {
			return 'body, body *';
		}

		$safe = array();

		foreach ( explode( ',', $raw ) as $selector ) {
			$selector = trim( $selector );

			// Conservative allowlist: element/class/id/attribute-free selectors only.
			if ( '' !== $selector && preg_match( '/^[a-zA-Z0-9_\-\.\#\s\>\+\~\*]+$/', $selector ) ) {
				$safe[] = $selector;
				$safe[] = $selector . ' *';
			}
		}

		return empty( $safe ) ? 'body, body *' : implode( ', ', $safe );
	}
}
