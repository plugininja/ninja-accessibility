/**
 * Frontend accessibility panel — "Accessibility Adjustments" dialog with a
 * header action bar (Reset / Statement / Hide Interface + language picker),
 * stepper cards for multi-step adjustments, toggle cards for on/off features,
 * and a branding footer. Visitor-selectable language via bundled translations.
 */

import { useEffect, useRef, useState } from "@wordpress/element";
import { useWidgetNotifications } from "~/features/widget/hooks";
import useTranslation, {
    Translator,
} from "~/features/widget/i18n/useTranslation";
import {
    resetAllFeatures,
    selectActiveFeatures,
    selectEnabledFeatures,
    selectIsOpen,
    setFeatureStep,
} from "~/features/widget/state/widgetSlice";
import { STEP_COUNTS } from "~/features/widget/utils/accessibility";
import { useWidgetDispatch, useWidgetSelector } from "~/kernel/store/hooks";
import type { FeatureKey } from "~/kernel/types/widget";

// ─── Feature metadata (labels are translation keys) ──────────────────────────

interface StepperMeta {
    key: FeatureKey;
    labelKey: string;
    icon: string;
    /** Display value per step; index 0 is the "off" label. */
    values: string[];
}

interface ToggleMeta {
    key: FeatureKey;
    labelKey: string;
    icon: string;
    /** For text-align style groups: the fixed step this card sets. */
    fixedStep?: number;
}

// ─── Vision tab ──────────────────────────────────────────────────────────────────

const VISION_STEPPERS: StepperMeta[] = [
    {
        key: "content_scaling",
        labelKey: "ContentScaling",
        icon: "open_in_full",
        values: ["Default", "110%", "120%", "130%", "140%"],
    },
    {
        key: "bigger_text",
        labelKey: "AdjustFontSizing",
        icon: "format_size",
        values: ["Default", "110%", "120%", "130%", "140%"],
    },
    {
        key: "bigger_line_height",
        labelKey: "AdjustLineHeight",
        icon: "format_line_spacing",
        values: ["Default", "1.5", "1.8", "2.1", "2.4"],
    },
    {
        key: "letter_spacing",
        labelKey: "AdjustLetterSpacing",
        icon: "format_letter_spacing",
        values: ["Default", "1px", "2px", "3px", "4px"],
    },
];

const VISION_TOGGLES: ToggleMeta[] = [
    { key: "readable_font", labelKey: "ReadableFont", icon: "font_download" },
    { key: "contrast", labelKey: "Contrast", icon: "contrast" },
    { key: "brightness", labelKey: "Brightness", icon: "brightness_high" },
    { key: "saturation", labelKey: "Saturation", icon: "water_drop" },
    { key: "grey_scale", labelKey: "GreyScale", icon: "invert_colors_off" },
    { key: "invert_color", labelKey: "InvertColor", icon: "invert_colors" },
    { key: "hide_images", labelKey: "HideImages", icon: "image_not_supported" },
];

// ─── Cognitive tab ──────────────────────────────────────────────────────────────

const COGNITIVE_TOGGLES: ToggleMeta[] = [
    {
        key: "text_align",
        labelKey: "AlignCenter",
        icon: "format_align_center",
        fixedStep: 1,
    },
    {
        key: "text_align",
        labelKey: "AlignLeft",
        icon: "format_align_left",
        fixedStep: 2,
    },
    {
        key: "text_align",
        labelKey: "AlignRight",
        icon: "format_align_right",
        fixedStep: 3,
    },
    { key: "highlight_links", labelKey: "HighlightLinks", icon: "link" },
    { key: "text_magnifier", labelKey: "TextMagnifier", icon: "zoom_in" },
    { key: "reading_line", labelKey: "ReadingLine", icon: "horizontal_rule" },
    { key: "reading_mask", labelKey: "ReadingMask", icon: "view_agenda" },
    { key: "page_structure", labelKey: "PageStructure", icon: "account_tree" },
    { key: "sitemap", labelKey: "Sitemap", icon: "map" },
];

// ─── Motor tab ──────────────────────────────────────────────────────────────────

const MOTOR_TOGGLES: ToggleMeta[] = [
    { key: "cursor", labelKey: "CustomCursor", icon: "mouse" },
    {
        key: "screen_reader",
        labelKey: "ScreenReader",
        icon: "record_voice_over",
    },
    {
        key: "pause_animation",
        labelKey: "PauseAnimation",
        icon: "motion_photos_paused",
    },
    { key: "mute_sounds", labelKey: "MuteSounds", icon: "volume_off" },
];

type TabKey = "vision" | "cognitive" | "motor";

// ─── Cards ────────────────────────────────────────────────────────────────────

function StepperCard({
    meta,
    step,
    t,
    onStep,
}: {
    meta: StepperMeta;
    step: number;
    t: Translator;
    onStep: (key: FeatureKey, step: number) => void;
}) {
    const max = STEP_COUNTS[meta.key];
    const value =
        0 === step ? t("Default") : meta.values[step] || meta.values[0];

    return (
        <div
            className={
                "pnpna-stepper" + (step > 0 ? " pnpna-stepper--active" : "")
            }
        >
            <div className="pnpna-stepper__title">
                <span className="material-symbols-outlined" aria-hidden="true">
                    {meta.icon}
                </span>
                <span>{t(meta.labelKey)}</span>
            </div>
            <div className="pnpna-stepper__controls">
                <button
                    type="button"
                    className="pnpna-stepper__btn"
                    disabled={0 === step}
                    aria-label={`${t(meta.labelKey)} −`}
                    onClick={() => onStep(meta.key, Math.max(0, step - 1))}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        keyboard_arrow_down
                    </span>
                </button>
                <span className="pnpna-stepper__value" aria-live="polite">
                    {value}
                </span>
                <button
                    type="button"
                    className="pnpna-stepper__btn"
                    disabled={step >= max}
                    aria-label={`${t(meta.labelKey)} +`}
                    onClick={() => onStep(meta.key, Math.min(max, step + 1))}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        keyboard_arrow_up
                    </span>
                </button>
            </div>
        </div>
    );
}

function ToggleCard({
    meta,
    step,
    t,
    onStep,
}: {
    meta: ToggleMeta;
    step: number;
    t: Translator;
    onStep: (key: FeatureKey, step: number) => void;
}) {
    const max = STEP_COUNTS[meta.key];
    const isFixed = "number" === typeof meta.fixedStep;
    const active = isFixed ? step === meta.fixedStep : step > 0;

    const handleClick = () => {
        if (isFixed) {
            // Alignment-style card: set the fixed step, or clear when re-clicked.
            onStep(meta.key, active ? 0 : (meta.fixedStep as number));
        } else {
            // Cycle: off → 1 → … → max → off.
            onStep(meta.key, (step + 1) % (max + 1));
        }
    };

    return (
        <button
            type="button"
            className={"pnpna-tile" + (active ? " pnpna-tile--active" : "")}
            onClick={handleClick}
            aria-pressed={active}
        >
            <span
                className="pnpna-tile__icon material-symbols-outlined"
                aria-hidden="true"
            >
                {meta.icon}
            </span>
            <span className="pnpna-tile__label">{t(meta.labelKey)}</span>
            {!isFixed && max > 1 && (
                <span className="pnpna-tile__dots" aria-hidden="true">
                    {Array.from({ length: max }, (_, i) => (
                        <span
                            key={i}
                            className={
                                "pnpna-tile__dot" +
                                (step > i ? " pnpna-tile__dot--on" : "")
                            }
                        />
                    ))}
                </span>
            )}
        </button>
    );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface Props {
    panelLeft: boolean;
    panelTop: boolean;
    onClose: () => void;
    onFeatureStep: (key: FeatureKey, step: number) => void;
    onResetAll: () => void;
    onHideInterface: () => void;
    onSkipToContent?: () => void;
}

export default function Panel({
    panelLeft,
    panelTop,
    onClose,
    onFeatureStep,
    onResetAll,
    onHideInterface,
    onSkipToContent,
}: Props) {
    const dispatch = useWidgetDispatch();
    const open = useWidgetSelector(selectIsOpen);
    const activeFeatures = useWidgetSelector(selectActiveFeatures);
    const enabledFeatures = useWidgetSelector(selectEnabledFeatures);
    const panelRef = useRef<HTMLDivElement>(null);
    const [confirmHide, setConfirmHide] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("vision");
    const t = useTranslation();
    const {
        notifyFeatureEnabled,
        notifyFeatureDisabled,
        notifyResetComplete,
        notifyHideInterface,
    } = useWidgetNotifications();

    // Escape closes; Tab is trapped inside the dialog while open.
    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }

            if (e.key !== "Tab" || !panelRef.current) {
                return;
            }

            const focusable = panelRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], select, input, [tabindex]:not([tabindex="-1"])',
            );

            if (!focusable.length) {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            const activeEl = panelRef.current.ownerDocument.activeElement;

            if (e.shiftKey && activeEl === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && activeEl === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const stepOf = (key: FeatureKey) => activeFeatures[key] || 0;

    const handleStep = (key: FeatureKey, step: number) => {
        dispatch(setFeatureStep({ key, step }));
        onFeatureStep(key, step);

        // Show notification for feature change
        if (step > 0) {
            notifyFeatureEnabled(key);
        } else {
            notifyFeatureDisabled(key);
        }
    };

    const handleResetAll = () => {
        dispatch(resetAllFeatures());
        onResetAll();
        notifyResetComplete();
    };

    const handleHideInterfaceConfirm = () => {
        onHideInterface();
        notifyHideInterface();
    };

    const isEnabled = (key: FeatureKey) => enabledFeatures.includes(key);

    // Vision tab
    const visionSteppers = VISION_STEPPERS.filter((m) => isEnabled(m.key));
    const visionToggles = VISION_TOGGLES.filter((m) => isEnabled(m.key));
    // Cognitive tab
    const cognitiveToggles = COGNITIVE_TOGGLES.filter((m) => isEnabled(m.key));
    // Motor tab
    const motorToggles = MOTOR_TOGGLES.filter((m) => isEnabled(m.key));

    let panelClass = "pnpna-panel";
    if (open) {
        panelClass += " pnpna-panel--open";
    }
    if (panelLeft) {
        panelClass += " pnpna-panel--left";
    }
    if (panelTop) {
        panelClass += " pnpna-panel--top";
    }

    return (
        <div
            ref={panelRef}
            className={panelClass}
            role="dialog"
            aria-modal="false"
            aria-label={t("AccessibilityAdjustments")}
            hidden={!open}
        >
            {/* Top bar */}
            <div className="pnpna-panel__topbar">
                <span className="pnpna-panel__topbar-logo">
                    {t("PlugininjaAccessibility")}
                </span>
                <button
                    type="button"
                    className="pnpna-panel__topbar-skip"
                    onClick={() => {
                        onSkipToContent?.();
                        onClose();
                    }}
                >
                    {t("SkipToContent")}
                </button>
            </div>

            {/* Tab navigation */}
            <div className="pnpna-panel__tabs" role="tablist">
                {(
                    [
                        { key: "vision", label: t("Vision") },
                        { key: "cognitive", label: t("Cognitive") },
                        { key: "motor", label: t("Motor") },
                    ] as { key: TabKey; label: string }[]
                ).map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        className={
                            "pnpna-panel__tab" +
                            (activeTab === tab.key
                                ? " pnpna-panel__tab--active"
                                : "")
                        }
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Scrollable body */}
            <div
                className={`pnpna-panel__body pnpna-panel__body--${activeTab}`}
                role="tabpanel"
            >
                {activeTab === "vision" && (
                    <>
                        {visionSteppers.length > 0 && (
                            <div className="pnpna-panel__steppers">
                                {visionSteppers.map((m) => (
                                    <StepperCard
                                        key={m.key}
                                        meta={m}
                                        step={stepOf(m.key)}
                                        t={t}
                                        onStep={handleStep}
                                    />
                                ))}
                            </div>
                        )}
                        {visionToggles.length > 0 && (
                            <div className="pnpna-panel__tile-grid">
                                {visionToggles.map((m) => (
                                    <ToggleCard
                                        key={m.key}
                                        meta={m}
                                        step={stepOf(m.key)}
                                        t={t}
                                        onStep={handleStep}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "cognitive" && cognitiveToggles.length > 0 && (
                    <div className="pnpna-panel__tile-grid">
                        {cognitiveToggles.map((m) => (
                            <ToggleCard
                                key={`${m.key}-${m.fixedStep ?? 0}`}
                                meta={m}
                                step={stepOf(m.key)}
                                t={t}
                                onStep={handleStep}
                            />
                        ))}
                    </div>
                )}

                {activeTab === "motor" && motorToggles.length > 0 && (
                    <div className="pnpna-panel__tile-grid">
                        {motorToggles.map((m) => (
                            <ToggleCard
                                key={m.key}
                                meta={m}
                                step={stepOf(m.key)}
                                t={t}
                                onStep={handleStep}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom bar */}
            <div className="pnpna-panel__bottombar">
                <button
                    type="button"
                    className="pnpna-panel__bottombar-btn"
                    onClick={() => setConfirmHide(true)}
                    aria-label={t("HideInterface")}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        visibility_off
                    </span>
                </button>
                <span className="pnpna-panel__bottombar-title">
                    {t("AccessibilityControls")}
                </span>
                <button
                    type="button"
                    className="pnpna-panel__bottombar-btn"
                    onClick={handleResetAll}
                    aria-label={t("ResetSettings")}
                >
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        restart_alt
                    </span>
                </button>
            </div>

            {confirmHide && (
                <div
                    className="pnpna-hide-prompt"
                    role="alertdialog"
                    aria-label={t("HidePromptTitle")}
                >
                    <div className="pnpna-hide-prompt__box">
                        <p className="pnpna-hide-prompt__title">
                            {t("HidePromptTitle")}
                        </p>
                        <p className="pnpna-hide-prompt__body">
                            {t("HidePromptBody")}
                        </p>
                        <div className="pnpna-hide-prompt__actions">
                            <button
                                type="button"
                                className="pnpna-pill pnpna-pill--ghost"
                                onClick={() => setConfirmHide(false)}
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                type="button"
                                className="pnpna-pill pnpna-pill--danger"
                                onClick={handleHideInterfaceConfirm}
                            >
                                {t("Hide")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
