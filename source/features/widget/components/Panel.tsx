/**
 * Frontend accessibility panel — accessiy design:
 * teal header (title, language picker, reset / hide / close actions),
 * CONTENT and COLOR section pills, a flat 3-column tile grid where
 * multi-step features cycle and show their current value, and a teal
 * footer with the accessibility-statement link and (opt-in) attribution.
 */

import { useEffect, useRef, useState } from "@wordpress/element";
import useTranslation, {
    Translator,
} from "~/features/widget/i18n/useTranslation";
import LanguageSelector from "~/features/widget/components/LanguageSelector";
import {
    resetAllFeatures,
    selectActiveFeatures,
    selectEnabledFeatures,
    selectIsOpen,
    selectLanguage,
    setFeatureStep,
    setLanguage,
} from "~/features/widget/state/widgetSlice";
import { setStoredLanguage } from "~/features/widget/utils/storage";
import { STEP_COUNTS } from "~/features/widget/utils/accessibility";
import { useWidgetDispatch, useWidgetSelector } from "~/kernel/store/hooks";
import type { LanguageKey } from "~/features/widget/i18n/languages";
import type { FeatureKey } from "~/kernel/types/widget";

// ─── Tile metadata (labels/values are translation keys where possible) ───────

interface TileMeta {
    key: FeatureKey;
    labelKey: string;
    icon: string;
    /** Display value per step for multi-step features; index 0 is "off". */
    values?: string[];
}

// Order follows the accessiy Figma panel.
const CONTENT_TILES: TileMeta[] = [
    {
        key: "content_scaling",
        labelKey: "ContentScaling",
        icon: "open_in_full",
        values: ["Default", "110%", "120%", "130%", "140%"],
    },
    {
        key: "bigger_text",
        labelKey: "TextSize",
        icon: "format_size",
        values: ["Default", "1.1x", "1.2x", "1.3x", "1.4x"],
    },
    {
        key: "bigger_line_height",
        labelKey: "AdjustLineHeight",
        icon: "format_line_spacing",
        values: ["Default", "1.5x", "1.8x", "2.1x", "2.4x"],
    },
    {
        key: "letter_spacing",
        labelKey: "LetterSpacing",
        icon: "format_letter_spacing",
        values: ["Default", "1px", "2px", "3px", "4px"],
    },
    {
        key: "text_align",
        labelKey: "TextAlign",
        icon: "format_align_left",
        values: ["Default", "Center", "Left", "Right"],
    },
    { key: "readable_font", labelKey: "ReadableFont", icon: "font_download" },
    { key: "text_magnifier", labelKey: "TextMagnifier", icon: "zoom_in" },
    { key: "highlight_links", labelKey: "HighlightLinks", icon: "link" },
    {
        key: "cursor",
        labelKey: "CustomCursor",
        icon: "mouse",
        values: ["Default", "1x", "2x", "3x", "4x"],
    },
    { key: "page_structure", labelKey: "PageStructure", icon: "account_tree" },
    {
        key: "screen_reader",
        labelKey: "ScreenReader",
        icon: "record_voice_over",
    },
    { key: "reading_mask", labelKey: "ReadingMask", icon: "view_agenda" },
    { key: "sitemap", labelKey: "Sitemap", icon: "map" },
    { key: "hide_images", labelKey: "HideImages", icon: "image_not_supported" },
    {
        key: "pause_animation",
        labelKey: "PauseAnimation",
        icon: "motion_photos_paused",
    },
    { key: "mute_sounds", labelKey: "MuteSounds", icon: "volume_off" },
    { key: "reading_line", labelKey: "ReadingLine", icon: "horizontal_rule" },
    {
        key: "outline_focus",
        labelKey: "OutlineFocus",
        icon: "center_focus_strong",
    },
];

const COLOR_TILES: TileMeta[] = [
    { key: "grey_scale", labelKey: "GreyScale", icon: "invert_colors_off" },
    { key: "contrast", labelKey: "Contrast", icon: "contrast" },
    { key: "invert_color", labelKey: "InvertColor", icon: "invert_colors" },
    {
        key: "brightness",
        labelKey: "Brightness",
        icon: "brightness_high",
        values: ["Default", "Low", "Bright", "Dark"],
    },
    {
        key: "saturation",
        labelKey: "Saturation",
        icon: "water_drop",
        values: ["Default", "Low", "High", "Off"],
    },
];

// ─── Tile ─────────────────────────────────────────────────────────────────────

function Tile({
    meta,
    step,
    t,
    onStep,
}: {
    meta: TileMeta;
    step: number;
    t: Translator;
    onStep: (key: FeatureKey, step: number) => void;
}) {
    const max = STEP_COUNTS[meta.key];
    const active = step > 0;
    const value =
        meta.values && active ? t(meta.values[step] || meta.values[0]) : "";

    return (
        <button
            type="button"
            className={"pnpna-tile" + (active ? " pnpna-tile--active" : "")}
            onClick={() => onStep(meta.key, (step + 1) % (max + 1))}
            aria-pressed={active}
        >
            <span
                className="pnpna-tile__icon material-symbols-outlined"
                aria-hidden="true"
            >
                {meta.icon}
            </span>
            <span className="pnpna-tile__label">
                {t(meta.labelKey)}
                {value && (
                    <span className="pnpna-tile__value" aria-live="polite">
                        {" "}
                        {value}
                    </span>
                )}
            </span>
            {max > 1 && (
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
}

export default function Panel({
    panelLeft,
    panelTop,
    onClose,
    onFeatureStep,
    onResetAll,
    onHideInterface,
}: Props) {
    const dispatch = useWidgetDispatch();
    const open = useWidgetSelector(selectIsOpen);
    const activeFeatures = useWidgetSelector(selectActiveFeatures);
    const enabledFeatures = useWidgetSelector(selectEnabledFeatures);
    const language = useWidgetSelector(selectLanguage);
    const panelRef = useRef<HTMLDivElement>(null);
    const [confirmHide, setConfirmHide] = useState(false);
    const t = useTranslation();

    const statementUrl = window.pnpna?.statementUrl || "";
    const showBranding = window.pnpna?.showBranding === true;

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
    };

    const handleResetAll = () => {
        dispatch(resetAllFeatures());
        onResetAll();
    };

    const handleLanguage = (lang: LanguageKey) => {
        dispatch(setLanguage(lang));
        setStoredLanguage(lang);
    };

    const isEnabled = (key: FeatureKey) => enabledFeatures.includes(key);

    const contentTiles = CONTENT_TILES.filter((m) => isEnabled(m.key));
    const colorTiles = COLOR_TILES.filter((m) => isEnabled(m.key));

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
            {/* Header (teal) */}
            <div className="pnpna-panel__topbar">
                <span className="pnpna-panel__topbar-title">
                    {t("Accessibility")}
                </span>
                <div className="pnpna-panel__topbar-actions">
                    <LanguageSelector
                        selected={language}
                        onChange={handleLanguage}
                    />
                    <button
                        type="button"
                        className="pnpna-panel__topbar-btn"
                        onClick={handleResetAll}
                        aria-label={t("ResetSettings")}
                        title={t("ResetSettings")}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            restart_alt
                        </span>
                    </button>
                    <button
                        type="button"
                        className="pnpna-panel__topbar-btn"
                        onClick={() => setConfirmHide(true)}
                        aria-label={t("HideInterface")}
                        title={t("HideInterface")}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            visibility_off
                        </span>
                    </button>
                    <button
                        type="button"
                        className="pnpna-panel__topbar-btn"
                        onClick={onClose}
                        aria-label={t("Close")}
                        title={t("Close")}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            close
                        </span>
                    </button>
                </div>
            </div>

            {/* Scrollable body */}
            <div className="pnpna-panel__body">
                {contentTiles.length > 0 && (
                    <>
                        <div className="pnpna-panel__section-pill">
                            {t("ContentAdjustments")}
                        </div>
                        <div className="pnpna-panel__tile-grid">
                            {contentTiles.map((m) => (
                                <Tile
                                    key={m.key}
                                    meta={m}
                                    step={stepOf(m.key)}
                                    t={t}
                                    onStep={handleStep}
                                />
                            ))}
                        </div>
                    </>
                )}

                {colorTiles.length > 0 && (
                    <>
                        <div className="pnpna-panel__section-pill">
                            {t("ColorAdjustments")}
                        </div>
                        <div className="pnpna-panel__tile-grid">
                            {colorTiles.map((m) => (
                                <Tile
                                    key={m.key}
                                    meta={m}
                                    step={stepOf(m.key)}
                                    t={t}
                                    onStep={handleStep}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Footer (teal) — statement link and opt-in attribution only.
                The attribution renders ONLY when the site admin has enabled
                it (off by default; WP.org Guideline 10). */}
            {(statementUrl || showBranding) && (
                <div className="pnpna-panel__footer">
                    {statementUrl ? (
                        <a
                            className="pnpna-panel__footer-statement"
                            href={statementUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t("AccessibilityStatement")}
                            <span
                                className="material-symbols-outlined"
                                aria-hidden="true"
                            >
                                open_in_new
                            </span>
                        </a>
                    ) : (
                        <span />
                    )}
                    {showBranding && (
                        <a
                            className="pnpna-panel__footer-branding"
                            href="https://plugininja.com/ninja-accessibility/"
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                        >
                            {t("PoweredBy")} <strong>Ninja Accessibility</strong>
                        </a>
                    )}
                </div>
            )}

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
                                className="pnpna-pill pnpna-pill--primary"
                                onClick={onHideInterface}
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
