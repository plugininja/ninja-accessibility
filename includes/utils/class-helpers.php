<?php
namespace Pnpna\NA\Utils;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * General-purpose utility helpers.
 */
class Helpers {

	// -------------------------------------------------------------------------
	// Requirements
	// -------------------------------------------------------------------------

	/**
	 * Verify minimum WP and PHP versions; deactivate and die if unmet.
	 */
	public static function check_requirements(): void {
		if ( version_compare( get_bloginfo( 'version' ), PNPNA_WP_VERSION, '<' ) ) {
			self::deactivate_and_notify(
				sprintf(
					/* translators: %s: minimum WordPress version */
					__( 'Ninja Accessibility requires WordPress %s or higher.', 'ninja-accessibility' ),
					PNPNA_WP_VERSION
				)
			);
		}

		if ( version_compare( PHP_VERSION, PNPNA_PHP_VERSION, '<' ) ) {
			self::deactivate_and_notify(
				sprintf(
					/* translators: %s: minimum PHP version */
					__( 'Ninja Accessibility requires PHP %s or higher.', 'ninja-accessibility' ),
					PNPNA_PHP_VERSION
				)
			);
		}
	}

	/**
	 * Deactivate the plugin and show a fatal notice to the admin.
	 *
	 * @param string $message Plain-text error description.
	 */
	public static function deactivate_and_notify( string $message ): void {
		deactivate_plugins( plugin_basename( PNPNA_FILE ) );
		wp_die(
			sprintf(
				'<p>%s</p><p><a href="%s">%s</a></p>',
				esc_html( $message ),
				esc_url( admin_url( 'plugins.php' ) ),
				esc_html__( 'Return to Plugins Page', 'ninja-accessibility' )
			),
			esc_html__( 'Plugin Activation Failed', 'ninja-accessibility' ),
			array( 'back_link' => true )
		);
	}

	// -------------------------------------------------------------------------
	// Settings
	// -------------------------------------------------------------------------

	/**
	 * Retrieve all saved settings from the database.
	 *
	 * JSON-encoded sub-arrays (written since 1.0.0) are decoded.
	 * Legacy PHP-serialised values are decoded as a one-time migration path.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_settings(): array {
		$data = get_option( PNPNA_OPTIONS_NAME, array() );

		if ( ! is_array( $data ) ) {
			$data = array();
		}

		$formatted = array();

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$formatted[ $key ] = $value;
				continue;
			}

			if ( ! is_string( $value ) ) {
				$formatted[ $key ] = $value;
				continue;
			}

			// Try JSON first (current storage format).
			$decoded = json_decode( $value, true );
			if ( JSON_ERROR_NONE === json_last_error() && is_array( $decoded ) ) {
				$formatted[ $key ] = $decoded;
				continue;
			}

			// Legacy PHP serialization fallback.
			if ( is_serialized( $value ) ) {
				$unserialized      = maybe_unserialize( $value );
				$formatted[ $key ] = is_array( $unserialized ) ? $unserialized : $value;
				continue;
			}

			$formatted[ $key ] = $value;
		}

		return $formatted;
	}

	/**
	 * Retrieve a single setting value.
	 *
	 * @param string|null $key          Setting key.
	 * @param mixed       $default      Fallback value.
	 * @return mixed
	 */
	public static function get_setting( ?string $key = null, $default = null ) {
		if ( null === $key ) {
			return $default;
		}

		$settings = self::get_settings();

		return $settings[ $key ] ?? $default;
	}

	/**
	 * Persist settings to the database.
	 *
	 * @param array<string, mixed> $data Sanitized settings array.
	 * @return bool
	 */
	public static function update_settings( array $data ): bool {
		return (bool) update_option( PNPNA_OPTIONS_NAME, $data );
	}

	// -------------------------------------------------------------------------
	// Pages
	// -------------------------------------------------------------------------

	/**
	 * Return a label/value list of all published pages.
	 *
	 * @return array<int, array{value: int, label: string}>
	 */
	public static function get_pages(): array {
		$pages = get_pages(
			array(
				'sort_order'  => 'asc',
				'sort_column' => 'post_title',
				'post_status' => 'publish',
			)
		);

		$results = array();

		foreach ( $pages as $page ) {
			$results[] = array(
				'value' => (int) $page->ID,
				'label' => sanitize_text_field( $page->post_title ),
			);
		}

		return $results;
	}

	// -------------------------------------------------------------------------
	// Active widget elements
	// -------------------------------------------------------------------------

	/**
	 * Return the list of capability keys that are currently enabled.
	 *
	 * @return string[]
	 */
	public static function get_active_elements(): array {
		$widget_keys = array(
			'content_scaling',
			'bigger_text',
			'bigger_line_height',
			'letter_spacing',
			'text_align',
			'readable_font',
			'text_magnifier',
			'highlight_links',
			'cursor',
			'page_structure',
			'screen_reader',
			'reading_mask',
			'sitemap',
			'hide_images',
			'pause_animation',
			'mute_sounds',
			'reading_line',
			'outline_focus',
			'grey_scale',
			'contrast',
			'invert_color',
			'brightness',
			'saturation',
		);

		return array_values(
			array_filter(
				$widget_keys,
				static function ( string $key ): bool {
					return '1' === self::get_setting( $key );
				}
			)
		);
	}
}
