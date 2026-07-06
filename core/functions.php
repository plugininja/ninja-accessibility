<?php
defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Locate and render a plugin template file.
 *
 * The template receives a single $pnpna_args variable (array) instead of
 * having every key extracted into the local scope — prevents variable injection.
 *
 * Templates should read data like:
 *   $settings = $pnpna_args['settings'] ?? [];
 *
 * @param string      $slug Template slug (filename without extension).
 * @param array       $args Associative data array passed to the template.
 * @param string|null $name Optional variant name (e.g. "header").
 */
function pnpna_get_template( string $slug, array $args = [], ?string $name = null ): void {
	// Validate to prevent directory traversal.
	$slug = sanitize_key( $slug );
	if ( null !== $name ) {
		$name = sanitize_key( $name );
	}

	if ( empty( $slug ) ) {
		return;
	}

	// Allow theme overrides.
	$theme_file = $name ? "{$slug}-{$name}.php" : "{$slug}.php";
	$template   = locate_template( $theme_file );

	if ( ! $template ) {
		$template = $name
			? PNPNA_TEMPLATES . "/{$slug}-{$name}.php"
			: PNPNA_TEMPLATES . "/{$slug}.php";
	}

	// Resolve real path; ensure it stays inside the templates directory.
	$real_template = realpath( $template );
	$real_base     = realpath( PNPNA_TEMPLATES );

	if (
		false === $real_template ||
		false === $real_base ||
		0 !== strpos( $real_template, $real_base )
	) {
		return;
	}

	if ( ! file_exists( $real_template ) ) {
		return;
	}

	// phpcs:ignore WordPress.PHP.DontExtract.extract_extract
	$pnpna_args = is_array( $args ) ? $args : array();

	include $real_template;
}

/**
 * Returns the default settings for the plugin.
 *
 * @return array<string, mixed>
 */
function pnpna_default_settings(): array {
	$general = array(
		'enable_widget'              => '1',
		'widget_language'            => 'en',
	);

	$design = array(
		'icon_size'                  => 'pnpna-icon-lg',
		'widget_icon'                => array( 'id' => 'icon1' ),
		'custom_widget_icons'        => array(),
		'icon_corner_radius'         => '100',
		'icon_bg_color'              => '#003C43',
		'show_icon_desktop'          => '1',
		'show_icon_tablet'           => '1',
		'show_icon_phone'            => '1',

		'desktop_icon_position'      => 'bottom-right',
		'tablet_icon_position'       => 'bottom-right',
		'phone_icon_position'        => 'bottom-left',

		'exact_position_desktop'     => '0',
		'exact_position_tablet'      => '0',
		'exact_position_phone'       => '0',

		'exact_position_desktop_x'   => '40',
		'exact_position_desktop_y'   => '40',
		'exact_position_tablet_x'    => '40',
		'exact_position_tablet_y'    => '40',
		'exact_position_phone_x'     => '40',
		'exact_position_phone_y'     => '40',
	);

	$capabilities = array(
		'content_scaling'            => '1',
		'bigger_text'                => '1',
		'bigger_line_height'         => '1',
		'letter_spacing'             => '1',
		'text_align'                 => '1',
		'readable_font'              => '1',
		'text_magnifier'             => '1',
		'highlight_links'            => '1',
		'cursor'                     => '1',
		'page_structure'             => '1',
		'screen_reader'              => '1',
		'reading_mask'               => '1',
		'sitemap'                    => '1',
		'hide_images'                => '1',
		'pause_animation'            => '1',
		'mute_sounds'                => '1',
		'reading_line'               => '1',
		'grey_scale'                 => '1',
		'contrast'                   => '1',
		'invert_color'               => '1',
		'brightness'                 => '1',
		'saturation'                 => '1',
		'show_branding'              => '1',
		'skip_main_content'          => '1',
	);

	$mouse_customization = array(
		'enable_mouse_customization' => '0',
		'cursor_icon'                => array( 'id' => 'cursor1' ),
		'custom_cursor_icons'        => array(),
		'cursor_color'               => '#1a1a1a',
		'cursor_size'                => '20',
		'apply_cursor'               => 'entire_website',
		'cursor_effect_type'         => 'none',
		'cursor_css_selectors'       => '',
		'hide_cursor_on_mobile'      => '1',
	);

	$statement = array(
		'statement_url'     => '',
		'statement_page_id' => '0',
	);

	return array_merge( $general, $design, $capabilities, $mouse_customization, $statement );
}
