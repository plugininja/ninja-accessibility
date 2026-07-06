/**
 * TypeScript interfaces for the frontend widget state.
 */

export type FeatureKey =
	| 'content_scaling'
	| 'bigger_text'
	| 'bigger_line_height'
	| 'letter_spacing'
	| 'text_align'
	| 'readable_font'
	| 'text_magnifier'
	| 'highlight_links'
	| 'cursor'
	| 'page_structure'
	| 'screen_reader'
	| 'reading_mask'
	| 'sitemap'
	| 'hide_images'
	| 'pause_animation'
	| 'mute_sounds'
	| 'reading_line'
	| 'grey_scale'
	| 'contrast'
	| 'invert_color'
	| 'brightness'
	| 'saturation';

/**
 * Per-feature activation level.
 * 0 (or absent) = off; 1..n = active step for multi-step features.
 */
export type ActiveFeatureMap = Partial<Record<FeatureKey, number>>;

export interface FeatureMeta {
	key: FeatureKey;
	label: string;
	icon: string;
}

export interface WidgetSettings {
	icon?: {
		id: string;
		icon?: string;
	};
	size?: string;
	color?: string;
	radius?: string;
	desktop?: DeviceSettings;
	tablet?: DeviceSettings;
	phone?: DeviceSettings;
}

export interface DeviceSettings {
	show_icon: string;
	position: string;
	exact: string;
	x: string;
	y: string;
}
