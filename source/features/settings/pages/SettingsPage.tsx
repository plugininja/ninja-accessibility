/**
 * Routes #/settings/:menuKey to the matching settings page component.
 */

import { Navigate, useParams } from 'react-router-dom';
import { DEFAULT_MENU_KEY } from '~/kernel/constants';
import General from './general/General';
import Design from './design/Design';
import Capabilities from './capabilities/Capabilities';
import Statement from './statement/Statement';
import Mouse from './mouse/Mouse';
const PAGES: Record<string, React.ComponentType> = {
	general: General,
	design: Design,
	capabilities: Capabilities,
	statement: Statement,
	mouse: Mouse,
	};

export default function SettingsPage() {
	const { menuKey } = useParams<{ menuKey: string }>();
	const Page = menuKey ? PAGES[ menuKey ] : undefined;

	if ( ! Page ) {
		return <Navigate to={ `/settings/${ DEFAULT_MENU_KEY }` } replace />;
	}

	return (
		<div role="region" id={ `pnpna-panel-${ menuKey }` } aria-label={ menuKey }>
			<Page />
		</div>
	);
}
