<?php
defined('ABSPATH') || exit('No direct script access allowed');

/**
 * Frontend accessibility widget template.
 *
 * Data is passed via $pnpna_args (set by pnpna_get_template()).
 * Do NOT rely on any variable other than $pnpna_args.
 */

/** @var array<string, mixed> $pnpna_args */
$pnpna_settings = isset($pnpna_args['settings']) && is_array($pnpna_args['settings'])
    ? $pnpna_args['settings']
    : array();

$pnpna_devices = array( 'desktop', 'tablet', 'phone' );

// Per-device computed values.
$pnpna_show_devices = '';
$pnpna_positions    = '';

foreach ($pnpna_devices as $pnpna_device) {
    $pnpna_device_settings = $pnpna_settings[ $pnpna_device ] ?? array();
    $pnpna_show_icon       = filter_var($pnpna_device_settings['show_icon'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $pnpna_exact           = filter_var($pnpna_device_settings['exact'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $pnpna_position        = sanitize_text_field($pnpna_device_settings['position'] ?? '');

    if ($pnpna_show_icon) {
        $pnpna_show_devices .= 'pnpna-show-' . sanitize_html_class($pnpna_device) . ' ';
        if (! $pnpna_exact && $pnpna_position) {
            $pnpna_positions .= 'pnpna-' . sanitize_html_class($pnpna_device) . '-pos-' . sanitize_html_class($pnpna_position) . ' ';
        }
    }
}

/*
 * NOTE: The widget's CSS custom properties (icon colour, radius, exact
 * positions) are emitted via wp_add_inline_style( 'pnpna-frontend', … ) in
 * App\Display::enqueue_frontend_styles() — never as a hardcoded <style> tag.
 */
?>
<div id="pnpna-frontend"
	class="pnpna-widget <?php echo esc_attr(trim($pnpna_show_devices . ' ' . $pnpna_positions)); ?>"
	aria-label="<?php esc_attr_e('Accessibility Widget', 'ninja-accessibility'); ?>"
	role="region"
	data-settings="<?php echo esc_attr(wp_json_encode($pnpna_settings)); ?>">
</div>
