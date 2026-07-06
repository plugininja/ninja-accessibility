<?php

/**
 * Plugin Name:       Ninja Accessibility
 * Plugin URI:        https://plugininja.com/ninja-accessibility/
 * Description:       Helps visitors with disabilities improve readability, visual comfort, cursor customization, and more.
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

define('PNPNA_FILE', __FILE__);

require_once plugin_dir_path(PNPNA_FILE) . 'core/config.php';
require_once plugin_dir_path(PNPNA_FILE) . 'includes/class-autoloader.php';

Autoloader::register();

register_activation_hook(__FILE__, array( Activation::class, 'init' ));
register_deactivation_hook(__FILE__, array( Deactivation::class, 'init' ));

Plugin::get_instance();
