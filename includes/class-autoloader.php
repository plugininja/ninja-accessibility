<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * PSR-4-style autoloader for the Pnpna\NA namespace.
 *
 * Supports both WordPress kebab-case filenames (class-my-class.php)
 * and standard PascalCase filenames (MyClass.php).
 */
final class Autoloader {

	/** @var array<string, string[]>|null */
	private static ?array $autoload_paths = null;

	/**
	 * Register the autoloader with spl_autoload_register.
	 */
	public static function register(): void {
		spl_autoload_register( array( self::class, 'load_class' ) );
	}

	/**
	 * Attempt to load a class file.
	 *
	 * @param string $class_name Fully-qualified class name.
	 */
	private static function load_class( string $class_name ): void {
		$prefixes = self::get_autoload_paths();

		foreach ( $prefixes as $prefix => $dirs ) {
			if ( ! self::starts_with( $class_name, $prefix ) ) {
				continue;
			}

			$relative_class = substr( $class_name, strlen( $prefix ) );

			if ( empty( $relative_class ) ) {
				continue;
			}

			foreach ( self::generate_file_paths( $relative_class ) as $file_path ) {
				foreach ( $dirs as $dir ) {
					$full_path = rtrim( $dir, DIRECTORY_SEPARATOR ) . DIRECTORY_SEPARATOR . $file_path;
					if ( is_file( $full_path ) ) {
						require_once $full_path;
						return;
					}
				}
			}
		}
	}

	/**
	 * Generate candidate file paths for a relative class name.
	 *
	 * Produces both PascalCase and WordPress kebab-case filenames so the
	 * autoloader can resolve either convention.
	 *
	 * @param string $relative_class Class name relative to the namespace prefix.
	 * @return string[]
	 */
	private static function generate_file_paths( string $relative_class ): array {
		$parts      = explode( '\\', $relative_class );
		$class_name = array_pop( $parts );

		// Candidate sub-paths: original namespace case first, then lowercase variants — the filesystem may be case-sensitive.
		$sub_paths = array( '' );
		if ( ! empty( $parts ) ) {
			$original    = implode( DIRECTORY_SEPARATOR, $parts ) . DIRECTORY_SEPARATOR;
			$last_lower  = $parts;
			$last_index  = count( $last_lower ) - 1;
			$last_lower[ $last_index ] = strtolower( $last_lower[ $last_index ] );
			$sub_paths   = array_unique(
				array(
					$original,
					implode( DIRECTORY_SEPARATOR, $last_lower ) . DIRECTORY_SEPARATOR,
					strtolower( $original ),
				)
			);
		}

		$is_trait  = ! empty( $parts ) && ( in_array( 'Traits', $parts, true ) || in_array( 'traits', $parts, true ) );
		$wp_prefix = $is_trait ? 'trait-' : 'class-';
		$kebab     = self::to_kebab_case( $class_name );

		$paths = array();
		foreach ( $sub_paths as $sub_path ) {
			$paths[] = $sub_path . $class_name . '.php';
			$paths[] = $sub_path . $wp_prefix . $kebab . '.php';
		}

		return $paths;
	}

	/**
	 * Convert a PascalCase / CamelCase class name to kebab-case.
	 *
	 * @param string $text
	 * @return string
	 */
	private static function to_kebab_case( string $text ): string {
		// Preserve Freemius premium suffix markers verbatim, so
		// Analytics__premium_only resolves to class-analytics__premium_only.php.
		$text = str_replace(
			array( '__premium_only', '__premium_ui' ),
			array( "\x00", "\x01" ),
			$text
		);
		$text = preg_replace( '/([A-Z]+)/', '-$1', lcfirst( $text ) );
		$text = strtolower( $text );
		$text = str_replace( '_', '-', $text );
		$text = preg_replace( '/-+/', '-', $text );
		$text = ltrim( $text, '-' );

		return str_replace(
			array( "\x00", "\x01" ),
			array( '__premium_only', '__premium_ui' ),
			$text
		);
	}

	/**
	 * Check whether a string starts with a given prefix.
	 *
	 * @param string $haystack
	 * @param string $needle
	 * @return bool
	 */
	private static function starts_with( string $haystack, string $needle ): bool {
		return function_exists( 'str_starts_with' )
			? str_starts_with( $haystack, $needle )
			: 0 === strpos( $haystack, $needle );
	}

	/**
	 * Namespace → directory map.
	 *
	 * @return array<string, string[]>
	 */
	private static function get_autoload_paths(): array {
		if ( null === self::$autoload_paths ) {
			self::$autoload_paths = array(
				'Pnpna\\NA\\App\\'  => array( PNPNA_APP ),
				'Pnpna\\NA\\'       => array( PNPNA_INCLUDES ),
			);
		}

		return self::$autoload_paths;
	}
}
