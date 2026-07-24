<?php

/**
 * Plugin Name:       Ninja Accessibility & Custom Cursor
 * Plugin URI:        https://plugininja.com/ninja-accessibility/
 * Description:       Helps visitors with disabilities improve readability, visual comfort, cursor customization, and more
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Plugininja
 * Author URI:        https://plugininja.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ninja-accessibility
 * Domain Path:       /languages/
 */

namespace Pnpna;

use Pnpna\NA\Activation;
use Pnpna\NA\Autoloader;
use Pnpna\NA\Deactivation;
use Pnpna\NA\Plugin;

defined('ABSPATH') || exit('Direct access to this file is not allowed.');

if (function_exists('\Pnpna\pnpna_fs')) {
    pnpna_fs()->set_basename(true, __FILE__);
} else {
    define('PNPNA_FILE', __FILE__);

    require_once plugin_dir_path(PNPNA_FILE) . 'core/config.php';
    require_once plugin_dir_path(PNPNA_FILE) . 'includes/class-autoloader.php';

    Autoloader::register();

    if (! function_exists('\Pnpna\pnpna_fs') && file_exists(__DIR__ . '/freemius/start.php')) {
        /**
         * Freemius SDK access helper.
         *
         * @return \Freemius
         */
        function pnpna_fs()
        {
            global $pnpna_fs;

            if (! isset($pnpna_fs)) {

                if (! class_exists('Freemius')) {
                    require_once __DIR__ . '/freemius/start.php';
                }

                $pnpna_fs = fs_dynamic_init([
                    'id'                  => '34824',
                    'slug'                => 'ninja-accessibility',
                    'type'                => 'plugin',
                    'public_key'          => 'pk_48c3ea0e760dd5d43c2229fbe6da2',
                    'is_premium'          => false,
                    'premium_suffix'      => 'Premium',
                    // If your plugin is a serviceware, set this option to false.
                    'has_premium_version' => true,
                    'has_addons'          => false,
                    'has_paid_plans'      => false,
                    'is_org_compliant'    => true,
                    'menu'                => [
                        'slug'    => 'ninja-accessibility',
                        'support' => false,
                    ],
                ]);
            }

            return $pnpna_fs;
        }

        pnpna_fs();
        do_action('pnpna_loaded');
    }

    register_activation_hook(__FILE__, [ Activation::class, 'init' ]);
    register_deactivation_hook(__FILE__, [ Deactivation::class, 'init' ]);

    Plugin::get_instance();
}
