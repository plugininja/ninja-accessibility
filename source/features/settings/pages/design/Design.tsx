/**
 * Design settings page — widget icon, colors, and per-device position.
 *
 * Premium (Accessiy pro map): custom icon upload, tablet / mobile
 * positioning, and exact positioning. Enforced server-side in App\Display.
 */

import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import SettingsField from '~/shared/molecules/SettingsField';
import {
	BlockStack,
	Description,
	InlineStack,
	PageContainer,
	SelectBox,
} from '~/ui/molecules';
import { Button, ColorPicker, Slider, Status, Switcher, Text } from '~/ui/atoms';
import PositionPicker from '~/ui/controls/PositionPicker';
import { isLightColor, toBoolean } from '~/kernel/utils/functions';
import type { IconPosition, IconSize, PluginSettings } from '~/kernel/types/settings';

type DeviceKey = 'desktop' | 'tablet' | 'phone';

const ICON_SIZE_OPTIONS: { value: IconSize; name: string }[] = [
	{ value: 'pnpna-icon-sm', name: __( 'Small', 'ninja-accessibility' ) },
	{ value: 'pnpna-icon-md', name: __( 'Medium', 'ninja-accessibility' ) },
	{ value: 'pnpna-icon-lg', name: __( 'Large', 'ninja-accessibility' ) },
];

// Built-in widget icons (accessiy icon set) — white glyph SVGs in
// assets/images/icons/, rendered on the widget background colour.
const BUILT_IN_ICONS = [
	{ id: 'icon1' },
	{ id: 'icon2' },
	{ id: 'icon3' },
	{ id: 'icon4' },
	{ id: 'icon5' },
	{ id: 'icon6' },
	{ id: 'icon7' },
];

const DEVICES: { key: DeviceKey; label: string; icon: string; isPro?: boolean }[] = [
	{ key: 'desktop', label: __( 'Desktop', 'ninja-accessibility' ), icon: 'desktop_windows' },
];

interface MediaFrame {
	on: ( event: string, cb: () => void ) => void;
	open: () => void;
	state: () => { get: ( k: string ) => { first: () => { toJSON: () => { url?: string } } } };
}

export default function Design() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const [ device, setDevice ] = useState<DeviceKey>( 'desktop' );
	const isProUser = toBoolean( window.pnpna?.is_pro );

	function update<K extends keyof PluginSettings>( key: K, value: PluginSettings[ K ] ) {
		dispatch( updateSetting( { key, value } ) );
	}

	const iconId = settings.widget_icon?.id || 'icon1';
	const customIconUrl = settings.widget_icon?.icon || '';
	const iconSize = ( settings.icon_size || 'pnpna-icon-lg' ) as IconSize;
	const radius = parseInt( String( settings.icon_corner_radius || 100 ), 10 );
	const bgColor = String( settings.icon_bg_color || '#9147FF' );

	// Accessiy parity: when the background colour is very light (~80% white),
	// flip the white glyph to a dark one so it stays visible.
	const darkIcon = isLightColor( bgColor );

	const showIcon = settings[ `show_icon_${ device }` ] === '1';
	const exact = isProUser && settings[ `exact_position_${ device }` ] === '1';
	const position = String( settings[ `${ device }_icon_position` ] || 'bottom-right' );
	const exactX = parseInt( String( settings[ `exact_position_${ device }_x` ] || 40 ), 10 );
	const exactY = parseInt( String( settings[ `exact_position_${ device }_y` ] || 40 ), 10 );

	const openMediaLibrary = () => {
		const wpGlobal = ( window as unknown as { wp?: { media?: ( args: object ) => MediaFrame } } ).wp;

		if ( ! wpGlobal?.media ) {
			return;
		}

		const frame = wpGlobal.media( {
			title: __( 'Select Widget Icon', 'ninja-accessibility' ),
			multiple: false,
			library: { type: 'image' },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			if ( attachment.url ) {
				update( 'widget_icon', { id: 'custom', icon: attachment.url } );
			}
		} );

		frame.open();
	};

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			{ /* ── Widget style ─────────────────────────────────────────── */ }
			<SettingsField
				title={ __( 'Widget Style', 'ninja-accessibility' ) }
				description={ __( "Customize your widget's color, icon, and size to match your brand.", 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 20 }>
					<BlockStack gap={ 10 }>
						<Text size="sm" weight="medium" color="gray-700">
							{ __( 'Widget Icon', 'ninja-accessibility' ) }
						</Text>
						<InlineStack gap={ 8 }>
							{ BUILT_IN_ICONS.map( ( icon ) => (
								<button
									key={ icon.id }
									type="button"
									className={
										'pnpna-icon-choice pnpna-icon-choice--glyph' +
										( darkIcon ? ' pnpna-darker-icon' : '' ) +
										( iconId === icon.id ? ' pnpna-icon-choice--active' : '' )
									}
									style={ { background: bgColor } }
									aria-pressed={ iconId === icon.id }
									aria-label={ icon.id }
									onClick={ () => update( 'widget_icon', { id: icon.id } ) }
								>
									<img
										src={ `${ window.pnpna?.assetsUrl || '' }/images/icons/${ icon.id }.svg` }
										alt=""
										aria-hidden="true"
										width={ 22 }
										height={ 22 }
									/>
								</button>
							) ) }
						</InlineStack>
					</BlockStack>

					<InlineStack gap={ 20 } align="between">
						<BlockStack gap={ 10 }>
							<Text size="sm" weight="medium" color="gray-700">
								{ __( 'Icon Size', 'ninja-accessibility' ) }
							</Text>
							<SelectBox
								size="small"
								background="gray-50"
								style={ { width: 180 } }
								options={ ICON_SIZE_OPTIONS }
								value={ [ iconSize ] }
								onChange={ ( value ) => update( 'icon_size', value[ 0 ] as IconSize ) }
							/>
						</BlockStack>

						<BlockStack gap={ 10 }>
							<Text size="sm" weight="medium" color="gray-700">
								{ __( 'Icon Background Color', 'ninja-accessibility' ) }
							</Text>
							<ColorPicker
								selectedColor={ bgColor }
								defaultColor="#9147FF"
								onChange={ ( color ) => update( 'icon_bg_color', color ) }
							/>
						</BlockStack>
					</InlineStack>

					<BlockStack gap={ 10 }>
						<Text size="sm" weight="medium" color="gray-700">
							{ __( 'Corner Radius', 'ninja-accessibility' ) }
						</Text>
						<Slider
							min={ 0 }
							max={ 100 }
							value={ radius }
							defaultValue={ 100 }
							reset
							onChange={ ( value ) => update( 'icon_corner_radius', String( value ) ) }
						/>
					</BlockStack>
				</BlockStack>
			</SettingsField>

			{ /* ── Per-device position ──────────────────────────────────── */ }
			<SettingsField
				title={ __( 'Position', 'ninja-accessibility' ) }
				description={ __( 'Choose where the widget appears on each device.', 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 20 }>
					<InlineStack gap={ 8 }>
						{ DEVICES.map( ( item ) => {
							const btn = (
								<Button
									variant={ device === item.key ? 'primary' : 'outlined' }
									size="small"
									startIcon={ item.icon }
									onClick={ () => {
										if ( item.isPro && ! isProUser ) {
											return;
										}
										setDevice( item.key );
									} }
								>
									{ item.label }
								</Button>
							);

							if ( item.isPro ) {
								return (
									<Status
										key={ item.key }
										isPro
										size="extrasmall"
										widthFull={ false }
										top={ -6 }
										right={ -6 }
									>
										{ btn }
									</Status>
								);
							}

							return <div key={ item.key }>{ btn }</div>;
						} ) }
					</InlineStack>

					<BlockStack gap={ 10 }>
						<Switcher
							title={ __( 'Show Widget on This Device', 'ninja-accessibility' ) }
							titleSize="sm"
							checked={ showIcon }
							onChange={ ( checked ) =>
								update( `show_icon_${ device }`, checked ? '1' : '0' )
							}
						/>
					</BlockStack>

					{ showIcon && (
						<>
							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Default Position', 'ninja-accessibility' ) }
								</Text>
								<Description
									text={ __( 'Set the initial position of the accessibility widget on load.', 'ninja-accessibility' ) }
								/>
								<PositionPicker
									value={ position }
									onChange={ ( value: IconPosition ) =>
										update( `${ device }_icon_position`, value )
									}
								/>
							</BlockStack>

						</>
					) }
				</BlockStack>
			</SettingsField>
		</PageContainer>
	);
}
