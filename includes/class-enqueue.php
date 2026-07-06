<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\Traits\Singleton;
use Pnpna\NA\Utils\Helpers;

/**
 * Handles all script and style enqueueing for admin and frontend.
 */
class Enqueue {

	use Singleton;

	/**
	 * Register WordPress hooks.
	 */
	protected function do_hooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_enqueue' ) );
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Enqueue or register a CSS file.
	 *
	 * @param string   $handle Asset handle (without plugin prefix).
	 * @param string[] $deps   Dependency handles.
	 * @param array    $args   Optional overrides: ver, folder, type.
	 */
	private function style( string $handle, array $deps = array(), array $args = array() ): void {
		$defaults = array(
			'ver'    => PNPNA_VERSION,
			'folder' => 'css',
			'type'   => 'enqueue',
		);

		$args = wp_parse_args( $args, $defaults );

		$file_path   = PNPNA_ASSETS . "/{$args['folder']}/{$handle}.css";
		$full_handle = 'pnpna-' . $handle;

		if ( 'enqueue' === $args['type'] ) {
			wp_enqueue_style( $full_handle, $file_path, $deps, $args['ver'] );
		} elseif ( 'register' === $args['type'] ) {
			wp_register_style( $full_handle, $file_path, $deps, $args['ver'] );
		}
	}

	/**
	 * Enqueue or register a JS file; reads the .asset.php manifest when present.
	 *
	 * @param string   $handle Asset handle (without plugin prefix).
	 * @param string[] $deps   Additional dependency handles.
	 * @param array    $args   Optional overrides: ver, folder, in_footer, type.
	 */
	private function script( string $handle, array $deps = array(), array $args = array() ): void {
		$defaults = array(
			'ver'       => PNPNA_VERSION,
			'folder'    => 'js',
			'in_footer' => true,
			'type'      => 'enqueue',
		);

		$args = wp_parse_args( $args, $defaults );

		$asset_manifest = PNPNA_ASSETS_PATH . "/js/{$handle}.asset.php";
		$file_path      = PNPNA_ASSETS . "/{$args['folder']}/{$handle}.js";

		if ( file_exists( $asset_manifest ) ) {
			$asset = include $asset_manifest;
			$deps  = array_unique( array_merge( $deps, $asset['dependencies'] ) );

			if ( defined( 'WP_ENVIRONMENT_TYPE' ) && 'local' === WP_ENVIRONMENT_TYPE ) {
				$args['ver'] = $asset['version'];
			}
		}

		$full_handle = 'pnpna-' . $handle;

		if ( 'enqueue' === $args['type'] ) {
			wp_enqueue_script( $full_handle, $file_path, $deps, $args['ver'], $args['in_footer'] );
		} elseif ( 'register' === $args['type'] ) {
			wp_register_script( $full_handle, $file_path, $deps, $args['ver'], $args['in_footer'] );
		}
	}

	/**
	 * Register a webpack chunk script (runtime / vendors / shared) when built.
	 *
	 * Chunks are optional — webpack only emits them when needed — so missing
	 * files are skipped and dependency lists are filtered accordingly.
	 *
	 * @param string   $handle Asset handle (without plugin prefix).
	 * @param string[] $deps   Dependency handles.
	 */
	private function r_script( string $handle, array $deps = array() ): void {
		if ( ! file_exists( PNPNA_ASSETS_PATH . "/js/{$handle}.js" ) ) {
			return;
		}

		$this->script( $handle, $this->registered_only( $deps ), array( 'type' => 'register' ) );
	}

	/**
	 * Filter a dependency list down to handles that are actually registered.
	 *
	 * @param string[] $deps Dependency handles.
	 * @return string[]
	 */
	private function registered_only( array $deps ): array {
		return array_values(
			array_filter(
				$deps,
				static function ( string $dep ): bool {
					return 0 !== strpos( $dep, 'pnpna-' ) || wp_script_is( $dep, 'registered' );
				}
			)
		);
	}

	// -------------------------------------------------------------------------
	// Public callbacks
	// -------------------------------------------------------------------------

	/**
	 * Enqueue assets on the plugin's admin page only.
	 *
	 * @param string $hook Current admin page hook suffix.
	 */
	public function admin_enqueue( string $hook ): void {
		$plugin_page = 'toplevel_page_' . PNPNA_SLUG;
		if ( $hook !== $plugin_page ) {
			return;
		}

		$this->common_scripts( $hook, 'admin' );

		$this->script( 'settings', array( 'pnpna-common' ) );
		$this->style( 'settings' );
		$this->style( 'admin' );

		wp_set_script_translations( 'pnpna-settings', 'ninja-accessibility', PNPNA_PATH . 'languages' );
	}

	/**
	 * Enqueue frontend accessibility widget assets.
	 */
	public function frontend_enqueue(): void {
		// Nothing to load when the widget and cursor are both disabled.
		$widget_on = '1' === Helpers::get_setting( 'enable_widget', '1' );
		$cursor_on = '1' === Helpers::get_setting( 'enable_mouse_customization', '0' );

		if ( ! $widget_on && ! $cursor_on ) {
			return;
		}

		$this->common_scripts( '', 'frontend' );

		if ( $widget_on ) {
			$this->script( 'frontend', array( 'pnpna-common' ) );
			$this->style( 'frontend' );
			wp_set_script_translations( 'pnpna-frontend', 'ninja-accessibility', PNPNA_PATH . 'languages' );
		}

		if ( $cursor_on ) {
			$this->script( 'mouse-settings', array( 'pnpna-common' ) );
		}
	}

	/**
	 * Enqueue shared scripts and localise the global JS object.
	 *
	 * @param string $hook    Current page hook suffix.
	 * @param string $context 'admin' or 'frontend'.
	 */
	public function common_scripts( string $hook, string $context = 'admin' ): void {
		if ( 'admin' === $context ) {
			wp_enqueue_media();
		}

		// Webpack chunk chain (ninja-drive pattern): runtime → vendors → shared.
		$this->r_script( 'runtime' );
		$this->r_script( 'vendors', array( 'pnpna-runtime' ) );
		$this->r_script( 'shared', array( 'pnpna-runtime', 'pnpna-vendors' ) );

		$this->script( 'common', $this->registered_only( array( 'pnpna-runtime', 'pnpna-vendors', 'pnpna-shared' ) ) );

		wp_localize_script( 'pnpna-common', 'pnpna', $this->get_localize_data( $hook, $context ) );
	}

	/**
	 * Build the localisation data array for the JS global.
	 *
	 * @param string $hook    Current page hook suffix.
	 * @param string $context 'admin' or 'frontend'.
	 * @return array<string, mixed>
	 */
	private function get_localize_data( string $hook, string $context ): array {
		$data = array(
			'restUrl'    => esc_url_raw( rest_url( PNPNA_REST_NAMESPACE . '/' ) ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),
			'siteUrl'    => site_url(),
			'pluginUrl'  => PNPNA_URL,
			'assetsUrl'  => PNPNA_ASSETS,
			'version'    => PNPNA_VERSION,
			'pluginName' => PNPNA_NAME,
			'isAdmin'    => is_admin(),
			'isPro'      => false,
			'is_pro'     => false,
		);

		if ( 'frontend' === $context ) {
			// Inline everything the widget needs — no HTTP round-trip and it
			// works for logged-out visitors (no REST nonce required).
			$data['activeElements'] = Helpers::get_active_elements();
			$data['cursorEffect']   = (string) Helpers::get_setting( 'cursor_effect_type', 'none' );
			$data['statementUrl']   = esc_url( (string) Helpers::get_setting( 'statement_url', '' ) );
			$data['showBranding']   = '1' === Helpers::get_setting( 'show_branding', '1' );
			$data['language']       = sanitize_key( (string) Helpers::get_setting( 'widget_language', 'en' ) );
			// The frontend never talks to the REST API; do not expose a nonce.
			unset( $data['nonce'] );
		}

		/**
		 * Filter the JS localisation data.
		 *
		 * @param array<string, mixed> $data    Localisation data.
		 * @param string               $hook    Current page hook suffix.
		 * @param string               $context 'admin' or 'frontend'.
		 */
		return apply_filters( 'pnpna_localize_data', $data, $hook, $context );
	}
}
