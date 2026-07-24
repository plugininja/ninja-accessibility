/**
 * Widget notification hook - wraps useCustomAlert for consistent toast notifications.
 */

import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useCustomAlert } from '~/ui/molecules/Alert';
import type { FeatureKey } from '~/kernel/types/widget';

interface UseWidgetNotifications {
    notifyFeatureEnabled: ( featureKey: FeatureKey ) => void;
    notifyFeatureDisabled: ( featureKey: FeatureKey ) => void;
    notifyResetComplete: () => void;
    notifyHideInterface: () => void;
}

/**
 * Get human-readable feature name from key.
 */
function getFeatureName( featureKey: FeatureKey ): string {
    const featureNames: Record< FeatureKey, string > = {
        content_scaling: __( 'Content Scaling', 'ninja-accessibility' ),
        bigger_text: __( 'Font Sizing', 'ninja-accessibility' ),
        bigger_line_height: __( 'Line Height', 'ninja-accessibility' ),
        letter_spacing: __( 'Letter Spacing', 'ninja-accessibility' ),
        readable_font: __( 'Readable Font', 'ninja-accessibility' ),
        contrast: __( 'Contrast', 'ninja-accessibility' ),
        brightness: __( 'Brightness', 'ninja-accessibility' ),
        saturation: __( 'Saturation', 'ninja-accessibility' ),
        grey_scale: __( 'Greyscale', 'ninja-accessibility' ),
        invert_color: __( 'Invert Colors', 'ninja-accessibility' ),
        hide_images: __( 'Hide Images', 'ninja-accessibility' ),
        text_align: __( 'Text Alignment', 'ninja-accessibility' ),
        highlight_links: __( 'Highlight Links', 'ninja-accessibility' ),
        text_magnifier: __( 'Text Magnifier', 'ninja-accessibility' ),
        reading_line: __( 'Reading Line', 'ninja-accessibility' ),
        reading_mask: __( 'Reading Mask', 'ninja-accessibility' ),
        page_structure: __( 'Page Structure', 'ninja-accessibility' ),
        sitemap: __( 'Sitemap', 'ninja-accessibility' ),
        cursor: __( 'Custom Cursor', 'ninja-accessibility' ),
        screen_reader: __( 'Screen Reader', 'ninja-accessibility' ),
        pause_animation: __( 'Pause Animations', 'ninja-accessibility' ),
        mute_sounds: __( 'Mute Sounds', 'ninja-accessibility' ),
        outline_focus: __( 'Outline Focus', 'ninja-accessibility' ),
   };

    return featureNames[ featureKey ] || featureKey;
}

/**
 * Hook for widget toast notifications.
 * Uses same pattern as ninja-drive - no position specified, relies on default.
 */
export function useWidgetNotifications(): UseWidgetNotifications {
    const { showAlert } = useCustomAlert();

    const notifyFeatureEnabled = useCallback( ( featureKey: FeatureKey ) => {
        const featureName = getFeatureName( featureKey );
        showAlert( {
            toast: true,
            type: 'success',
            title: __( 'Enabled', 'ninja-accessibility' ),
            text: featureName,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            showIcon: true,
            position: 'top-center',
        } );
    }, [ showAlert ] );

    const notifyFeatureDisabled = useCallback( ( featureKey: FeatureKey ) => {
        const featureName = getFeatureName( featureKey );
        showAlert( {
            toast: true,
            type: 'info',
            title: __( 'Reset', 'ninja-accessibility' ),
            text: featureName,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            showIcon: true,
            position: 'top-center',
        } );
    }, [ showAlert ] );

    const notifyResetComplete = useCallback( () => {
        showAlert( {
            toast: true,
            type: 'success',
            title: __( 'Settings Reset', 'ninja-accessibility' ),
            text: __( 'All accessibility settings have been reset.', 'ninja-accessibility' ),
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            showIcon: true,
            position: 'top-center',
        } );
    }, [ showAlert ] );

    const notifyHideInterface = useCallback( () => {
        showAlert( {
            toast: true,
            type: 'info',
            title: __( 'Interface Hidden', 'ninja-accessibility' ),
            text: __( 'Accessibility widget has been hidden. Clear site data to restore.', 'ninja-accessibility' ),
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false,
            showIcon: true,
            position: 'top-center',
        } );
    }, [ showAlert ] );

    return {
        notifyFeatureEnabled,
        notifyFeatureDisabled,
        notifyResetComplete,
        notifyHideInterface,
    };
}
