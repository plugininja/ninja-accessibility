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
	setEnabledProfiles,
	setActiveProfiles,
	setOversized,
	removeFeature,
	setLanguage,
	selectIsOpen,
	selectActiveFeatures,
	selectActiveProfiles,
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
	getStoredProfiles,
	setStoredProfiles,
	clearStoredProfiles,
	isOversized,
	getStoredLanguage,
	isWidgetHidden,
	setWidgetHidden,
} from '~/features/widget/utils/storage';
import languages, { LanguageKey } from '~/features/widget/i18n/languages';
import { isLightColor } from '~/kernel/utils/functions';
import type { FeatureKey, WidgetSettings } from '~/kernel/types/widget';

function getPanelOrientation(): { left: boolean; top: boolean } {
	const root = document.getElementById( 'pnpna-frontend' );
	if ( ! root ) {
		return { left: false, top: false };
	}

	// The widget carries one position class per device, e.g.
	// "pnpna-desktop-pos-top-right pnpna-phone-pos-bottom-left". Only the
	// class for the breakpoint that is actually active governs where the
	// button sits (see the media-scoped position rules in frontend.scss),
	// so the panel must read that SAME class to know which way to open.
	// Reading all of them at once (the old global regex) let a different
	// device's corner leak in — e.g. desktop top-right + phone bottom-left
	// both matched, so the panel opened downward from a bottom-anchored
	// button and fell off the screen. Breakpoints mirror the SCSS
	// ( $bp-phone 480, $bp-tablet 768 ).
	const width = window.innerWidth;
	const device =
		width <= 480 ? 'phone' : width <= 768 ? 'tablet' : 'desktop';

	const match = new RegExp( `pnpna-${ device }-pos-([a-z-]+)` ).exec(
		root.className
	);
	const position = match ? match[ 1 ] : '';

	return {
		left: position.endsWith( '-left' ),
		top: position.startsWith( 'top-' ),
	};
}

interface Props {
	settings?: WidgetSettings;
}

export default function App( { settings: phpSettings = {} }: Props ) {
	const dispatch = useWidgetDispatch();
	const open = useWidgetSelector( selectIsOpen );
	const activeFeatures = useWidgetSelector( selectActiveFeatures );
	const activeProfiles = useWidgetSelector( selectActiveProfiles );
	const hasActiveSettings =
		Object.keys( activeFeatures ).length > 0 || activeProfiles.length > 0;
	const toggleBtnRef = useRef<HTMLButtonElement>( null );
	const [ hidden, setHidden ] = useState( isWidgetHidden() );

	const config = window.pnpna || ( {} as Window['pnpna'] );
	const assetsUrl = config.assetsUrl || '';

	const { left: panelLeft, top: panelTop } = getPanelOrientation();
	const sizeClass = phpSettings?.size || 'pnpna-icon-lg';
	const btnClass =
		'pnpna-toggle-btn' +
		( sizeClass === 'pnpna-icon-sm' ? ' pnpna-toggle-btn--sm' : '' ) +
		( sizeClass === 'pnpna-icon-lg' ? ' pnpna-toggle-btn--lg' : '' ) +
		// Accessiy parity: light background (~80% white) → dark glyph.
		( isLightColor( phpSettings?.color ) ? ' pnpna-darker-icon' : '' ) +
		// Tick badge indicator when the visitor has any setting enabled.
		( hasActiveSettings ? ' pnpna-toggle-btn--has-active' : '' );

	// Enabled features are inlined by PHP — no fetch required.
	const enabledFromServer = config.activeElements;
	useEffect( () => {
		if ( Array.isArray( enabledFromServer ) ) {
			dispatch( setEnabledFeatures( enabledFromServer ) );
		}
	}, [ enabledFromServer, dispatch ] );

	// Offered accessibility profiles are inlined by PHP too.
	const profilesFromServer = config.activeProfiles;
	useEffect( () => {
		if ( Array.isArray( profilesFromServer ) ) {
			dispatch( setEnabledProfiles( profilesFromServer ) );
		}
	}, [ profilesFromServer, dispatch ] );

	// Restore the visitor's profile selection and oversized-layout choice.
	useEffect( () => {
		const storedProfiles = getStoredProfiles();
		if ( storedProfiles.length ) {
			dispatch( setActiveProfiles( storedProfiles ) );
		}
		if ( isOversized() ) {
			dispatch( setOversized( true ) );
		}
	}, [ dispatch ] );

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

	useEffect( () => {
		setStoredProfiles( activeProfiles );
	}, [ activeProfiles ] );

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
		clearStoredProfiles();
	}, [] );

	const handleClose = useCallback( () => {
		dispatch( closePanel() );
		toggleBtnRef.current?.focus();
	}, [ dispatch ] );

	const handleHideInterface = useCallback( () => {
		deactivateAll();
		clearActiveFeatures();
		clearStoredProfiles();
		setWidgetHidden( true );
		dispatch( closePanel() );
		setHidden( true );
	}, [ dispatch ] );

	const handleToggle = useCallback( () => {
		dispatch( togglePanel() );
	}, [ dispatch, open ] );

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
				onClick={ handleToggle }
				aria-expanded={ open }
				aria-haspopup="dialog"
				aria-label={
					hasActiveSettings
						? __( 'Toggle accessibility tools (settings active)', 'ninja-accessibility' )
						: __( 'Toggle accessibility tools', 'ninja-accessibility' )
				}
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
				{ hasActiveSettings && ! open && (
					<span className="pnpna-toggle-btn__badge" aria-hidden="true">
						<svg viewBox="0 0 24 24" focusable="false">
							<path d="M9.55 16.15 5.4 12l-1.42 1.4 5.57 5.57L20.6 7.9l-1.4-1.4z" />
						</svg>
					</span>
				) }
			</button>

			<Panel
				panelLeft={ panelLeft }
				panelTop={ panelTop }
				onClose={ handleClose }
				onFeatureStep={ handleFeatureStep }
				onResetAll={ handleResetAll }
				onHideInterface={ handleHideInterface }
			/>
		</>
	);
}
