<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Utils\Helpers;

/**
 * Fired on plugin activation.
 */
class Activation {

	/**
	 * Run activation tasks.
	 */
	public static function init(): void {
		Helpers::check_requirements();
		self::set_default_settings();

		if ( class_exists( Analytics__premium_only::class ) ) {
			Analytics__premium_only::create_table();
		}

		flush_rewrite_rules();
	}

	/**
	 * Seed default settings and version markers on first install.
	 */
	private static function set_default_settings(): void {
		if ( ! get_option( 'pnpna_version' ) ) {
			update_option( 'pnpna_version', PNPNA_VERSION );
		}

		if ( ! get_option( 'pnpna_install_time' ) ) {
			update_option( 'pnpna_install_time', current_time( 'mysql' ) );
		}

		if ( ! get_option( PNPNA_OPTIONS_NAME ) ) {
			update_option( PNPNA_OPTIONS_NAME, pnpna_default_settings() );
		}
	}
}
