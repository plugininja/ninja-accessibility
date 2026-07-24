<?php
/**
 * Uninstall Ninja Accessibility.
 *
 * Fired when the user clicks "Delete" on the plugin list screen.
 * Removes all plugin options, transients, and custom DB data.
 * On multisite, cleans up every subsite plus network-level options.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit( 'Direct access to this file is not allowed.' );

/**
 * Delete all per-site plugin data for the current site context.
 */
function pnpna_uninstall_site_cleanup() {
	global $wpdb;

	// Plugin settings.
	delete_option( 'pnpna_settings' );
	delete_option( 'pnpna_version' );
	delete_option( 'pnpna_install_time' );
	delete_option( 'pnpna_analytics_db_version' );

	// Analytics table (created by the premium version — drop if present).
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}pnpna_analytics" );

	// Legacy option names (pre-1.0 prefix).
	delete_option( 'pnpnd_na_settings' );
	delete_option( 'pnpnd_na_version' );
	delete_option( 'pnpnd_na_install_time' );

	// Plugin transients.
	delete_transient( 'pnpna_cache' );
}

if ( is_multisite() ) {
	// Clean per-site options on every subsite.
	$pnpna_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $pnpna_site_ids as $pnpna_site_id ) {
		switch_to_blog( $pnpna_site_id );
		pnpna_uninstall_site_cleanup();
		restore_current_blog();
	}

	// Network-level options.
	delete_site_option( 'pnpna_settings' );
	delete_site_option( 'pnpna_version' );
	delete_site_option( 'pnpna_install_time' );
} else {
	pnpna_uninstall_site_cleanup();
}
