/**
 * Design settings page — widget icon, colors, and per-device position.
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
import { Button, ColorPicker, Slider, Switcher, Text } from '~/ui/atoms';
import PositionPicker from '~/ui/controls/PositionPicker';
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

const DEVICES: { key: DeviceKey; label: string; icon: string }[] = [
	{ key: 'desktop', label: __( 'Desktop', 'ninja-accessibility' ), icon: 'desktop_windows' },
	{ key: 'tablet', label: __( 'Tablet', 'ninja-accessibility' ), icon: 'tablet' },
	{ key: 'phone', label: __( 'Mobile', 'ninja-accessibility' ), icon: 'phone_iphone' },
];

export default function Design() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const [ device, setDevice ] = useState<DeviceKey>( 'desktop' );

	function update<K extends keyof PluginSettings>( key: K, value: PluginSettings[ K ] ) {
		dispatch( updateSetting( { key, value } ) );
	}

	const iconId = settings.widget_icon?.id || 'icon1';
	const iconSize = ( settings.icon_size || 'pnpna-icon-lg' ) as IconSize;
	const radius = parseInt( String( settings.icon_corner_radius || 100 ), 10 );
	const bgColor = String( settings.icon_bg_color || '#003C43' );

	const showIcon = settings[ `show_icon_${ device }` ] === '1';
	const exact = settings[ `exact_position_${ device }` ] === '1';
	const position = String( settings[ `${ device }_icon_position` ] || 'bottom-right' );
	const exactX = parseInt( String( settings[ `exact_position_${ device }_x` ] || 40 ), 10 );
	const exactY = parseInt( String( settings[ `exact_position_${ device }_y` ] || 40 ), 10 );

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
								defaultColor="#003C43"
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
						{ DEVICES.map( ( item ) => (
							<Button
								key={ item.key }
								variant={ device === item.key ? 'primary' : 'outlined' }
								size="small"
								startIcon={ item.icon }
								onClick={ () => setDevice( item.key ) }
							>
								{ item.label }
							</Button>
						) ) }
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

							<BlockStack gap={ 10 }>
								<Switcher
									title={ __( 'Exact Position', 'ninja-accessibility' ) }
									titleSize="sm"
									checked={ exact }
									onChange={ ( checked ) =>
										update( `exact_position_${ device }`, checked ? '1' : '0' )
									}
								/>
								<Description
									text={ __( "Manually set the icon's distance from the screen edges.", 'ninja-accessibility' ) }
								/>

								{ exact && (
									<InlineStack gap={ 20 }>
										<BlockStack gap={ 5 }>
											<Text size="xs" color="gray-500">X (px)</Text>
											<Slider
												min={ 0 }
												max={ 400 }
												value={ exactX }
												defaultValue={ 40 }
												onChange={ ( value ) =>
													update( `exact_position_${ device }_x`, String( value ) )
												}
											/>
										</BlockStack>
										<BlockStack gap={ 5 }>
											<Text size="xs" color="gray-500">Y (px)</Text>
											<Slider
												min={ 0 }
												max={ 400 }
												value={ exactY }
												defaultValue={ 40 }
												onChange={ ( value ) =>
													update( `exact_position_${ device }_y`, String( value ) )
												}
											/>
										</BlockStack>
									</InlineStack>
								) }
							</BlockStack>
						</>
					) }
				</BlockStack>
			</SettingsField>
		</PageContainer>
	);
}
