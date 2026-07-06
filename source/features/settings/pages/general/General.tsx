/**
 * General settings page.
 */

import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import SettingsField from '~/shared/molecules/SettingsField';
import { BlockStack, Description, PageContainer, SelectBox } from '~/ui/molecules';
import { Switcher, Text } from '~/ui/atoms';
import languages from '~/features/widget/i18n/languages';
import type { PluginSettings } from '~/kernel/types/settings';

const LANGUAGE_OPTIONS = Object.entries( languages ).map( ( [ value, { label } ] ) => ( {
	value,
	name: label,
} ) );

export default function General() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );

	function update<K extends keyof PluginSettings>( key: K, value: PluginSettings[ K ] ) {
		dispatch( updateSetting( { key, value } ) );
	}

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			<SettingsField
				title={ __( 'Widget', 'ninja-accessibility' ) }
				description={ __( 'Control the floating accessibility button on the frontend.', 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 10 }>
					<Switcher
						title={ __( 'Enable Accessibility Widget', 'ninja-accessibility' ) }
						titleSize="sm"
						checked={ settings.enable_widget === '1' }
						onChange={ ( checked ) => update( 'enable_widget', checked ? '1' : '0' ) }
					/>
					<Description
						text={ __( 'Show or hide the floating accessibility button on the frontend.', 'ninja-accessibility' ) }
					/>
				</BlockStack>
			</SettingsField>

			<SettingsField
				title={ __( 'Widget Language', 'ninja-accessibility' ) }
				description={ __( 'Default language of the widget panel. Visitors can switch languages themselves inside the widget.', 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 10 }>
					<Text size="sm" weight="medium" color="gray-700">
						{ __( 'Default Language', 'ninja-accessibility' ) }
					</Text>
					<SelectBox
						size="small"
						background="gray-50"
						searchable
						style={ { width: 240 } }
						options={ LANGUAGE_OPTIONS }
						value={ [ String( settings.widget_language || 'en' ) ] }
						onChange={ ( value ) => update( 'widget_language', String( value[ 0 ] ) ) }
					/>
				</BlockStack>
			</SettingsField>

			<SettingsField
				title={ __( 'Navigation', 'ninja-accessibility' ) }
				description={ __( 'Extra aids for keyboard and screen-reader users.', 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 10 }>
					<Switcher
						title={ __( 'Skip to Main Content Link', 'ninja-accessibility' ) }
						titleSize="sm"
						checked={ settings.skip_main_content === '1' }
						onChange={ ( checked ) => update( 'skip_main_content', checked ? '1' : '0' ) }
					/>
					<Description
						text={ __( 'Adds an invisible link that appears on keyboard focus and jumps straight to the page content.', 'ninja-accessibility' ) }
					/>
				</BlockStack>
			</SettingsField>

			<SettingsField
				title={ __( 'Branding', 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 10 }>
					<Switcher
						title={ __( 'Show "Powered By" Branding', 'ninja-accessibility' ) }
						titleSize="sm"
						checked={ settings.show_branding === '1' }
						onChange={ ( checked ) => update( 'show_branding', checked ? '1' : '0' ) }
					/>
					<Description
						text={ __( 'Display a small attribution link in the widget footer.', 'ninja-accessibility' ) }
					/>
				</BlockStack>
			</SettingsField>

			{ /* @fs_premium_only */ }
			{ /* Pro-only general settings. */ }
			{ /* @end_fs_premium_only */ }
		</PageContainer>
	);
}
