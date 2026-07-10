<?php
namespace Pnpna\NA\API;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\API\Controllers\Settings;
use Pnpna\NA\Traits\Singleton;

/**
 * Registers all REST API controllers on rest_api_init.
 *
 * REST namespace: ninja-accessibility/v1
 */
class Api_Registry {

	use Singleton;

	/** @var Base_Controller[] */
	private array $controllers = array();

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Instantiate controllers and register their routes.
	 */
	public function register_routes(): void {
		$this->controllers = array(
			'settings' => new Settings(),
		);

		
		/**
		 * Filter the registered REST controllers.
		 *
		 * @param Base_Controller[] $controllers Keyed controller instances.
		 */
		$this->controllers = apply_filters( 'pnpna_rest_controllers', $this->controllers );

		foreach ( $this->controllers as $controller ) {
			if ( $controller instanceof Base_Controller ) {
				$controller->register_routes();
			}
		}
	}
}
