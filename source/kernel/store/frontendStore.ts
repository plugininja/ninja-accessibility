/**
 * Frontend store — accessibility widget state only (no API layer).
 */

import { configureStore } from '@reduxjs/toolkit';
import widgetReducer from '~/features/widget/state/widgetSlice';

export const widgetStore = configureStore( {
	reducer: {
		widget: widgetReducer,
	},
} );

export type TWidgetRootState = ReturnType<typeof widgetStore.getState>;
export type TWidgetDispatch = typeof widgetStore.dispatch;
