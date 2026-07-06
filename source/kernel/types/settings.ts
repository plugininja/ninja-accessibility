/**
 * TypeScript interfaces for Ninja Accessibility plugin settings.
 *
 * These mirror the PHP settings defined in core/functions.php
 * (pnpna_default_settings) and validated in Security/Input_Validator.
 */

export type IconPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export type IconSize = 'pnpna-icon-sm' | 'pnpna-icon-md' | 'pnpna-icon-lg';

export type CursorEffect =
	| 'none'
	| 'followingDot'
	| 'bubbles'
	| 'clockHand'
	| 'emojiCursor'
	| 'fairyDust'
	| 'ghost'
	| 'nyanCat'
	| 'rainbowCursor'
	| 'snowflake'
	| 'springyEmoji'
	| 'textFlag'
	| 'trailingCursor';

export type BoolString = '0' | '1';

export interface IconSetting {
	id: string;
	icon?: string;
}

export interface PluginSettings {
	// General
	enable_widget: BoolString;
	widget_language: string;

	// Design
	icon_size: IconSize;
	widget_icon: IconSetting;
	custom_widget_icons: IconSetting[];
	icon_corner_radius: string;
	icon_bg_color: string;
	show_icon_desktop: BoolString;
	show_icon_tablet: BoolString;
	show_icon_phone: BoolString;
	desktop_icon_position: IconPosition;
	tablet_icon_position: IconPosition;
	phone_icon_position: IconPosition;
	exact_position_desktop: BoolString;
	exact_position_tablet: BoolString;
	exact_position_phone: BoolString;
	exact_position_desktop_x: string;
	exact_position_desktop_y: string;
	exact_position_tablet_x: string;
	exact_position_tablet_y: string;
	exact_position_phone_x: string;
	exact_position_phone_y: string;

	// Capabilities
	content_scaling: BoolString;
	bigger_text: BoolString;
	bigger_line_height: BoolString;
	letter_spacing: BoolString;
	text_align: BoolString;
	readable_font: BoolString;
	text_magnifier: BoolString;
	highlight_links: BoolString;
	cursor: BoolString;
	page_structure: BoolString;
	screen_reader: BoolString;
	reading_mask: BoolString;
	sitemap: BoolString;
	hide_images: BoolString;
	pause_animation: BoolString;
	mute_sounds: BoolString;
	reading_line: BoolString;
	grey_scale: BoolString;
	contrast: BoolString;
	invert_color: BoolString;
	brightness: BoolString;
	saturation: BoolString;
	show_branding: BoolString;
	skip_main_content: BoolString;

	// Mouse customization
	enable_mouse_customization: BoolString;
	cursor_icon: IconSetting;
	custom_cursor_icons: IconSetting[];
	cursor_color: string;
	cursor_size: string;
	apply_cursor: string;
	cursor_effect_type: CursorEffect;
	cursor_css_selectors: string;
	hide_cursor_on_mobile: BoolString;

	// Accessibility statement
	statement_url: string;
	statement_page_id: string;
}
