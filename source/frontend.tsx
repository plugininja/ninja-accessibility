/**
 * Frontend accessibility widget entry point.
 */

import * as WPElement from '@wordpress/element';
import { Provider } from 'react-redux';
import { widgetStore } from '~/kernel/store/frontendStore';
import { CustomAlertProvider } from '~/ui/molecules/Alert';
import App from '~/features/widget/components/App';
import type { WidgetSettings } from '~/kernel/types/widget';

function render() {
	const root = document.getElementById( 'pnpna-frontend' );

	if ( null === root ) {
		return;
	}

	let settings: WidgetSettings = {};

	try {
		settings = root.dataset.settings ? JSON.parse( root.dataset.settings ) : {};
	} catch {
		settings = {};
	}

	const component = (
		<Provider store={ widgetStore }>
			<CustomAlertProvider>
				<App settings={ settings } />
			</CustomAlertProvider>
		</Provider>
	);

	if ( WPElement.createRoot ) {
		WPElement.createRoot( root ).render( component );
	} else {
		WPElement.render( component, root );
	}
}

render();
