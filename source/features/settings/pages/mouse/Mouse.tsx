/**
 * Mouse / custom-cursor settings page — design-system components with a
 * live preview of the generated cursor (same SVG the PHP layer outputs).
 */

import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import { useGetPagesQuery } from '~/features/settings/api/settingsApi';
import SettingsField from '~/shared/molecules/SettingsField';
import {
	BlockStack,
	Description,
	InlineStack,
	PageContainer,
	SelectBox,
} from '~/ui/molecules';
import { Button, ColorPicker, Slider, Switcher, Text } from '~/ui/atoms';
import type { PluginSettings } from '~/kernel/types/settings';

// Built-in cursor shapes — MUST stay in sync with Mouse_Customization::SHAPES.
const CURSOR_SHAPES: { id: string; inner: string }[] = [
	{ id: 'cursor1', inner: '<circle cx="10" cy="10" r="3" fill="{c}"/><circle cx="10" cy="10" r="8" fill="none" stroke="{c}" stroke-width="1.5"/>' },
	{ id: 'cursor2', inner: '<circle cx="10" cy="10" r="4" fill="none" stroke="{c}" stroke-width="2"/>' },
	{ id: 'cursor3', inner: '<circle cx="10" cy="10" r="9" fill="none" stroke="{c}" stroke-width="2"/>' },
	{ id: 'cursor4', inner: '<circle cx="10" cy="10" r="5" fill="{c}"/>' },
	{ id: 'cursor5', inner: '<circle cx="10" cy="10" r="8" fill="{c}"/>' },
];

const CURSOR_EFFECTS = [
	{ value: 'none', name: __( 'None', 'ninja-accessibility' ) },
	{ value: 'followingDot', name: __( 'Following Dot', 'ninja-accessibility' ) },
	/* <fs_premium_only> */
	// Pro cursor effects.
	/* </fs_premium_only> */
];

const ICON_TYPES = [
	{ value: 'icon', name: __( 'Built-in Icon', 'ninja-accessibility' ) },
	{ value: 'custom', name: __( 'Custom Upload', 'ninja-accessibility' ) },
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
		const url = iconType === 'custom' && customIconUrl
			? customIconUrl
			: buildCursorDataUri( iconId, cursorColor, cursorSize );
		const hotspot = Math.floor( cursorSize / 2 );
		return `url("${ url }") ${ hotspot } ${ hotspot }, auto`;
	}, [ iconType, customIconUrl, iconId, cursorColor, cursorSize ] );

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

			{ enabled && (
				<>
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
									style={ { width: 200 } }
									options={ ICON_TYPES }
									value={ [ iconType ] }
									onChange={ ( value ) => {
										const type = value[ 0 ] as 'icon' | 'custom';
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
								</div>
							) }

							{ iconType === 'custom' && (
								<InlineStack gap={ 15 }>
									{ customIconUrl && (
										<img src={ customIconUrl } alt="" width={ 32 } height={ 32 } />
									) }
									<Button
										variant="outlined"
										startIcon="upload"
										onClick={ openMediaLibrary }
									>
										{ customIconUrl
											? __( 'Change Icon', 'ninja-accessibility' )
											: __( 'Upload Icon', 'ninja-accessibility' ) }
									</Button>
								</InlineStack>
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

							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Cursor Effect', 'ninja-accessibility' ) }
								</Text>
								<Description
									text={ __( 'Add a motion effect that follows the cursor.', 'ninja-accessibility' ) }
								/>
								<SelectBox
									size="small"
									background="gray-50"
									style={ { width: 200 } }
									options={ CURSOR_EFFECTS }
									value={ [ effect ] }
									onChange={ ( value ) =>
										update( 'cursor_effect_type', value[ 0 ] as PluginSettings[ 'cursor_effect_type' ] )
									}
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
									{ __( 'Apply Cursor On', 'ninja-accessibility' ) }
								</Text>
								<SelectBox
									size="small"
									background="gray-50"
									style={ { width: 220 } }
									options={ [
										{ value: 'entire_website', name: __( 'Entire Website', 'ninja-accessibility' ) },
										{ value: 'page', name: __( 'Specific Page', 'ninja-accessibility' ) },
									] }
									value={ [ applyIsPage ? 'page' : 'entire_website' ] }
									onChange={ ( value ) =>
										update(
											'apply_cursor',
											value[ 0 ] === 'entire_website'
												? 'entire_website'
												: String( pages[ 0 ]?.value || 'entire_website' )
										)
									}
								/>
							</BlockStack>

							{ applyIsPage && (
								<BlockStack gap={ 10 }>
									<Text size="sm" weight="medium" color="gray-700">
										{ __( 'Specific Page', 'ninja-accessibility' ) }
									</Text>
									<SelectBox
										size="small"
										background="gray-50"
										searchable
										style={ { width: 280 } }
										options={ pages.map( ( page ) => ( {
											value: String( page.value ),
											name: page.label,
										} ) ) }
										value={ [ applyCursor ] }
										onChange={ ( value ) => update( 'apply_cursor', String( value[ 0 ] ) ) }
									/>
								</BlockStack>
							) }

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
							style={ { cursor: previewCursor } }
						>
							<div className="pnpna-preview-cursor-box__hint">
								{ __( 'Move Your Cursor Here To Preview', 'ninja-accessibility' ) }
							</div>
						</div>
					</SettingsField>
				</>
			) }
		</PageContainer>
	);
}
