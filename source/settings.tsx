/**
 * Admin settings page entry point.
 */

import * as WPElement from '@wordpress/element';
import Main from '~/admin/Main';

function render() {
	const container = document.getElementById( 'pnpna-admin' );

	if ( null === container ) {
		return;
	}

	const component = <Main />;

	if ( WPElement.createRoot ) {
		WPElement.createRoot( container ).render( component );
	} else {
		WPElement.render( component, container );
	}
}

render();
