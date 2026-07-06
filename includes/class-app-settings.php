<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\App\Display;
use Pnpna\NA\App\Mouse_Customization;
use Pnpna\NA\Traits\Singleton;
use Pnpna\NA\Utils\Helpers;

/**
 * Merges saved settings with defaults and boots the front-facing subsystems.
 */
class App_Settings {

	use Singleton;

	/** @var array<string, mixed> */
	private array $params = array();

	/** @var array<string, mixed> */
	private array $defaults = array();

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		$this->defaults = pnpna_default_settings();
		$saved          = Helpers::get_settings();
		$this->params   = wp_parse_args( $saved, $this->defaults );

		$this->boot();
	}

	/**
	 * Boot front-end subsystems based on current settings.
	 */
	private function boot(): void {
		// Display the widget unless it is explicitly disabled.
		if ( '1' === ( $this->params['enable_widget'] ?? '1' ) ) {
			Display::get_instance();
		}

		// Boot mouse customization only when the user has turned it on.
		if ( '1' === ( $this->params['enable_mouse_customization'] ?? '0' ) ) {
			Mouse_Customization::get_instance();
		}
	}

	/**
	 * Return the merged settings array.
	 *
	 * @return array<string, mixed>
	 */
	public function get_params(): array {
		return $this->params;
	}

	/**
	 * Return the raw defaults array.
	 *
	 * @return array<string, mixed>
	 */
	public function get_defaults(): array {
		return $this->defaults;
	}
}
