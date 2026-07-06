/**
 * Redux slice for the frontend accessibility widget.
 *
 * Manages panel open/close state, the visitor's language, and a map of
 * active features. Each feature stores a numeric step: 0/absent = off,
 * 1..n = active level (multi-step features like Content Scaling have
 * several levels; simple toggles only use 0/1).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ActiveFeatureMap, FeatureKey } from '~/kernel/types/widget';
import type { LanguageKey } from '~/features/widget/i18n/languages';

export interface WidgetState {
	open: boolean;
	activeFeatures: ActiveFeatureMap;
	enabledFeatures: FeatureKey[];
	language: LanguageKey;
}

const initialState: WidgetState = {
	open: false,
	activeFeatures: {},
	enabledFeatures: [],
	language: 'en',
};

const widgetSlice = createSlice( {
	name: 'widget',
	initialState,
	reducers: {
		openPanel( state ) {
			state.open = true;
		},
		closePanel( state ) {
			state.open = false;
		},
		togglePanel( state ) {
			state.open = ! state.open;
		},
		removeFeature( state, action: PayloadAction<FeatureKey> ) {
			delete state.activeFeatures[ action.payload ];
		},
		setFeatureStep( state, action: PayloadAction<{ key: FeatureKey; step: number }> ) {
			const { key, step } = action.payload;
			if ( step > 0 ) {
				state.activeFeatures[ key ] = step;
			} else {
				delete state.activeFeatures[ key ];
			}
		},
		setEnabledFeatures( state, action: PayloadAction<FeatureKey[]> ) {
			state.enabledFeatures = action.payload;
		},
		setActiveFeatures( state, action: PayloadAction<ActiveFeatureMap> ) {
			state.activeFeatures = action.payload;
		},
		resetAllFeatures( state ) {
			state.activeFeatures = {};
		},
		setLanguage( state, action: PayloadAction<LanguageKey> ) {
			state.language = action.payload;
		},
	},
} );

export const {
	openPanel,
	closePanel,
	togglePanel,
	removeFeature,
	setFeatureStep,
	setEnabledFeatures,
	setActiveFeatures,
	resetAllFeatures,
	setLanguage,
} = widgetSlice.actions;

export default widgetSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export interface RootWidgetState {
	widget: WidgetState;
}

export const selectIsOpen          = ( s: RootWidgetState ) => s.widget.open;
export const selectActiveFeatures  = ( s: RootWidgetState ) => s.widget.activeFeatures;
export const selectEnabledFeatures = ( s: RootWidgetState ) => s.widget.enabledFeatures;
export const selectLanguage        = ( s: RootWidgetState ) => s.widget.language;
