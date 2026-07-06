<?php
namespace Pnpna\NA\Pages;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Registers admin menu pages.
 */
class Admin_Pages {

	/**
	 * Register the top-level menu and sub-pages.
	 */
	public static function register_menu(): void {
		$icon = PNPNA_ASSETS . '/images/logo.svg';

		add_menu_page(
			__( 'Ninja Accessibility', 'ninja-accessibility' ),
			__( 'Accessibility', 'ninja-accessibility' ),
			'manage_options',
			PNPNA_SLUG,
			array( self::class, 'settings_page' ),
			file_exists( $icon ) ? esc_url( PNPNA_ASSETS . '/images/logo.svg' ) : 'dashicons-universal-access',
			65
		);

		add_submenu_page(
			PNPNA_SLUG,
			/* translators: plugin name follows dash */
			sprintf( __( 'Settings – %s', 'ninja-accessibility' ), PNPNA_NAME ),
			__( 'Settings', 'ninja-accessibility' ),
			'manage_options',
			PNPNA_SLUG,
			array( self::class, 'settings_page' )
		);
	}

	/**
	 * Render the React SPA mount point.
	 */
	public static function settings_page(): void {
		echo '<div id="pnpna-admin" class="pnpna-admin pnpna-top-level-wrapper"></div>';
	}
}
