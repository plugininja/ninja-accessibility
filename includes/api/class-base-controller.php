<?php
namespace Pnpna\NA\API;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Base REST controller for all Ninja Accessibility endpoints.
 *
 * Follows the ninja-drive API pattern:
 *  - Namespace passed via constructor.
 *  - success_response() / error_response() envelope helpers.
 *  - has_permission() capability gate for admin endpoints.
 */
abstract class Base_Controller extends WP_REST_Controller {

	protected const HTTP_OK                    = 200;
	protected const HTTP_CREATED               = 201;
	protected const HTTP_BAD_REQUEST           = 400;
	protected const HTTP_UNAUTHORIZED          = 401;
	protected const HTTP_FORBIDDEN             = 403;
	protected const HTTP_NOT_FOUND             = 404;
	protected const HTTP_INTERNAL_SERVER_ERROR = 500;

	/**
	 * @param string $api_namespace REST namespace (e.g. 'ninja-accessibility/v1').
	 * @param string $rest_base     Route base (e.g. 'settings').
	 */
	public function __construct( string $api_namespace, string $rest_base ) {
		$this->namespace = $api_namespace;
		$this->rest_base = "/{$rest_base}";
	}

	/**
	 * Subclasses must register their own routes.
	 */
	public function register_routes(): void {
		_doing_it_wrong(
			__METHOD__,
			esc_html__( 'Subclasses must override register_routes().', 'ninja-accessibility' ),
			'1.0.0'
		);
	}

	/**
	 * Default permission gate: site administrators only.
	 *
	 * @return bool|WP_Error
	 */
	public function has_permission() {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		return new WP_Error(
			'rest_forbidden',
			__( 'You do not have permission to perform this action.', 'ninja-accessibility' ),
			array( 'status' => rest_authorization_required_code() )
		);
	}

	/**
	 * Build a success envelope.
	 *
	 * @param mixed  $data    Response payload.
	 * @param string $message Human-readable message.
	 * @param array  $meta    Optional meta.
	 * @param int    $status  HTTP status code.
	 */
	protected function success_response( $data, string $message = '', array $meta = array(), int $status = self::HTTP_OK ): WP_REST_Response {
		$response_data = array(
			'success' => true,
			'message' => $message,
			'data'    => $data,
		);

		if ( ! empty( $meta ) ) {
			$response_data['meta'] = $meta;
		}

		return new WP_REST_Response( $response_data, $status );
	}

	/**
	 * Build an error envelope.
	 *
	 * @param string $message Human-readable message.
	 * @param int    $status  HTTP status code.
	 * @param array  $extra   Optional extra payload.
	 */
	protected function error_response( string $message, int $status = self::HTTP_BAD_REQUEST, array $extra = array() ): WP_REST_Response {
		$response_data = array(
			'success' => false,
			'message' => $message,
		);

		if ( ! empty( $extra ) ) {
			$response_data['extra'] = $extra;
		}

		return new WP_REST_Response( $response_data, $status );
	}

	/**
	 * Convert an exception / WP_Error into an error response.
	 *
	 * @param \Throwable $e               Caught throwable.
	 * @param string     $default_message Fallback message.
	 */
	protected function handle_exception( \Throwable $e, string $default_message = '' ): WP_REST_Response {
		$message = '' !== $default_message
			? $default_message
			: __( 'An error occurred.', 'ninja-accessibility' );
		$status  = self::HTTP_INTERNAL_SERVER_ERROR;

		if ( $e instanceof \InvalidArgumentException ) {
			$message = $e->getMessage();
			$status  = self::HTTP_BAD_REQUEST;
		}

		return $this->error_response( $message, $status );
	}
}
