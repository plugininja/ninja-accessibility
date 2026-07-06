/**
 * Local (unsaved) settings edit state.
 *
 * Server state lives in RTK Query (settingsApi); this slice holds the
 * working copy the user edits before saving, plus dirty tracking.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PluginSettings } from '~/kernel/types/settings';

export interface SettingsState {
	data: Partial<PluginSettings>;
	defaults: Partial<PluginSettings>;
	savedData: Partial<PluginSettings>;
	hydrated: boolean;
}

const initialState: SettingsState = {
	data: {},
	defaults: {},
	savedData: {},
	hydrated: false,
};

const settingsSlice = createSlice( {
	name: 'settings',
	initialState,
	reducers: {
		hydrate(
			state,
			action: PayloadAction<{ settings: Partial<PluginSettings>; defaults: Partial<PluginSettings> }>
		) {
			const merged = { ...action.payload.defaults, ...action.payload.settings };
			state.data = merged;
			state.savedData = merged;
			state.defaults = action.payload.defaults;
			state.hydrated = true;
		},
		updateSetting<K extends keyof PluginSettings>(
			state: SettingsState,
			action: PayloadAction<{ key: K; value: PluginSettings[ K ] }>
		) {
			( state.data as Record<string, unknown> )[ action.payload.key ] = action.payload.value;
		},
		resetToDefaults( state ) {
			state.data = { ...state.defaults };
		},
		markSaved( state ) {
			state.savedData = { ...state.data };
		},
	},
} );

export const { hydrate, updateSetting, resetToDefaults, markSaved } = settingsSlice.actions;
export default settingsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

interface RootLike {
	settings: SettingsState;
}

export const selectSettings = ( state: RootLike ) => state.settings.data;
export const selectDefaults = ( state: RootLike ) => state.settings.defaults;
export const selectHydrated = ( state: RootLike ) => state.settings.hydrated;
export const selectIsDirty = ( state: RootLike ) =>
	JSON.stringify( state.settings.data ) !== JSON.stringify( state.settings.savedData );
