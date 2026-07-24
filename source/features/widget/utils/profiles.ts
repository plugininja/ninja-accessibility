/**
 * Accessibility profile presets (UserWay-style).
 *
 * Each profile is a named group of feature steps. Multiple profiles can be
 * active at once — their presets merge (highest step wins). The PHP side
 * decides WHICH profiles are offered (Helpers::get_active_profiles(), pro
 * gating included); this module only knows what each profile does.
 */

import { STEP_COUNTS } from '~/features/widget/utils/accessibility';
import type {
	ActiveFeatureMap,
	FeatureKey,
	ProfileKey,
} from '~/kernel/types/widget';

export interface ProfileMeta {
	key: ProfileKey;
	/** Widget-i18n translation key for the label. */
	labelKey: string;
	/** Widget-i18n translation key for the short description. */
	descriptionKey: string;
	/** Material Symbols glyph. */
	icon: string;
	/** Feature steps switched on while the profile is active. */
	preset: ActiveFeatureMap;
}

// Free profiles use free capabilities only; the presets of pro profiles
// (blind / color_blind / seizure_epileptic / adhd) rely on pro capabilities
// and are excluded from free builds server-side (Helpers::PRO_PROFILES).
export const PROFILES: ProfileMeta[] = [
	{
		key: 'motor_impaired',
		labelKey: 'MotorImpaired',
		descriptionKey: 'MotorImpairedDescription',
		icon: 'accessible',
		preset: { outline_focus: 1, cursor: 2, highlight_links: 1 },
	},
	{
		key: 'blind',
		labelKey: 'Blind',
		descriptionKey: 'BlindDescription',
		icon: 'blind',
		preset: { screen_reader: 1 },
	},
	{
		key: 'color_blind',
		labelKey: 'ColorBlind',
		descriptionKey: 'ColorBlindDescription',
		icon: 'invert_colors',
		preset: { saturation: 2, contrast: 1, highlight_links: 1 },
	},
	{
		key: 'dyslexia',
		labelKey: 'Dyslexia',
		descriptionKey: 'DyslexiaDescription',
		icon: 'spellcheck',
		preset: { readable_font: 1, letter_spacing: 1, bigger_line_height: 1 },
	},
	{
		key: 'low_vision',
		labelKey: 'LowVision',
		descriptionKey: 'LowVisionDescription',
		icon: 'visibility',
		preset: { bigger_text: 2, cursor: 2, highlight_links: 1 },
	},
	{
		key: 'cognitive_learning',
		labelKey: 'CognitiveLearning',
		descriptionKey: 'CognitiveLearningDescription',
		icon: 'extension',
		preset: { reading_line: 1, highlight_links: 1, pause_animation: 1 },
	},
	{
		key: 'seizure_epileptic',
		labelKey: 'SeizureEpileptic',
		descriptionKey: 'SeizureEpilepticDescription',
		icon: 'neurology',
		preset: { pause_animation: 1, saturation: 1 },
	},
	{
		key: 'adhd',
		labelKey: 'ADHDFriendly',
		descriptionKey: 'ADHDFriendlyDescription',
		icon: 'adjust',
		preset: { reading_mask: 1, pause_animation: 1, mute_sounds: 1 },
	},
];

export const PROFILE_MAP: Partial<Record<ProfileKey, ProfileMeta>> = {};
PROFILES.forEach( ( p ) => {
	PROFILE_MAP[ p.key ] = p;
} );

/**
 * Merge the presets of the given profiles into one feature map.
 *
 * Highest step wins when two profiles touch the same feature. Features the
 * site admin (or the free license) has disabled are skipped, and steps are
 * clamped to the feature's own range.
 */
export function mergeProfilePresets(
	profiles: ProfileKey[],
	enabledFeatures: FeatureKey[],
): ActiveFeatureMap {
	const merged: ActiveFeatureMap = {};

	profiles.forEach( ( profileKey ) => {
		const meta = PROFILE_MAP[ profileKey ];
		if ( ! meta ) {
			return;
		}

		( Object.keys( meta.preset ) as FeatureKey[] ).forEach( ( feature ) => {
			if ( ! enabledFeatures.includes( feature ) ) {
				return;
			}

			const step = Math.min(
				meta.preset[ feature ] || 0,
				STEP_COUNTS[ feature ] || 1,
			);

			if ( step > ( merged[ feature ] || 0 ) ) {
				merged[ feature ] = step;
			}
		} );
	} );

	return merged;
}
