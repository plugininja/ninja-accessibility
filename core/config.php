<?php
defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Plugin version information.
 */
define( 'PNPNA_VERSION', '1.0.0' );
define( 'PNPNA_DB_VERSION', '1.0.0' );
define( 'PNPNA_OPTIONS_VERSION', '1.0.0' );

/**
 * REST API namespace.
 */
define( 'PNPNA_REST_NAMESPACE', 'ninja-accessibility/v1' );

/**
 * Plugin URL paths.
 */
define( 'PNPNA_URL', plugin_dir_url( PNPNA_FILE ) );
define( 'PNPNA_ASSETS', PNPNA_URL . 'assets' );
define( 'PNPNA_ASSETS_PATH', plugin_dir_path( PNPNA_FILE ) . 'assets' );

/**
 * Plugin directory paths.
 */
define( 'PNPNA_PATH', plugin_dir_path( PNPNA_FILE ) );
define( 'PNPNA_APP', PNPNA_PATH . 'app' );
define( 'PNPNA_INCLUDES', PNPNA_PATH . 'includes' );
define( 'PNPNA_TEMPLATES', PNPNA_PATH . 'templates' );

/**
 * Plugin author information.
 */
define( 'PNPNA_AUTHOR', 'Plugininja' );
define( 'PNPNA_AUTHOR_URL', 'https://plugininja.com' );

/**
 * Plugin metadata.
 */
define( 'PNPNA_NAME', 'Ninja Accessibility' );
define( 'PNPNA_SLUG', 'ninja-accessibility' );
define( 'PNPNA_OPTIONS_NAME', 'pnpna_settings' );
define( 'PNPNA_TEXTDOMAIN', 'ninja-accessibility' );
define( 'PNPNA_TEXTDOMAIN_PATH', dirname( plugin_basename( PNPNA_FILE ) ) . '/languages/' );

/**
 * External URLs.
 */
define( 'PNPNA_PLUGIN_URL', 'https://plugininja.com/ninja-accessibility/' );
define( 'PNPNA_DOCUMENTATION_URL', 'https://plugininja.com/docs-category/ninja-accessibility/' );

/**
 * Minimum requirements.
 */
define( 'PNPNA_PHP_VERSION', '7.4' );
define( 'PNPNA_WP_VERSION', '6.2' );

// Load global helpers.
require_once __DIR__ . '/functions.php';
