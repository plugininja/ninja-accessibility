/**
 * Admin layout — ninja-drive Settings layout:
 * Topbar (logo | menus | save) + Topbar (page title | docs) + routed content.
 */

import { useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { DEFAULT_MENU_KEY, DOCS_URL, SETTINGS_MENU } from '~/kernel/constants';
import {
	hydrate,
	markSaved,
	persistSetting,
	selectHydrated,
	selectIsDirty,
	selectSettings,
} from '~/features/settings/state/settingsSlice';
import {
	useGetSettingsQuery,
	useUpdateSettingsMutation,
} from '~/features/settings/api/settingsApi';
import MainLayout from '~/ui/templates/MainLayout';
import Menus from '~/shared/molecules/Menus';
import { IconButton, InlineStack, Note, Topbar } from '~/ui/molecules';
import { Button, Loading, Logo, Text } from '~/ui/atoms';

interface Toast {
	type: 'success' | 'error';
	message: string;
}

export default function App() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const settings = useAppSelector( selectSettings );
	const hydrated = useAppSelector( selectHydrated );
	const isDirty = useAppSelector( selectIsDirty );

	const { menuKey = DEFAULT_MENU_KEY } = useParams<{ menuKey: string }>();
	const { data, isLoading, error } = useGetSettingsQuery();
	const [ updateSettings, { isLoading: saving } ] = useUpdateSettingsMutation();

	const [ toast, setToast ] = useState<Toast | null>( null );

	// Hydrate the working copy once the server state arrives.
	useEffect( () => {
		if ( data && ! hydrated ) {
			dispatch( hydrate( { settings: data.settings, defaults: data.defaults } ) );
		}
	}, [ data, hydrated, dispatch ] );

	// ─── Dark mode ────────────────────────────────────────────────────────────

	const currentTheme: 'light' | 'dark' =
		( settings.admin_theme as 'light' | 'dark' ) || 'light';
	const [ theme, setTheme ] = useState<'light' | 'dark'>( currentTheme );

	// Sync theme from hydrated settings + apply to <html>.
	useEffect( () => {
		if ( hydrated && currentTheme !== theme ) {
			setTheme( currentTheme );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hydrated, settings.admin_theme ] );

	useEffect( () => {
		document.documentElement.setAttribute( 'pnpna-theme-status', theme );
	}, [ theme ] );

	const onToggleTheme = async () => {
		const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
		const prev = theme;

		// Apply instantly for snappy UX.
		setTheme( next );
		document.documentElement.setAttribute( 'pnpna-theme-status', next );

		try {
			// Persist via partial API update (independent of main Save button).
			await updateSettings( { admin_theme: next } ).unwrap();
			// Sync data + savedData for this single key — keeps other dirty flags intact.
			dispatch( persistSetting( { key: 'admin_theme', value: next } ) );
		} catch {
			// Revert on failure.
			setTheme( prev );
			document.documentElement.setAttribute( 'pnpna-theme-status', prev );
		}
	};

	const showToast = useCallback( ( type: Toast[ 'type' ], message: string ) => {
		setToast( { type, message } );
		window.setTimeout( () => setToast( null ), 3200 );
	}, [] );

	const onSave = async () => {
		try {
			await updateSettings( settings ).unwrap();
			dispatch( markSaved() );
			showToast( 'success', __( 'Settings saved!', 'ninja-accessibility' ) );
		} catch {
			showToast( 'error', __( 'Save failed. Please try again.', 'ninja-accessibility' ) );
		}
	};

	const activeItem = SETTINGS_MENU.find( ( item ) => item.key === menuKey ) || SETTINGS_MENU[ 0 ];

	const pageTitle = (
		<InlineStack gap={ 10 }>
			<IconButton
				variant="outlined"
				rounded="md"
				color="gray-700"
				style={ { backgroundColor: 'var(--pnpna-gray-50)' } }
				name={ activeItem.icon }
				title={ activeItem.title }
			/>
			<Text color="gray-700" weight="medium">
				{ activeItem.title }
			</Text>
			<Text color="gray-500" size="xs">
				{ activeItem.desc }
			</Text>
		</InlineStack>
	);

	const docs = (
		<Button
			key="docs"
			variant="outlined"
			size="small"
			startIcon="info"
			href={ DOCS_URL }
			target="_blank"
		>
			{ __( 'Documentation', 'ninja-accessibility' ) }
		</Button>
	);

	if ( isLoading || ! hydrated ) {
		return (
			<MainLayout>
				<MainLayout.ContentWrapper>
					<MainLayout.Content className="pnpna-app-loading">
						{ !! error && (
							<Note type="error">
								<Note.Normal>
									{ __( 'Failed to load settings. Please refresh the page.', 'ninja-accessibility' ) }
								</Note.Normal>
							</Note>
						) }
						{ ! error && <Loading size={ 40 } /> }
					</MainLayout.Content>
				</MainLayout.ContentWrapper>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<MainLayout.ContentWrapper>
				<Topbar
					leftContents={ [ <Logo key="logo" /> ] }
					rightContents={ [
						<IconButton
							key="theme"
							variant="secondary"
							name={ theme === 'light' ? 'dark_mode' : 'light_mode' }
							title={
								theme === 'light'
									? __( 'Switch to dark mode', 'ninja-accessibility' )
									: __( 'Switch to light mode', 'ninja-accessibility' )
							}
							onClick={ onToggleTheme }
						/>,
						<Button
							key="save"
							variant="primary"
							startIcon="check"
							disabled={ ! isDirty || saving }
							loading={ saving }
							onClick={ onSave }
						>
							{ __( 'Save Changes', 'ninja-accessibility' ) }
						</Button>,
					] }
					wrap={ false }
					zIndex={ 99999 }
				>
					<Menus
						menus={ SETTINGS_MENU }
						active={ menuKey }
						onMenuClick={ ( key ) => navigate( `/settings/${ key }` ) }
					/>
				</Topbar>

				<Topbar
					padding={ 15 }
					top="81px"
					border={ false }
					leftContents={ [ pageTitle ] }
					rightContents={ [ docs ] }
					wrap={ false }
				/>

				<MainLayout.Content>
					<Outlet />
				</MainLayout.Content>
			</MainLayout.ContentWrapper>

			{ toast && (
				<div role="status" aria-live="polite" className={ `pnpna-toast pnpna-toast--${ toast.type }` }>
					{ toast.message }
				</div>
			) }
		</MainLayout>
	);
}
