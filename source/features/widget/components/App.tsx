/**
 * Frontend accessibility widget root.
 *
 * Enabled features arrive inlined via the localized `pnpna` object —
 * no HTTP request is needed and the widget works for logged-out visitors.
 */

import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useWidgetDispatch, useWidgetSelector } from '~/kernel/store/hooks';
import {
	togglePanel,
	closePanel,
	setEnabledFeatures,
	setActiveFeatures,
	removeFeature,
	setLanguage,
	selectIsOpen,
	selectActiveFeatures,
} from '~/features/widget/state/widgetSlice';
import Panel from './Panel';
import {
	applyFeature,
	applyFeatureMap,
	deactivateAll,
} from '~/features/widget/utils/accessibility';
import {
	getActiveFeatures,
	setActiveFeatures as persistFeatures,
	clearActiveFeatures,
	getStoredLanguage,
	isWidgetHidden,
	setWidgetHidden,
} from '~/features/widget/utils/storage';
import languages, { LanguageKey } from '~/features/widget/i18n/languages';
import type { FeatureKey, WidgetSettings } from '~/kernel/types/widget';

function getPanelOrientation(): { left: boolean; top: boolean } {
	const root = document.getElementById( 'pnpna-frontend' );
	if ( ! root ) {
		return { left: false, top: false };
	}
	return {
		left: /pos-(bottom|top)-left/.test( root.className ),
		top: /pos-top/.test( root.className ),
	};
}

interface Props {
	settings?: WidgetSettings;
}

export default function App( { settings: phpSettings = {} }: Props ) {
	const dispatch = useWidgetDispatch();
	const open = useWidgetSelector( selectIsOpen );
	const activeFeatures = useWidgetSelector( selectActiveFeatures );
	const toggleBtnRef = useRef<HTMLButtonElement>( null );
	const [ hidden, setHidden ] = useState( isWidgetHidden() );

	const config = window.pnpna || ( {} as Window['pnpna'] );
	const assetsUrl = config.assetsUrl || '';

	const { left: panelLeft, top: panelTop } = getPanelOrientation();
	const sizeClass = phpSettings?.size || 'pnpna-icon-lg';
	const btnClass =
		'pnpna-toggle-btn' +
		( sizeClass === 'pnpna-icon-sm' ? ' pnpna-toggle-btn--sm' : '' ) +
		( sizeClass === 'pnpna-icon-lg' ? ' pnpna-toggle-btn--lg' : '' );

	// Enabled features are inlined by PHP — no fetch required.
	const enabledFromServer = config.activeElements;
	useEffect( () => {
		if ( Array.isArray( enabledFromServer ) ) {
			dispatch( setEnabledFeatures( enabledFromServer ) );
		}
	}, [ enabledFromServer, dispatch ] );

	// Initial language: visitor choice → admin default → English.
	useEffect( () => {
		const stored = getStoredLanguage();
		const fallback = ( config.language || 'en' ) as LanguageKey;
		const initial = stored && languages[ stored ] ? stored : fallback;
		if ( languages[ initial ] ) {
			dispatch( setLanguage( initial ) );
		}
	}, [ config.language, dispatch ] );

	// Restore persisted features.
	useEffect( () => {
		const persisted = getActiveFeatures();
		if ( Object.keys( persisted ).length ) {
			dispatch( setActiveFeatures( persisted ) );
			applyFeatureMap( persisted );
		}
	}, [ dispatch ] );

	// Keep localStorage in sync whenever Redux state changes.
	useEffect( () => {
		persistFeatures( activeFeatures );
	}, [ activeFeatures ] );

	// Dialog features (Structure / Sitemap) can close themselves — sync state.
	useEffect( () => {
		const onFeatureClosed = ( e: Event ) => {
			const key = ( e as CustomEvent<{ key: FeatureKey }> ).detail?.key;
			if ( key ) {
				dispatch( removeFeature( key ) );
			}
		};
		document.addEventListener( 'pnpna:feature-closed', onFeatureClosed );
		return () => document.removeEventListener( 'pnpna:feature-closed', onFeatureClosed );
	}, [ dispatch ] );

	const handleFeatureStep = useCallback( ( key: FeatureKey, step: number ) => {
		applyFeature( key, step );
	}, [] );

	const handleResetAll = useCallback( () => {
		deactivateAll();
		clearActiveFeatures();
	}, [] );

	const handleClose = useCallback( () => {
		dispatch( closePanel() );
		toggleBtnRef.current?.focus();
	}, [ dispatch ] );

	const handleHideInterface = useCallback( () => {
		deactivateAll();
		clearActiveFeatures();
		setWidgetHidden( true );
		dispatch( closePanel() );
		setHidden( true );
	}, [ dispatch ] );

	if ( hidden ) {
		return null;
	}

	const iconSetting = phpSettings?.icon || { id: 'icon1' };
	let iconSrc = '';
	if ( iconSetting.icon ) {
		iconSrc = iconSetting.icon;
	} else if ( assetsUrl ) {
		iconSrc = `${ assetsUrl }/images/icons/${ iconSetting.id || 'icon1' }.svg`;
	}

	return (
		<>
			<button
				ref={ toggleBtnRef }
				type="button"
				className={ btnClass }
				onClick={ () => dispatch( togglePanel() ) }
				aria-expanded={ open }
				aria-haspopup="dialog"
				aria-label={ __( 'Toggle accessibility tools', 'ninja-accessibility' ) }
			>
				<span className="pnpna-toggle-btn__icon">
					{ iconSrc ? (
						<img src={ iconSrc } alt="" aria-hidden="true" className="pnpna-toggle-btn__img" />
					) : (
						<span className="material-symbols-outlined pnpna-toggle-btn__fallback" aria-hidden="true">
							accessibility_new
						</span>
					) }
				</span>
			</button>

			<Panel
				panelLeft={ panelLeft }
				panelTop={ panelTop }
				onClose={ handleClose }
				onFeatureStep={ handleFeatureStep }
				onResetAll={ handleResetAll }
				onHideInterface={ handleHideInterface }
				onSkipToContent={ () => {
					const target = document.getElementById( 'main' ) || document.querySelector( 'main' ) || document.querySelector( '[role="main"]' );
					if ( target ) {
						( target as HTMLElement ).tabIndex = -1;
						( target as HTMLElement ).focus();
					}
				} }
			/>
		</>
	);
}
