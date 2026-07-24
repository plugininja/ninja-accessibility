/**
 * Mouse / custom-cursor settings page — design-system components with a
 * live preview of the generated cursor (same SVG the PHP layer outputs).
 *
 * Premium (Accessiy pro map): custom cursor upload, cursor effects, and
 * page-scoped cursor. Enforced server-side in App\Mouse_Customization.
 */

import { useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import { useGetPagesQuery } from '~/features/settings/api/settingsApi';
import SettingsField from '~/shared/molecules/SettingsField';
import {
	BlockStack,
	Description,
	Disabled,
	InlineStack,
	PageContainer,
	SelectBox,
} from '~/ui/molecules';
import { Button, ColorPicker, Slider, Status, Switcher, Text } from '~/ui/atoms';
import { toBoolean } from '~/kernel/utils/functions';
import type { PluginSettings } from '~/kernel/types/settings';

// Built-in cursor shapes — MUST stay in sync with Mouse_Customization::SHAPES.
// Artwork mirrors Accessiy's cursor_icon1–5 designs 1:1, so each glyph matches
// the animated ring/dot variant that shape produces on the frontend.
const CURSOR_SHAPES: { id: string; inner: string }[] = [
	// Dot inside an outlined ring.
	{ id: 'cursor1', inner: '<circle cx="10" cy="10" r="3" fill="{c}"/><circle cx="10" cy="10" r="9" fill="none" stroke="{c}" stroke-width="1"/>' },
	// Dot inside a translucent filled circle.
	{ id: 'cursor2', inner: '<circle cx="10" cy="10" r="10" fill="{c}" fill-opacity="0.1"/><circle cx="10" cy="10" r="3" fill="{c}"/>' },
	// Outlined ring only.
	{ id: 'cursor3', inner: '<circle cx="10" cy="10" r="9" fill="none" stroke="{c}" stroke-width="1"/>' },
	// Small solid dot.
	{ id: 'cursor4', inner: '<circle cx="10" cy="10" r="5" fill="{c}"/>' },
	// Offset double dot (small translucent pair when animated).
	{ id: 'cursor5', inner: '<circle cx="11" cy="11" r="5" fill="{c}" fill-opacity="0.45"/><circle cx="9" cy="9" r="5" fill="{c}"/>' },
];

// File-based cursor designs (accessiy icon set) — fixed artwork, no
// recolouring. MUST stay in sync with Mouse_Customization::FILE_SHAPES.
const FILE_CURSORS: { id: string; file: string }[] = [
	{ id: 'cursor6', file: 'cursor_icon6.svg' },
	{ id: 'cursor7', file: 'cursor_icon7.svg' },
	{ id: 'cursor8', file: 'cursor_icon8.svg' },
	{ id: 'cursor9', file: 'cursor_icon9.svg' },
	{ id: 'cursor10', file: 'cursor_icon10.svg' },
];

function fileCursorUrl( id: string ): string {
	const entry = FILE_CURSORS.find( ( c ) => c.id === id );
	return entry
		? `${ window.pnpna?.assetsUrl || '' }/images/icons/${ entry.file }`
		: '';
}

const CURSOR_EFFECTS = [
	{ value: 'none', name: __( 'None', 'ninja-accessibility' ) },
	{ value: 'followingDot', name: __( 'Following Dot', 'ninja-accessibility' ) },
];

const ICON_TYPES = [
	{ value: 'icon', name: __( 'Built-in Icon', 'ninja-accessibility' ) },
];

function buildCursorDataUri( shapeId: string, color: string, size: number ): string {
	const shape = CURSOR_SHAPES.find( ( s ) => s.id === shapeId ) || CURSOR_SHAPES[ 0 ];
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ size }" height="${ size }" viewBox="0 0 20 20">${ shape.inner.replace( /\{c\}/g, color ) }</svg>`;
	return `data:image/svg+xml;charset=utf-8,${ encodeURIComponent( svg ) }`;
}

interface MediaFrame {
	on: ( event: string, cb: () => void ) => void;
	open: () => void;
	state: () => { get: ( k: string ) => { first: () => { toJSON: () => { url?: string } } } };
}

export default function Mouse() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const { data: pages = [] } = useGetPagesQuery();
	const isProUser = toBoolean( window.pnpna?.is_pro );

	const [ iconType, setIconType ] = useState<'icon' | 'custom'>(
		settings.cursor_icon?.icon ? 'custom' : 'icon'
	);

	function update<K extends keyof PluginSettings>( key: K, value: PluginSettings[ K ] ) {
		dispatch( updateSetting( { key, value } ) );
	}

	const enabled = settings.enable_mouse_customization === '1';
	const iconId = settings.cursor_icon?.id || 'cursor1';
	const customIconUrl = settings.cursor_icon?.icon || '';
	const cursorSize = Math.min( 128, Math.max( 8, parseInt( String( settings.cursor_size || 20 ), 10 ) || 20 ) );
	const cursorColor = String( settings.cursor_color || '#1a1a1a' );
	const applyCursor = String( settings.apply_cursor || 'entire_website' );
	const applyIsPage = applyCursor !== 'entire_website' && applyCursor !== 'all';
	const hideOnMobile = settings.hide_cursor_on_mobile !== '0';
	const cssSelectors = String( settings.cursor_css_selectors || '' );
	const effect = String( settings.cursor_effect_type || 'none' );

	const previewCursor = useMemo( () => {
		const fileUrl = fileCursorUrl( iconId );
		const url = iconType === 'custom' && customIconUrl
			? customIconUrl
			: fileUrl || buildCursorDataUri( iconId, cursorColor, cursorSize );
		// Arrow-style file cursors point from the top-left corner.
		const hotspot = fileUrl && iconType !== 'custom' ? 0 : Math.floor( cursorSize / 2 );
		return `url("${ url }") ${ hotspot } ${ hotspot }, auto`;
	}, [ iconType, customIconUrl, iconId, cursorColor, cursorSize ] );

	// ─── Animated ring/dot preview (Accessiy parity) ─────────────────────────
	// Built-in circle shapes render as an animated ring + dot on the frontend,
	// so the preview box mirrors that instead of a static cursor image.
	const isAnimatedShape = iconType === 'icon' && CURSOR_SHAPES.some( ( s ) => s.id === iconId );

	const previewRingRef = useRef< HTMLDivElement | null >( null );
	const previewDotRef = useRef< HTMLDivElement | null >( null );

	const ringSize = iconId === 'cursor5' ? 12 : Math.max( 12, cursorSize );
	const dotSize = Math.max( 4, Math.round( ringSize * 0.29 ) );

	const mix = ( transparency: number ) =>
		`color-mix(in srgb, ${ cursorColor }, transparent ${ transparency }%)`;

	const baseOverlayStyle = {
		position: 'absolute' as const,
		top: 0,
		left: 0,
		borderRadius: 500,
		pointerEvents: 'none' as const,
		transform: 'translate(-200px, -200px)',
	};

	const ringVariant =
		iconId === 'cursor2'
			? { background: mix( 80 ), border: 'none' }
			: iconId === 'cursor4'
				? { background: mix( 10 ), border: `1px solid ${ cursorColor }` }
				: iconId === 'cursor5'
					? { background: mix( 60 ), border: 'none' }
					: { background: 'transparent', border: `1px solid ${ cursorColor }` };

	const previewRingStyle = {
		...baseOverlayStyle,
		width: ringSize,
		height: ringSize,
		transition: 'all 0.2s linear',
		willChange: 'transform, width, height',
		...ringVariant,
	};

	const previewDotStyle = {
		...baseOverlayStyle,
		width: dotSize,
		height: dotSize,
		transition: 'all 0.1s linear',
		background: iconId === 'cursor5' ? mix( 80 ) : cursorColor,
		display: iconId === 'cursor3' ? 'none' : 'block',
	};

	const handlePreviewMove = ( e: { currentTarget: HTMLDivElement; clientX: number; clientY: number } ) => {
		const box = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - box.left;
		const y = e.clientY - box.top;

		if ( previewDotRef.current ) {
			previewDotRef.current.style.transform = `translate(${ x - dotSize / 2 }px, ${ y - dotSize / 2 }px)`;
		}

		if ( previewRingRef.current ) {
			previewRingRef.current.style.transform = `translate(${ x - ringSize / 2 }px, ${ y - ringSize / 2 }px)`;
		}
	};

	const handlePreviewLeave = () => {
		if ( previewDotRef.current ) {
			previewDotRef.current.style.transform = 'translate(-200px, -200px)';
		}

		if ( previewRingRef.current ) {
			previewRingRef.current.style.transform = 'translate(-200px, -200px)';
		}
	};

	const openMediaLibrary = () => {
		const wpGlobal = ( window as unknown as { wp?: { media?: ( args: object ) => MediaFrame } } ).wp;

		if ( ! wpGlobal?.media ) {
			return;
		}

		const frame = wpGlobal.media( {
			title: __( 'Select Cursor Icon', 'ninja-accessibility' ),
			multiple: false,
			library: { type: 'image' },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			if ( attachment.url ) {
				update( 'cursor_icon', { id: 'custom', icon: attachment.url } );
				setIconType( 'custom' );
			}
		} );

		frame.open();
	};

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			<SettingsField>
				<BlockStack gap={ 10 }>
					<Switcher
						id="pnpna-enable-cursor"
						title={ __( 'Enable Custom Cursor', 'ninja-accessibility' ) }
						titleSize="sm"
						checked={ enabled }
						onChange={ ( checked ) => update( 'enable_mouse_customization', checked ? '1' : '0' ) }
					/>
					<Description
						text={ __( 'Turn on a larger, high-contrast cursor for improved visibility.', 'ninja-accessibility' ) }
					/>
				</BlockStack>
			</SettingsField>

			<Disabled
				depend={ ! enabled }
				dependOn="pnpna-enable-cursor"
				dependOnExact
				gap={ 20 }
			>
					<SettingsField
						title={ __( 'Cursor Style', 'ninja-accessibility' ) }
						description={ __( 'Select the design and appearance of the custom cursor.', 'ninja-accessibility' ) }
					>
						<BlockStack gap={ 20 }>
							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Cursor Icon', 'ninja-accessibility' ) }
								</Text>
								<SelectBox
									size="small"
									background="gray-50"
									style={ { width: 220 } }
									options={ ICON_TYPES }
									value={ [ iconType ] }
									onChange={ ( value ) => {
										const type = value[ 0 ] as 'icon' | 'custom';

										// Custom cursor upload is a premium feature.
										if ( type === 'custom' && ! isProUser ) {
											window.open( window.pnpna?.upgradeUrl || '#', '_blank', 'noopener' );
											return;
										}

										setIconType( type );
										if ( type === 'icon' ) {
											update( 'cursor_icon', { id: iconId === 'custom' ? 'cursor1' : iconId } );
										}
									} }
								/>
							</BlockStack>

							{ iconType === 'icon' && (
								<div
									className="pnpna-cursor-grid"
									role="radiogroup"
									aria-label={ __( 'Cursor shape', 'ninja-accessibility' ) }
								>
									{ CURSOR_SHAPES.map( ( shape ) => (
										<button
											key={ shape.id }
											type="button"
											role="radio"
											aria-checked={ iconId === shape.id }
											aria-label={ shape.id }
											className={
												'pnpna-cursor-grid__item' +
												( iconId === shape.id ? ' pnpna-cursor-grid__item--active' : '' )
											}
											onClick={ () => update( 'cursor_icon', { id: shape.id } ) }
										>
											<img
												src={ buildCursorDataUri( shape.id, iconId === shape.id ? cursorColor : '#6b7280', 20 ) }
												alt=""
												aria-hidden="true"
												width={ 20 }
												height={ 20 }
											/>
										</button>
									) ) }
									{ FILE_CURSORS.map( ( cur ) => (
										<button
											key={ cur.id }
											type="button"
											role="radio"
											aria-checked={ iconId === cur.id }
											aria-label={ cur.id }
											className={
												'pnpna-cursor-grid__item' +
												( iconId === cur.id ? ' pnpna-cursor-grid__item--active' : '' )
											}
											onClick={ () => update( 'cursor_icon', { id: cur.id } ) }
										>
											<img
												src={ fileCursorUrl( cur.id ) }
												alt=""
												aria-hidden="true"
												width={ 22 }
												height={ 22 }
											/>
										</button>
									) ) }
								</div>
							) }

							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Cursor Size', 'ninja-accessibility' ) }
								</Text>
								<Description
									text={ __( 'Adjust the size of the custom cursor for better visibility.', 'ninja-accessibility' ) }
								/>
								<Slider
									min={ 8 }
									max={ 128 }
									value={ cursorSize }
									defaultValue={ 20 }
									reset
									onChange={ ( value ) => update( 'cursor_size', String( value ) ) }
								/>
							</BlockStack>

							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Cursor Color', 'ninja-accessibility' ) }
								</Text>
								<Description
									text={ __( 'Choose the color of the custom cursor to enhance contrast and visibility.', 'ninja-accessibility' ) }
								/>
								<ColorPicker
									selectedColor={ cursorColor }
									defaultColor="#1a1a1a"
									onChange={ ( color ) => update( 'cursor_color', color ) }
								/>
							</BlockStack>

						</BlockStack>
					</SettingsField>

					<SettingsField
						title={ __( 'Behaviour', 'ninja-accessibility' ) }
					>
						<BlockStack gap={ 10 }>
							<Switcher
								title={ __( 'Hide Cursor On Responsive Devices', 'ninja-accessibility' ) }
								titleSize="sm"
								checked={ hideOnMobile }
								onChange={ ( checked ) => update( 'hide_cursor_on_mobile', checked ? '1' : '0' ) }
							/>
							<Description
								text={ __( 'Disable the custom cursor on mobile and touch devices.', 'ninja-accessibility' ) }
							/>
						</BlockStack>
					</SettingsField>

					<SettingsField
						title={ __( 'Scope', 'ninja-accessibility' ) }
						description={ __( 'Where the custom cursor should apply.', 'ninja-accessibility' ) }
					>
						<BlockStack gap={ 20 }>

							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'CSS Selectors', 'ninja-accessibility' ) }
								</Text>
								<Description
									text={ __( 'Optional: limit the cursor to specific elements (comma-separated). Leave empty for the whole page.', 'ninja-accessibility' ) }
								/>
								<input
									type="text"
									className="pn-input__field pnpna-selectors-input"
									placeholder=".hero-section, #content, .entry-content"
									value={ cssSelectors }
									onChange={ ( e ) => update( 'cursor_css_selectors', e.target.value ) }
									aria-label={ __( 'CSS selectors', 'ninja-accessibility' ) }
								/>
							</BlockStack>
						</BlockStack>
					</SettingsField>

					<SettingsField
						title={ __( 'Preview', 'ninja-accessibility' ) }
						description={ __( 'Move your mouse inside the box to preview the custom cursor.', 'ninja-accessibility' ) }
					>
						<div
							className="pnpna-preview-cursor-box"
							style={
								isAnimatedShape
									? { cursor: 'none', position: 'relative', overflow: 'hidden' }
									: { cursor: previewCursor }
							}
							onMouseMove={ isAnimatedShape ? handlePreviewMove : undefined }
							onMouseLeave={ isAnimatedShape ? handlePreviewLeave : undefined }
						>
							<div className="pnpna-preview-cursor-box__hint">
								{ __( 'Move Your Cursor Here To Preview', 'ninja-accessibility' ) }
							</div>
							{ isAnimatedShape && (
								<>
									<div ref={ previewRingRef } aria-hidden="true" style={ previewRingStyle } />
									<div ref={ previewDotRef } aria-hidden="true" style={ previewDotStyle } />
								</>
							) }
						</div>
					</SettingsField>
			</Disabled>
		</PageContainer>
	);
}
