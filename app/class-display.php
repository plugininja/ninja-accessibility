<?php
namespace Pnpna\NA\App;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Traits\Singleton;
use Pnpna\NA\Utils\Helpers;

/**
 * Renders the frontend accessibility widget.
 */
class Display {

	use Singleton;

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		$skip = Helpers::get_setting( 'skip_main_content' );

		if ( '1' === $skip ) {
			add_action( 'wp_body_open', array( $this, 'render_skip_link' ), 5 );
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_skip_link_assets' ), 100 );
		}

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_styles' ), 10 );
		add_action( 'wp_footer', array( $this, 'render' ) );
	}

	/**
	 * Inject dynamic CSS custom properties for the widget.
	 */
	public function enqueue_frontend_styles(): void {
		wp_enqueue_style( 'pnpna-frontend' );

		$color  = Helpers::get_setting( 'icon_bg_color', '#003C43' );
		$radius = Helpers::get_setting( 'icon_corner_radius', '100' );

		$primary_color = $this->resolve_primary_color( $color );

		$css = '';

		if ( ! empty( $primary_color ) ) {
			$css .= '--pnpna-primary-color: ' . esc_attr( $primary_color ) . ';';
		}

		if ( ! empty( $color ) ) {
			$css .= '--pnpna-icon-color: ' . esc_attr( $color ) . ';';
		}

		if ( '' !== $radius ) {
			$css .= '--pnpna-icon-radius: ' . esc_attr( (int) $radius ) . 'px;';
		}

		$css .= $this->build_exact_position_vars();

		if ( ! empty( $css ) ) {
			wp_add_inline_style( 'pnpna-frontend', ':root { ' . $css . ' }' );
		}
	}

	/**
	 * CSS custom properties for per-device exact widget positioning.
	 *
	 * @return string
	 */
	private function build_exact_position_vars(): string {
		$css = '';

		foreach ( array( 'desktop', 'tablet', 'phone' ) as $device ) {
			$exact = filter_var(
				Helpers::get_setting( "exact_position_{$device}", '0' ),
				FILTER_VALIDATE_BOOLEAN
			);

			if ( ! $exact ) {
				continue;
			}

			$x = (int) Helpers::get_setting( "exact_position_{$device}_x", '40' );
			$y = (int) Helpers::get_setting( "exact_position_{$device}_y", '40' );

			$css .= "--pnpna-{$device}-x: {$x}px;--pnpna-{$device}-y: {$y}px;";
		}

		return $css;
	}

	/**
	 * Output the React widget mount point via the frontend template.
	 */
	public function render(): void {
		$devices  = array( 'desktop', 'tablet', 'phone' );
		$settings = array(
			'icon'   => Helpers::get_setting( 'widget_icon' ),
			'size'   => Helpers::get_setting( 'icon_size' ),
			'color'  => Helpers::get_setting( 'icon_bg_color' ),
			'radius' => Helpers::get_setting( 'icon_corner_radius' ),
		);

		foreach ( $devices as $device ) {
			$settings[ $device ] = array(
				'show_icon' => Helpers::get_setting( "show_icon_{$device}", '1' ),
				'position'  => Helpers::get_setting( "{$device}_icon_position", 'bottom-right' ),
				'exact'     => Helpers::get_setting( "exact_position_{$device}", '0' ),
				'x'         => Helpers::get_setting( "exact_position_{$device}_x", '40' ),
				'y'         => Helpers::get_setting( "exact_position_{$device}_y", '40' ),
			);
		}

		pnpna_get_template( 'frontend', array( 'settings' => $settings ) );
	}

	/**
	 * Output an accessible "Skip to main content" link.
	 */
	public function render_skip_link(): void {
		echo '<a href="#pnpna-main-content" class="pnpna-skip-link">'
			. esc_html__( 'Skip to Main Content', 'ninja-accessibility' )
			. '</a>';
	}

	/**
	 * Enqueue inline CSS and JS for the skip link.
	 */
	public function enqueue_skip_link_assets(): void {
		$css = '
			.pnpna-skip-link {
				position: absolute;
				left: -999px;
				top: auto;
				width: 1px;
				height: 1px;
				overflow: hidden;
				z-index: 99999;
				background: #000;
				color: #fff;
				padding: 10px 15px;
				font-size: 16px;
				text-decoration: none;
				transition: left 0.3s ease;
			}
			.pnpna-skip-link:focus {
				left: 10px;
				top: 10px;
				width: auto;
				height: auto;
			}
		';

		// Standalone handle: the skip link must work even when the widget
		// (and therefore the pnpna-frontend handle) is disabled.
		wp_register_style( 'pnpna-skip-link', false, array(), PNPNA_VERSION );
		wp_enqueue_style( 'pnpna-skip-link' );
		wp_add_inline_style( 'pnpna-skip-link', $css );

		$js = '
			document.addEventListener("DOMContentLoaded", function () {
				var main = document.querySelector("main, #main, #primary, #content");
				if (main && !main.id) {
					main.id = "pnpna-main-content";
				}
			});
		';

		wp_register_script( 'pnpna-skip-link', '', array(), PNPNA_VERSION, true );
		wp_enqueue_script( 'pnpna-skip-link' );
		wp_add_inline_script( 'pnpna-skip-link', $js );
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Determine a legible text colour (black or original) based on background lightness.
	 *
	 * Returns black when the background is very light (lightness > 70 %).
	 *
	 * @param string $hex Background hex colour.
	 * @return string Resolved hex colour.
	 */
	private function resolve_primary_color( string $hex ): string {
		if ( empty( $hex ) ) {
			return '#003C43';
		}

		$hex = ltrim( $hex, '#' );

		if ( 3 === strlen( $hex ) ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		// Malformed value (wrong length or non-hex chars): fall back to default.
		if ( 6 !== strlen( $hex ) || ! ctype_xdigit( $hex ) ) {
			return '#003C43';
		}

		$r         = hexdec( substr( $hex, 0, 2 ) ) / 255;
		$g         = hexdec( substr( $hex, 2, 2 ) ) / 255;
		$b         = hexdec( substr( $hex, 4, 2 ) ) / 255;
		$max       = max( $r, $g, $b );
		$min       = min( $r, $g, $b );
		$lightness = ( $max + $min ) / 2;

		return ( $lightness * 100 ) > 70 ? '#000000' : '#' . $hex;
	}
}
