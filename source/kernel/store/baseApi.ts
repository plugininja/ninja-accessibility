/**
 * RTK Query base API — WordPress REST transport.
 *
 * Mirrors the ninja-drive kernel/store/baseApi pattern: a single createApi
 * instance that feature APIs extend via injectEndpoints().
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const config = window.pnpna || ( {} as Window['pnpna'] );

export const wpBaseQuery = fetchBaseQuery( {
	baseUrl: config.restUrl,
	credentials: 'same-origin',
	prepareHeaders: ( headers ) => {
		if ( config.nonce ) {
			headers.set( 'X-WP-Nonce', config.nonce );
		}
		headers.set( 'Content-Type', 'application/json' );
		return headers;
	},
} );

export const baseApi = createApi( {
	reducerPath: 'baseApi',
	baseQuery: wpBaseQuery,
	tagTypes: [ 'Settings', 'Pages', 'Analytics' ],
	endpoints: () => ( {} ),
} );
