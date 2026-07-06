/**
 * Admin SPA root — router + store provider (ninja-drive Main pattern).
 */

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '~/kernel/store/store';
import { DEFAULT_MENU_KEY } from '~/kernel/constants';
import App from './App';
import SettingsPage from '~/features/settings/pages/SettingsPage';

export default function Main() {
	return (
		<Provider store={ store }>
			<HashRouter>
				<Routes>
					<Route path="/" element={ <App /> }>
						<Route index element={ <Navigate to={ `/settings/${ DEFAULT_MENU_KEY }` } replace /> } />
						<Route path="settings/:menuKey" element={ <SettingsPage /> } />
						<Route path="*" element={ <Navigate to={ `/settings/${ DEFAULT_MENU_KEY }` } replace /> } />
					</Route>
				</Routes>
			</HashRouter>
		</Provider>
	);
}
