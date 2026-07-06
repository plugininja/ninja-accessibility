/**
 * Admin store — combines the RTK Query base API with feature slices.
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import settingsReducer from '~/features/settings/state/settingsSlice';

const rootReducer = combineReducers( {
	[ baseApi.reducerPath ]: baseApi.reducer,
	settings: settingsReducer,
} );

export const createAdminStore = () =>
	configureStore( {
		reducer: rootReducer,
		middleware: ( getDefaultMiddleware ) =>
			getDefaultMiddleware().concat( baseApi.middleware ),
	} );

export const store = createAdminStore();

export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;
