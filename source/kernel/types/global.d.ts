/**
 * Global window typings for the localized `pnpna` object.
 */

import type { FeatureKey, ProfileKey } from './widget';

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
	/** Freemius pricing / upgrade page (falls back to the product site). */
	upgradeUrl?: string;
	// Frontend-only extras (inlined so the widget needs no HTTP request).
	activeElements?: FeatureKey[];
	/** Accessibility profiles offered in the widget panel (pro-gated server-side). */
	activeProfiles?: ProfileKey[];
	/** Whether the visitor-facing "Oversized Widget" toggle is offered. */
	oversizedWidget?: boolean;
	/** Animated ring/dot cursor config for built-in shapes (null = static/off). */
	customCursor?: { shape: string; size: number; color: string } | null;
	cursorEffect?: string;
	cursorEmoji?: string;
	fairyDustColors?: string[];
	/** Premium: whether anonymous usage analytics should be recorded. */
	analyticsEnabled?: boolean;
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
