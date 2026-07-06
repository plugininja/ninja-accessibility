/**
 * Typed Redux hooks for the admin and frontend stores.
 */

import { useDispatch, useSelector } from 'react-redux';
import type { TAppDispatch, TRootState } from './store';
import type { TWidgetDispatch, TWidgetRootState } from './frontendStore';

export const useAppSelector = useSelector.withTypes<TRootState>();
export const useAppDispatch = useDispatch.withTypes<TAppDispatch>();

export const useWidgetSelector = useSelector.withTypes<TWidgetRootState>();
export const useWidgetDispatch = useDispatch.withTypes<TWidgetDispatch>();
