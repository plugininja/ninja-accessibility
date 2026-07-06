/**
 * RTK Query endpoints for plugin settings (REST: ninja-accessibility/v1).
 */

import { baseApi } from '~/kernel/store/baseApi';
import type { PluginSettings } from '~/kernel/types/settings';

interface Envelope<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface SettingsPayload {
	settings: Partial<PluginSettings>;
	defaults: Partial<PluginSettings>;
}

export interface PageItem {
	value: number;
	label: string;
}

export interface CreatedPage {
	page_id: number;
	page_url: string;
}

export const settingsApi = baseApi.injectEndpoints( {
	endpoints: ( builder ) => ( {
		getSettings: builder.query<SettingsPayload, void>( {
			query: () => 'settings',
			transformResponse: ( res: Envelope<SettingsPayload> ) => res.data,
			providesTags: [ 'Settings' ],
		} ),

		updateSettings: builder.mutation<Partial<PluginSettings>, Partial<PluginSettings>>( {
			query: ( data ) => ( {
				url: 'settings',
				method: 'POST',
				body: { data },
			} ),
			transformResponse: ( res: Envelope<{ settings: Partial<PluginSettings> }> ) =>
				res.data.settings,
			// Sync the cached GET /settings result in place instead of
			// refetching after every save.
			async onQueryStarted( _arg, { dispatch, queryFulfilled } ) {
				try {
					const { data: saved } = await queryFulfilled;
					dispatch(
						settingsApi.util.updateQueryData( 'getSettings', undefined, ( draft ) => {
							draft.settings = saved;
						} )
					);
				} catch {
					// Save failed — leave the cache untouched.
				}
			},
		} ),

		resetSettings: builder.mutation<Partial<PluginSettings>, void>( {
			query: () => ( {
				url: 'settings/reset',
				method: 'POST',
			} ),
			transformResponse: ( res: Envelope<{ settings: Partial<PluginSettings> }> ) =>
				res.data.settings,
			invalidatesTags: [ 'Settings' ],
		} ),

		getPages: builder.query<PageItem[], void>( {
			query: () => 'pages',
			transformResponse: ( res: Envelope<{ pages: PageItem[] }> ) => res.data.pages,
			providesTags: [ 'Pages' ],
		} ),

		createPage: builder.mutation<CreatedPage, { title: string; content?: string }>( {
			query: ( body ) => ( {
				url: 'pages',
				method: 'POST',
				body,
			} ),
			transformResponse: ( res: Envelope<CreatedPage> ) => res.data,
			invalidatesTags: [ 'Pages' ],
		} ),
	} ),
} );

export const {
	useGetSettingsQuery,
	useUpdateSettingsMutation,
	useResetSettingsMutation,
	useGetPagesQuery,
	useCreatePageMutation,
} = settingsApi;
