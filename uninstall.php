<?php
/**
 * Uninstall Ninja Accessibility.
 *
 * Fired when the user clicks "Delete" on the plugin list screen.
 * Removes all plugin options, transients, and custom DB data.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit( 'Direct access to this file is not allowed.' );

// Delete plugin settings.
delete_option( 'pnpna_settings' );
delete_option( 'pnpna_version' );
delete_option( 'pnpna_install_time' );

// Legacy option names (pre-1.0 prefix).
delete_option( 'pnpnd_na_settings' );
delete_option( 'pnpnd_na_version' );
delete_option( 'pnpnd_na_install_time' );

// Delete any plugin transients.
delete_transient( 'pnpna_cache' );

// Multisite: clean site options too.
if ( is_multisite() ) {
	delete_site_option( 'pnpna_settings' );
	delete_site_option( 'pnpna_version' );
	delete_site_option( 'pnpna_install_time' );
}

// Flush rewrite rules.
flush_rewrite_rules();
