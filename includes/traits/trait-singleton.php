<?php
namespace Pnpna\NA\Traits;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Singleton trait.
 *
 * Provides a single-instance pattern. Any class using this trait must
 * implement do_hooks() for its WordPress hook registrations.
 */
trait Singleton {

	protected static $instance = null;

	/**
	 * Return the single instance, creating it on first call.
	 *
	 * @return static
	 */
	final public static function get_instance() {
		if ( is_null( static::$instance ) ) {
			static::$instance = new static();
			static::$instance->do_hooks();
		}

		return static::$instance;
	}

	/**
	 * Override in the consuming class to register action / filter hooks.
	 */
	protected function do_hooks(): void {}
}
