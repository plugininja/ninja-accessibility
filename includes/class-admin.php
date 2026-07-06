<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Pages\Admin_Pages;
use Pnpna\NA\Traits\Singleton;

/**
 * Registers admin-area hooks.
 */
class Admin {

	use Singleton;

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		add_action( 'admin_menu', array( Admin_Pages::class, 'register_menu' ) );
	}
}
