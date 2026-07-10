/**
 * Global window typings for the localized `pnpna` object.
 */

import type { FeatureKey } from './widget';

export interface PnpnaLocalizedData {
	restUrl: string;
	/** REST nonce — only present in the admin context. */
	nonce?: string;
	siteUrl: string;
	pluginUrl: string;
	assetsUrl: string;
	version: string;
	pluginName: string;
	isAdmin: boolean;
	isPro: boolean;
	/** snake_case alias kept for design-system components ported from ninja-drive. */
	is_pro?: boolean;
	// Frontend-only extras (inlined so the widget needs no HTTP request).
	activeElements?: FeatureKey[];
	cursorEffect?: string;
	cursorEmoji?: string;
	fairyDustColors?: string[];
	statementUrl?: string;
	showBranding?: boolean;
	/** Default widget language (visitor override is stored in localStorage). */
	language?: string;
}

declare global {
	interface Window {
		pnpna: PnpnaLocalizedData;
	}

	// eslint-disable-next-line no-var
	var pnpna: PnpnaLocalizedData;
}

export {};
