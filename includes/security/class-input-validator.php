<?php
namespace Pnpna\NA\Security;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Centralises settings-input validation and sanitisation.
 *
 * - Provides an explicit allowlist of known settings keys.
 * - Strips unknown keys from incoming data.
 * - Sanitises each value according to its declared type.
 * - Returned array is safe to pass to update_option().
 */
class Input_Validator {

	/**
	 * Known settings keys mapped to their expected value types.
	 *
	 * Supported types:
	 *   'bool'     → '1' or '0'
	 *   'text'     → sanitize_text_field()
	 *   'hex'      → CSS hex colour
	 *   'posint'   → positive integer string
	 *   'url'      → same-site URL
	 *   'array'    → recursively sanitised, stored as JSON
	 *   'position' → one of the POSITION_VALUES set
	 *   'effect'   → one of the EFFECT_VALUES set
	 *   'apply'    → one of the APPLY_VALUES set (or page ID)
	 *
	 * @var array<string, string>
	 */
	private static array $allowed_keys = array(
		// General.
		'enable_widget'              => 'bool',
		'widget_language'            => 'text',

		// Design.
		'icon_size'                  => 'text',
		'widget_icon'                => 'array',
		'custom_widget_icons'        => 'array',
		'icon_corner_radius'         => 'posint',
		'icon_bg_color'              => 'hex',
		'show_icon_desktop'          => 'bool',
		'show_icon_tablet'           => 'bool',
		'show_icon_phone'            => 'bool',
		'desktop_icon_position'      => 'position',
		'tablet_icon_position'       => 'position',
		'phone_icon_position'        => 'position',
		'exact_position_desktop'     => 'bool',
		'exact_position_tablet'      => 'bool',
		'exact_position_phone'       => 'bool',
		'exact_position_desktop_x'   => 'posint',
		'exact_position_desktop_y'   => 'posint',
		'exact_position_tablet_x'    => 'posint',
		'exact_position_tablet_y'    => 'posint',
		'exact_position_phone_x'     => 'posint',
		'exact_position_phone_y'     => 'posint',

		// Capabilities.
		'content_scaling'            => 'bool',
		'bigger_text'                => 'bool',
		'bigger_line_height'         => 'bool',
		'letter_spacing'             => 'bool',
		'text_align'                 => 'bool',
		'readable_font'              => 'bool',
		'text_magnifier'             => 'bool',
		'highlight_links'            => 'bool',
		'cursor'                     => 'bool',
		'page_structure'             => 'bool',
		'screen_reader'              => 'bool',
		'reading_mask'               => 'bool',
		'sitemap'                    => 'bool',
		'hide_images'                => 'bool',
		'pause_animation'            => 'bool',
		'mute_sounds'                => 'bool',
		'reading_line'               => 'bool',
		'outline_focus'              => 'bool',
		'grey_scale'                 => 'bool',
		'contrast'                   => 'bool',
		'invert_color'               => 'bool',
		'brightness'                 => 'bool',
		'saturation'                 => 'bool',
		'show_branding'              => 'bool',
		'skip_main_content'          => 'bool',

		// Mouse customization.
		'enable_mouse_customization' => 'bool',
		'cursor_icon'                => 'array',
		'custom_cursor_icons'        => 'array',
		'cursor_color'               => 'hex',
		'cursor_size'                => 'posint',
		'apply_cursor'               => 'apply',
		'cursor_effect_type'         => 'effect',
				'cursor_css_selectors'       => 'selector',
		'hide_cursor_on_mobile'      => 'bool',

		// Accessibility statement.
		'statement_url'              => 'exturl',
		'statement_page_id'          => 'posint',
	);

	/** Allowed icon-position values. */
	private const POSITION_VALUES = array(
		'top-left',
		'top-right',
		'bottom-left',
		'bottom-right',
		'bottom-center',
		'top-center',
	);

	/** Allowed cursor-effect identifiers. */
	private const EFFECT_VALUES = array(
		'none',
		'bubbles',
		'clockHand',
		'emojiCursor',
		'fairyDust',
		'followingDot',
		'ghost',
		'nyanCat',
		'rainbowCursor',
		'snowflake',
		'springyEmoji',
		'textFlag',
		'trailingCursor',
	);

	/** Allowed apply-cursor scope values. */
	private const APPLY_VALUES = array(
		'entire_website',
		'all',
	);

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	/**
	 * Return the allowed keys map.
	 *
	 * @return array<string, string>
	 */
	public static function get_allowed_keys(): array {
		return self::$allowed_keys;
	}

	/**
	 * Sanitise and filter an incoming settings array.
	 *
	 * Unknown keys are silently dropped. Each value is sanitised per its type.
	 *
	 * @param array<mixed, mixed> $raw Raw associative array from user input.
	 * @return array<string, mixed> Sanitised settings array.
	 */
	public static function sanitize_settings( array $raw ): array {
		$clean = array();

		foreach ( $raw as $key => $value ) {
			$safe_key = sanitize_key( (string) $key );
			if ( ! array_key_exists( $safe_key, self::$allowed_keys ) ) {
				continue;
			}

			$type              = self::$allowed_keys[ $safe_key ];
			$clean[ $safe_key ] = self::sanitize_value( $value, $type, $safe_key );
		}

		return $clean;
	}

	/**
	 * Validate a CSS hex colour, returning the sanitised value or ''.
	 *
	 * @param string $color
	 * @return string
	 */
	public static function sanitize_hex_color( string $color ): string {
		$color = sanitize_text_field( $color );

		if ( preg_match( '/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/', $color, $m ) ) {
			return '#' . $m[1];
		}

		return '';
	}

	/**
	 * Check whether a URL belongs to the current site.
	 *
	 * @param string $url
	 * @return bool
	 */
	public static function is_same_site_url( string $url ): bool {
		$url       = esc_url_raw( $url );
		$site_host = wp_parse_url( home_url(), PHP_URL_HOST );
		$url_host  = wp_parse_url( $url, PHP_URL_HOST );

		return ! empty( $url_host ) && $url_host === $site_host;
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Dispatch a single value to the appropriate sanitiser.
	 *
	 * @param mixed  $value
	 * @param string $type
	 * @param string $key   Settings key (for context-specific logic).
	 * @return mixed
	 */
	private static function sanitize_value( $value, string $type, string $key ) {
		switch ( $type ) {
			case 'bool':
				return self::sanitize_bool( $value );

			case 'text':
				return sanitize_text_field( (string) $value );

			case 'hex':
				return self::sanitize_hex_color( (string) $value );

			case 'posint':
				$int = (int) $value;
				return $int >= 0 ? (string) $int : '0';

			case 'url':
				$url = esc_url_raw( (string) $value );
				return self::is_same_site_url( $url ) ? $url : '';

			case 'exturl':
				$url = esc_url_raw( (string) $value, array( 'http', 'https' ) );
				return $url ? $url : '';

			case 'selector':
				return self::sanitize_css_selectors( (string) $value );

			case 'array':
				if ( is_array( $value ) ) {
					return self::sanitize_array( $value, $key );
				}
				if ( is_string( $value ) ) {
					$decoded = json_decode( wp_unslash( $value ), true );
					if ( is_array( $decoded ) ) {
						return self::sanitize_array( $decoded, $key );
					}
				}
				return array();

			case 'position':
				$val = sanitize_text_field( (string) $value );
				return in_array( $val, self::POSITION_VALUES, true ) ? $val : 'bottom-right';

			case 'effect':
				$val = sanitize_text_field( (string) $value );
				return in_array( $val, self::EFFECT_VALUES, true ) ? $val : 'none';

			
			case 'apply':
				$val = sanitize_text_field( (string) $value );
				if ( in_array( $val, self::APPLY_VALUES, true ) ) {
					return $val;
				}
				if ( is_numeric( $val ) && (int) $val > 0 ) {
					return (string) (int) $val;
				}
				return 'entire_website';

			default:
				return sanitize_text_field( (string) $value );
		}
	}

	/**
	 * Sanitise a comma-separated CSS selector list.
	 *
	 * Allows element, class, id, and combinator selectors only —
	 * braces, quotes, parentheses, and other CSS syntax are rejected.
	 *
	 * @param string $value
	 * @return string
	 */
	private static function sanitize_css_selectors( string $value ): string {
		$safe = array();

		foreach ( explode( ',', sanitize_text_field( $value ) ) as $selector ) {
			$selector = trim( $selector );

			if ( '' !== $selector && preg_match( '/^[a-zA-Z0-9_\-\.\#\s\>\+\~\*]+$/', $selector ) ) {
				$safe[] = $selector;
			}
		}

		return implode( ', ', $safe );
	}

	/**
	 * Normalise a boolean-ish value to '1' or '0'.
	 *
	 * @param mixed $value
	 * @return string
	 */
	private static function sanitize_bool( $value ): string {
		if ( true === $value || 1 === $value || '1' === $value || 'true' === $value ) {
			return '1';
		}

		return '0';
	}

	/**
	 * Recursively sanitise an array setting value.
	 *
	 * @param array<mixed, mixed> $value
	 * @param string              $key   Parent settings key.
	 * @return array<string, mixed>
	 */
	private static function sanitize_array( array $value, string $key ): array {
		$is_icon_array = in_array(
			$key,
			array( 'widget_icon', 'cursor_icon', 'custom_widget_icons', 'custom_cursor_icons' ),
			true
		);

		$clean = array();

		foreach ( $value as $k => $v ) {
			$clean_key = sanitize_key( (string) $k );

			if ( is_array( $v ) ) {
				$clean[ $clean_key ] = self::sanitize_array( $v, $key );
				continue;
			}

			if ( $is_icon_array ) {
				switch ( $clean_key ) {
					case 'id':
						$clean[ $clean_key ] = sanitize_text_field( (string) $v );
						break;
					case 'icon':
					case 'url':
						$str = sanitize_text_field( (string) $v );
						$clean[ $clean_key ] = filter_var( $str, FILTER_VALIDATE_URL )
							? ( self::is_same_site_url( $str ) ? esc_url_raw( $str ) : '' )
							: $str;
						break;
					default:
						$clean[ $clean_key ] = sanitize_text_field( (string) $v );
				}
			} else {
				$clean[ $clean_key ] = sanitize_text_field( (string) $v );
			}
		}

		return $clean;
	}
}
