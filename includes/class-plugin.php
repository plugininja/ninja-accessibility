<?php
namespace Pnpna\NA;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\API\Api_Registry;
use Pnpna\NA\Traits\Singleton;

/**
 * Main plugin bootstrap class.
 *
 * Instantiates all subsystems and registers global hooks.
 */
class Plugin {

	use Singleton;

	public function __construct() {
		$this->init();
	}

	/**
	 * Boot all subsystems.
	 */
	private function init(): void {
		Security\Svg_Sanitizer::get_instance();
		Enqueue::get_instance();
		Admin::get_instance();
		Api_Registry::get_instance();
		App_Settings::get_instance();
	}

	/**
	 * Register WordPress action / filter hooks.
	 */
	protected function do_hooks(): void {
		add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
		add_filter( 'plugin_action_links_' . plugin_basename( PNPNA_FILE ), array( $this, 'action_links' ) );
	}

	/**
	 * Add documentation link to the plugin row on the Plugins screen.
	 *
	 * @param string[] $links Existing row-meta links.
	 * @param string   $file  Plugin basename.
	 * @return string[]
	 */
	public function plugin_row_meta( array $links, string $file ): array {
		if ( plugin_basename( PNPNA_FILE ) === $file ) {
			$links[] = sprintf(
				'<a target="_blank" href="%s">%s</a>',
				esc_url( PNPNA_DOCUMENTATION_URL ),
				esc_html__( 'Docs & FAQs', 'ninja-accessibility' )
			);
		}

		return $links;
	}

	/**
	 * Add a Settings link on the Plugins screen.
	 *
	 * @param string[] $links Existing action links.
	 * @return string[]
	 */
	public function action_links( array $links ): array {
		$links[] = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'admin.php?page=' . PNPNA_SLUG ) ),
			esc_html__( 'Settings', 'ninja-accessibility' )
		);

		return $links;
	}
}
