/**
 * Analytics settings page (premium feature) — single-file, ninja-drive style.
 *
 * The page shell ships in the wp.org build so free users see the feature
 * (locked with an upgrade badge via <SettingsField isPro>). The live
 * dashboard lives inside premium-only comment blocks below and is stripped
 * from both free builds (github + wporg) by the strip script.
 *
 * Dashboard layout mirrors the approved mockup:
 *   1. "Display Data From" — date-range filter row.
 *   2. Grid: Widget Opens line chart (hero number + two series)
 *      beside a Top Features card.
 *   3. Full-width Feature Usage table.
 *
 * Chart palette (validated for CVD + lightness + chroma):
 *   opens  #009e41 (green, soft area fill)
 *   clicks #0369a1 (blue)
 * Identity is never color-alone: legend + tooltips + full table view.
 */

import { __ } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import SettingsField from '~/shared/molecules/SettingsField';
import { BlockStack, Description, PageContainer } from '~/ui/molecules';
import { Switcher } from '~/ui/atoms';
import { toBoolean } from '~/kernel/utils/functions';

// The live dashboard only exists in the premium build.
let AnalyticsDashboard: React.ComponentType | null = null;

export default function Analytics() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );

	const isPro = toBoolean( window.pnpna?.is_pro );
	const enabled = settings.enable_analytics === '1';

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			<SettingsField statusProps={ { isPro: true, placement: 'right-center' } }>
				<BlockStack gap={ 10 }>
					<Switcher
						title={ __( 'Enable Analytics', 'ninja-accessibility' ) }
						titleSize="sm"
						checked={ isPro && enabled }
						onChange={ ( checked ) => {
							// Premium feature — free installs cannot enable it.
							if ( ! isPro ) {
								return;
							}
							dispatch(
								updateSetting( {
									key: 'enable_analytics',
									value: checked ? '1' : '0',
								} )
							);
						} }
					/>
					<Description
						text={ __( 'Track how often visitors open the accessibility widget and which tools they use. Only anonymous, aggregated counters are stored — never any visitor data.', 'ninja-accessibility' ) }
					/>
				</BlockStack>
			</SettingsField>

			{ isPro && enabled && AnalyticsDashboard && <AnalyticsDashboard /> }

			{ isPro && ! enabled && (
				<SettingsField>
					<Description
						text={ __( 'Turn on analytics and save your settings to start collecting usage data.', 'ninja-accessibility' ) }
					/>
				</SettingsField>
			) }
		</PageContainer>
	);
}
