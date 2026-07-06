/**
 * localStorage helpers for frontend accessibility widget state.
 */

import type { ActiveFeatureMap, FeatureKey } from '~/kernel/types/widget';
import type { LanguageKey } from '~/features/widget/i18n/languages';

const STORAGE_KEY  = 'pnpna_active';
const LANGUAGE_KEY = 'pnpna_language';
const HIDDEN_KEY   = 'pnpna_widget_hidden';

export function getActiveFeatures(): ActiveFeatureMap {
	try {
		const raw = window.localStorage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return {};
		}

		const parsed = JSON.parse( raw );

		// Legacy format: plain array of active keys → migrate to step map.
		if ( Array.isArray( parsed ) ) {
			const migrated: ActiveFeatureMap = {};
			( parsed as FeatureKey[] ).forEach( ( key ) => {
				migrated[ key ] = 1;
			} );
			return migrated;
		}

		if ( parsed && 'object' === typeof parsed ) {
			return parsed as ActiveFeatureMap;
		}

		return {};
	} catch {
		return {};
	}
}

export function setActiveFeatures( features: ActiveFeatureMap ): void {
	try {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( features ) );
	} catch {
		// Storage unavailable.
	}
}

export function clearActiveFeatures(): void {
	try {
		window.localStorage.removeItem( STORAGE_KEY );
	} catch {
		// Ignore.
	}
}

// ─── Language ─────────────────────────────────────────────────────────────────

export function getStoredLanguage(): LanguageKey | null {
	try {
		return window.localStorage.getItem( LANGUAGE_KEY ) as LanguageKey | null;
	} catch {
		return null;
	}
}

export function setStoredLanguage( language: LanguageKey ): void {
	try {
		window.localStorage.setItem( LANGUAGE_KEY, language );
	} catch {
		// Ignore.
	}
}

// ─── Hide interface ───────────────────────────────────────────────────────────

export function isWidgetHidden(): boolean {
	try {
		return '1' === window.localStorage.getItem( HIDDEN_KEY );
	} catch {
		return false;
	}
}

export function setWidgetHidden( hidden: boolean ): void {
	try {
		if ( hidden ) {
			window.localStorage.setItem( HIDDEN_KEY, '1' );
		} else {
			window.localStorage.removeItem( HIDDEN_KEY );
		}
	} catch {
		// Ignore.
	}
}
