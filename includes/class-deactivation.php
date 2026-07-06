<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Fired on plugin deactivation.
 *
 * Does NOT delete any data — that happens in uninstall.php.
 */
class Deactivation {

	/**
	 * Run deactivation tasks.
	 */
	public static function init(): void {
		flush_rewrite_rules();
	}
}
