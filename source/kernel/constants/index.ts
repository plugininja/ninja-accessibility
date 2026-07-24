/**
 * Admin menu / route definitions (ninja-drive SETTING_MENUS pattern).
 */

import { __ } from '@wordpress/i18n';
import type { StatusProps } from '~/ui/atoms/Status';

export interface MenuItem {
	key: string;
	title: string;
	icon: string;
	desc: string;
	/** Premium feature — shows a crown badge in the menu for free users. */
	isPro?: boolean;
	statusProps?: StatusProps;
}

export const SETTINGS_MENU: MenuItem[] = [
	{
		key: 'general',
		title: __( 'General', 'ninja-accessibility' ),
		icon: 'settings',
		desc: __( 'Control global plugin behaviour.', 'ninja-accessibility' ),
	},
	{
		key: 'design',
		title: __( 'Design', 'ninja-accessibility' ),
		icon: 'palette',
		desc: __( "Customize the look and position of accessibility tools to match your site's style.", 'ninja-accessibility' ),
	},
	{
		key: 'capabilities',
		title: __( 'Capabilities', 'ninja-accessibility' ),
		icon: 'accessibility_new',
		desc: __( 'Enable or disable all accessibility widgets from one place.', 'ninja-accessibility' ),
	},
	{
		key: 'statement',
		title: __( 'Statement', 'ninja-accessibility' ),
		icon: 'description',
		desc: __( 'Showcase your commitment to inclusivity by linking to your accessibility statement.', 'ninja-accessibility' ),
	},
	{
		key: 'mouse',
		title: __( 'Mouse Customization', 'ninja-accessibility' ),
		icon: 'mouse',
		desc: __( 'Enable options to adjust cursor size, color, and highlight for better visibility.', 'ninja-accessibility' ),
	},
];

export const DEFAULT_MENU_KEY = 'general';

export const DOCS_URL = 'https://plugininja.com/docs-category/ninja-accessibility/';
