/**
 * Capabilities page — toggle each accessibility feature offered by the widget.
 *
 * Premium-locked items mirror the Accessiy pro map: they render with an
 * upgrade badge (Status) for free users and are enforced server-side in
 * Helpers::get_active_elements().
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import SettingsField from '~/shared/molecules/SettingsField';
import { GridStack, InlineStack, PageContainer } from '~/ui/molecules';
import { Button, Icon, Input, Status, Switcher, Text } from '~/ui/atoms';
import { toBoolean } from '~/kernel/utils/functions';
import type { PluginSettings } from '~/kernel/types/settings';

interface CapItem {
	key: keyof PluginSettings;
	label: string;
	icon: string;
	isPro?: boolean;
}

// Accessibility profiles (UserWay-style preset groups). Pro-locked profiles
// mirror Helpers::PRO_PROFILES — their presets depend on pro capabilities.
const ACCESSIBILITY_PROFILES: CapItem[] = [
	{ key: 'profile_motor_impaired', label: __( 'Motor Impaired', 'ninja-accessibility' ), icon: 'accessible' },
	{ key: 'profile_dyslexia', label: __( 'Dyslexia', 'ninja-accessibility' ), icon: 'spellcheck' },
	{ key: 'profile_low_vision', label: __( 'Low Vision', 'ninja-accessibility' ), icon: 'visibility' },
	{ key: 'profile_cognitive_learning', label: __( 'Cognitive & Learning', 'ninja-accessibility' ), icon: 'extension' },
];

const CONTENT_ADJUSTMENTS: CapItem[] = [
	{ key: 'content_scaling', label: __( 'Content Scaling', 'ninja-accessibility' ), icon: 'open_in_full' },
	{ key: 'bigger_text', label: __( 'Font Sizing', 'ninja-accessibility' ), icon: 'format_size' },
	{ key: 'bigger_line_height', label: __( 'Line Height', 'ninja-accessibility' ), icon: 'format_line_spacing' },
	{ key: 'letter_spacing', label: __( 'Letter Spacing', 'ninja-accessibility' ), icon: 'format_letter_spacing' },
	{ key: 'text_align', label: __( 'Text Align', 'ninja-accessibility' ), icon: 'format_align_left' },
	{ key: 'readable_font', label: __( 'Readable Font', 'ninja-accessibility' ), icon: 'font_download' },
	{ key: 'highlight_links', label: __( 'Highlight Links', 'ninja-accessibility' ), icon: 'link' },
];

const NAVIGATION_TOOLS: CapItem[] = [
	{ key: 'cursor', label: __( 'Big Cursor', 'ninja-accessibility' ), icon: 'mouse' },
	{ key: 'reading_line', label: __( 'Reading Line', 'ninja-accessibility' ), icon: 'horizontal_rule' },
	{ key: 'outline_focus', label: __( 'Outline Focus', 'ninja-accessibility' ), icon: 'center_focus_strong' },
];

const VISUAL_ADJUSTMENTS: CapItem[] = [
	{ key: 'hide_images', label: __( 'Hide Images', 'ninja-accessibility' ), icon: 'image_not_supported' },
	{ key: 'pause_animation', label: __( 'Pause Animations', 'ninja-accessibility' ), icon: 'motion_photos_paused' },
	{ key: 'brightness', label: __( 'Brightness', 'ninja-accessibility' ), icon: 'brightness_high' },
];

function CapabilityGrid( { items, search }: { items: CapItem[]; search: string } ) {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const isProUser = toBoolean( window.pnpna?.is_pro );

	return (
		<GridStack columns={ 2 } gap={ 12 }>
			{ items.map( ( item ) => {
				// Filter by search
				if ( search && ! item.label.toLowerCase().includes( search.toLowerCase() ) ) {
					return null;
				}

				const row = (
					<InlineStack
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
							checked={ settings[ item.key ] === '1' && ( ! item.isPro || isProUser ) }
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

				if ( item.isPro ) {
					return (
						<Status
							key={ item.key }
							isPro
							size="extrasmall"
							placement="right-center"
							right={ 45 }
						>
							{ row }
						</Status>
					);
				}

				return <div key={ item.key }>{ row }</div>;
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
	const isProUser = toBoolean( window.pnpna?.is_pro );

	// Bulk actions only touch features the current license may change.
	const editableKeys = ALL_CAPABILITIES
		.filter( ( item ) => ! item.isPro || isProUser )
		.map( ( item ) => item.key );

	// Handle Enable All
	const handleEnableAll = () => {
		editableKeys.forEach( ( key ) => {
			if ( settings[ key ] !== '1' ) {
				dispatch( updateSetting( { key, value: '1' as never } ) );
			}
		} );
	};

	// Handle Disable All
	const handleDisableAll = () => {
		editableKeys.forEach( ( key ) => {
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
						customWidth="380px"
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
				title={ __( 'Accessibility Profiles', 'ninja-accessibility' ) }
				description={ __( 'One-click preset groups (UserWay style) shown at the top of the widget. Each profile switches on a set of capabilities suited to a specific need.', 'ninja-accessibility' ) }
				action={
					<Switcher
						ariaLabel={ __( 'Enable accessibility profiles', 'ninja-accessibility' ) }
						checked={ settings.enable_profiles === '1' }
						onChange={ ( checked ) =>
							dispatch(
								updateSetting( {
									key: 'enable_profiles',
									value: ( checked ? '1' : '0' ) as never,
								} )
							)
						}
					/>
				}
			>
				{ settings.enable_profiles === '1' && (
					<>
						<CapabilityGrid items={ ACCESSIBILITY_PROFILES } search={ search } />

						<InlineStack
							gap={ 10 }
							align="between"
							className="pnpna-capability"
							style={ { marginTop: 12 } }
						>
							<InlineStack gap={ 10 }>
								<Icon name="open_in_full" color="gray-600" fontSize="lg" />
								<Text size="sm" color="gray-700">
									{ __( 'Offer "Oversized Widget" toggle to visitors', 'ninja-accessibility' ) }
								</Text>
							</InlineStack>
							<Switcher
								ariaLabel={ __( 'Offer Oversized Widget toggle', 'ninja-accessibility' ) }
								checked={ settings.oversized_widget === '1' }
								onChange={ ( checked ) =>
									dispatch(
										updateSetting( {
											key: 'oversized_widget',
											value: ( checked ? '1' : '0' ) as never,
										} )
									)
								}
							/>
						</InlineStack>
					</>
				) }
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
