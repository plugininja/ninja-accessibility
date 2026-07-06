<?php
namespace Pnpna\NA\API\Controllers;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpna\NA\API\Base_Controller;
use Pnpna\NA\Security\Input_Validator;
use Pnpna\NA\Utils\Helpers;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * REST controller for plugin settings.
 *
 * Routes (namespace ninja-accessibility/v1):
 *  GET  /settings        → current + default settings
 *  POST /settings        → update settings (allowlist-sanitised)
 *  POST /settings/reset  → restore defaults
 *  GET  /pages           → published pages for selectors
 *  POST /pages           → create a page (e.g. accessibility statement)
 */
class Settings extends Base_Controller {

	public function __construct() {
		parent::__construct( PNPNA_REST_NAMESPACE, 'settings' );
	}

	/**
	 * Register all routes for this controller.
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'has_permission' ),
					'args'                => array(),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'has_permission' ),
					'args'                => array(
						'data' => array(
							'required'    => true,
							'type'        => 'object',
							'description' => __( 'Settings key/value map to persist.', 'ninja-accessibility' ),
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/reset",
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'reset_settings' ),
				'permission_callback' => array( $this, 'has_permission' ),
				'args'                => array(),
			)
		);

		register_rest_route(
			$this->namespace,
			'/pages',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_pages' ),
					'permission_callback' => array( $this, 'has_permission' ),
					'args'                => array(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_page' ),
					'permission_callback' => array( $this, 'can_create_page' ),
					'args'                => array(
						'title'   => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
							'description'       => __( 'Title of the page to create.', 'ninja-accessibility' ),
						),
						'content' => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'wp_kses_post',
							'description'       => __( 'Optional page content (filtered HTML).', 'ninja-accessibility' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Page creation also requires publish_pages.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_create_page() {
		$permission = $this->has_permission();

		if ( true !== $permission ) {
			return $permission;
		}

		if ( ! current_user_can( 'publish_pages' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to create pages.', 'ninja-accessibility' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}

	/**
	 * GET /settings
	 */
	public function get_settings( WP_REST_Request $request ): WP_REST_Response {
		return $this->success_response(
			array(
				'settings' => Helpers::get_settings(),
				'defaults' => pnpna_default_settings(),
			),
			__( 'Settings fetched successfully.', 'ninja-accessibility' )
		);
	}

	/**
	 * POST /settings
	 */
	public function update_settings( WP_REST_Request $request ): WP_REST_Response {
		$raw = $request->get_param( 'data' );

		if ( empty( $raw ) || ! is_array( $raw ) ) {
			return $this->error_response(
				__( 'Invalid data received.', 'ninja-accessibility' ),
				self::HTTP_BAD_REQUEST
			);
		}

		$sanitized = Input_Validator::sanitize_settings( $raw );

		if ( empty( $sanitized ) ) {
			return $this->error_response(
				__( 'No valid settings data provided.', 'ninja-accessibility' ),
				self::HTTP_BAD_REQUEST
			);
		}

		// Merge over existing values so partial updates are safe.
		$merged = array_merge( Helpers::get_settings(), $sanitized );
		$saved  = Helpers::update_settings( $merged );

		if ( false === $saved && $merged !== Helpers::get_settings() ) {
			return $this->error_response(
				__( 'Something went wrong while saving settings.', 'ninja-accessibility' ),
				self::HTTP_INTERNAL_SERVER_ERROR
			);
		}

		/**
		 * Fires after plugin settings have been updated via the REST API.
		 *
		 * @param array $sanitized The sanitised values that were written.
		 */
		do_action( 'pnpna_settings_updated', $sanitized );

		return $this->success_response(
			array( 'settings' => Helpers::get_settings() ),
			__( 'Settings updated successfully.', 'ninja-accessibility' )
		);
	}

	/**
	 * POST /settings/reset
	 */
	public function reset_settings( WP_REST_Request $request ): WP_REST_Response {
		$defaults = pnpna_default_settings();
		Helpers::update_settings( $defaults );

		/** This action is documented in includes/api/controllers/class-settings.php */
		do_action( 'pnpna_settings_updated', $defaults );

		return $this->success_response(
			array( 'settings' => $defaults ),
			__( 'Settings reset to defaults.', 'ninja-accessibility' )
		);
	}

	/**
	 * GET /pages
	 */
	public function get_pages( WP_REST_Request $request ): WP_REST_Response {
		return $this->success_response(
			array( 'pages' => Helpers::get_pages() ),
			__( 'Pages fetched successfully.', 'ninja-accessibility' )
		);
	}

	/**
	 * POST /pages
	 */
	public function create_page( WP_REST_Request $request ): WP_REST_Response {
		$title   = (string) $request->get_param( 'title' );
		$content = (string) $request->get_param( 'content' );

		if ( '' === trim( $title ) ) {
			return $this->error_response(
				__( 'Page title is required.', 'ninja-accessibility' ),
				self::HTTP_BAD_REQUEST
			);
		}

		$page_id = wp_insert_post(
			array(
				'post_title'   => $title,
				'post_content' => $content,
				'post_status'  => 'publish',
				'post_type'    => 'page',
			),
			true
		);

		if ( is_wp_error( $page_id ) ) {
			return $this->error_response(
				$page_id->get_error_message(),
				self::HTTP_INTERNAL_SERVER_ERROR
			);
		}

		return $this->success_response(
			array(
				'page_id'  => $page_id,
				'page_url' => get_permalink( $page_id ),
			),
			__( 'Page created successfully.', 'ninja-accessibility' ),
			array(),
			self::HTTP_CREATED
		);
	}
}
