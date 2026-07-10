/**
 * Capabilities page — toggle each accessibility feature offered by the widget.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import SettingsField from '~/shared/molecules/SettingsField';
import { GridStack, InlineStack, PageContainer } from '~/ui/molecules';
import { Button, Icon, Input, Switcher, Text } from '~/ui/atoms';
import type { PluginSettings } from '~/kernel/types/settings';

interface CapItem {
	key: keyof PluginSettings;
	label: string;
	icon: string;
}

const CONTENT_ADJUSTMENTS: CapItem[] = [
	{ key: 'content_scaling', label: __( 'Content Scaling', 'ninja-accessibility' ), icon: 'open_in_full' },
	{ key: 'bigger_text', label: __( 'Font Sizing', 'ninja-accessibility' ), icon: 'format_size' },
	{ key: 'bigger_line_height', label: __( 'Line Height', 'ninja-accessibility' ), icon: 'format_line_spacing' },
	{ key: 'letter_spacing', label: __( 'Letter Spacing', 'ninja-accessibility' ), icon: 'format_letter_spacing' },
	{ key: 'text_align', label: __( 'Text Align', 'ninja-accessibility' ), icon: 'format_align_left' },
	{ key: 'readable_font', label: __( 'Readable Font', 'ninja-accessibility' ), icon: 'font_download' },
	{ key: 'text_magnifier', label: __( 'Text Magnifier', 'ninja-accessibility' ), icon: 'zoom_in' },
	{ key: 'highlight_links', label: __( 'Highlight Links', 'ninja-accessibility' ), icon: 'link' },
];

const NAVIGATION_TOOLS: CapItem[] = [
	{ key: 'cursor', label: __( 'Big Cursor', 'ninja-accessibility' ), icon: 'mouse' },
	{ key: 'page_structure', label: __( 'Page Structure', 'ninja-accessibility' ), icon: 'account_tree' },
	{ key: 'screen_reader', label: __( 'Screen Reader', 'ninja-accessibility' ), icon: 'record_voice_over' },
	{ key: 'reading_mask', label: __( 'Reading Mask', 'ninja-accessibility' ), icon: 'view_agenda' },
	{ key: 'reading_line', label: __( 'Reading Line', 'ninja-accessibility' ), icon: 'horizontal_rule' },
	{ key: 'sitemap', label: __( 'Sitemap', 'ninja-accessibility' ), icon: 'map' },
	{ key: 'outline_focus', label: __( 'Outline Focus', 'ninja-accessibility' ), icon: 'center_focus_strong' },
];

const VISUAL_ADJUSTMENTS: CapItem[] = [
	{ key: 'hide_images', label: __( 'Hide Images', 'ninja-accessibility' ), icon: 'image_not_supported' },
	{ key: 'pause_animation', label: __( 'Pause Animations', 'ninja-accessibility' ), icon: 'motion_photos_paused' },
	{ key: 'mute_sounds', label: __( 'Mute Sounds', 'ninja-accessibility' ), icon: 'volume_off' },
	{ key: 'grey_scale', label: __( 'Greyscale', 'ninja-accessibility' ), icon: 'invert_colors_off' },
	{ key: 'contrast', label: __( 'High Contrast', 'ninja-accessibility' ), icon: 'contrast' },
	{ key: 'invert_color', label: __( 'Invert Colors', 'ninja-accessibility' ), icon: 'invert_colors' },
	{ key: 'brightness', label: __( 'Brightness', 'ninja-accessibility' ), icon: 'brightness_high' },
	{ key: 'saturation', label: __( 'Saturation', 'ninja-accessibility' ), icon: 'water_drop' },
];

function CapabilityGrid( { items, search }: { items: CapItem[]; search: string } ) {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );

	return (
		<GridStack columns={ 2 } gap={ 12 }>
			{ items.map( ( item ) => {
				// Filter by search
				if ( search && ! item.label.toLowerCase().includes( search.toLowerCase() ) ) {
					return null;
				}

				return (
					<InlineStack
						key={ item.key }
						gap={ 10 }
						align="between"
						className="pnpna-capability"
					>
						<InlineStack gap={ 10 }>
							<Icon name={ item.icon } color="gray-600" fontSize="lg" />
							<Text size="sm" color="gray-700">{ item.label }</Text>
						</InlineStack>
						<Switcher
							ariaLabel={ item.label }
							checked={ settings[ item.key ] === '1' }
							onChange={ ( checked ) =>
								dispatch(
									updateSetting( {
										key: item.key,
										value: ( checked ? '1' : '0' ) as never,
									} )
								)
							}
						/>
					</InlineStack>
				);
			} ) }
		</GridStack>
	);
}

// All capability items combined for Enable All / Disable All
const ALL_CAPABILITIES = [
	...CONTENT_ADJUSTMENTS,
	...NAVIGATION_TOOLS,
	...VISUAL_ADJUSTMENTS,
];

export default function Capabilities() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const [ search, setSearch ] = useState( '' );

	// Get all feature keys
	const allFeatureKeys = ALL_CAPABILITIES.map( ( item ) => item.key );

	// Handle Enable All
	const handleEnableAll = () => {
		allFeatureKeys.forEach( ( key ) => {
			if ( settings[ key ] !== '1' ) {
				dispatch( updateSetting( { key, value: '1' as never } ) );
			}
		} );
	};

	// Handle Disable All
	const handleDisableAll = () => {
		allFeatureKeys.forEach( ( key ) => {
			if ( settings[ key ] === '1' ) {
				dispatch( updateSetting( { key, value: '0' as never } ) );
			}
		} );
	};

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			<SettingsField>
				<InlineStack gap={ 10 } align="between">
					<Input
						size="small"
						background="gray-50"
						color="gray-200"
						placeholder={ __( 'Search features…', 'ninja-accessibility' ) }
						suffix={ <Icon name="search" color="gray-700" fontSize="lg" /> }
						value={ search }
						onChange={ ( value ) => setSearch( String( value ) ) }
						fullWidth={ false }
						customWidth="180px"
					/>

					<InlineStack gap={ 10 }>
						<Button
							variant="gray"
							size="small"
							startIcon="blur_on"
							onClick={ handleEnableAll }
						>
							{ __( 'Enable All', 'ninja-accessibility' ) }
						</Button>

						<Button
							variant="error"
							size="small"
							startIcon="deselect"
							onClick={ handleDisableAll }
						>
							{ __( 'Disable All', 'ninja-accessibility' ) }
						</Button>
					</InlineStack>
				</InlineStack>
			</SettingsField>

			<SettingsField
				title={ __( 'Content Adjustments', 'ninja-accessibility' ) }
				description={ __( 'Reading and text aids shown in the widget.', 'ninja-accessibility' ) }
			>
				<CapabilityGrid items={ CONTENT_ADJUSTMENTS } search={ search } />
			</SettingsField>

			<SettingsField
				title={ __( 'Navigation Tools', 'ninja-accessibility' ) }
				description={ __( 'Orientation and navigation aids shown in the widget.', 'ninja-accessibility' ) }
			>
				<CapabilityGrid items={ NAVIGATION_TOOLS } search={ search } />
			</SettingsField>

			<SettingsField
				title={ __( 'Visual Adjustments', 'ninja-accessibility' ) }
				description={ __( 'Color and motion aids shown in the widget.', 'ninja-accessibility' ) }
			>
				<CapabilityGrid items={ VISUAL_ADJUSTMENTS } search={ search } />
			</SettingsField>
		</PageContainer>
	);
}
