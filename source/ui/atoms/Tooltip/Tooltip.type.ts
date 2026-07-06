import { BackgroundColor, BorderColor, TextColor } from "~/kernel/types/styles";

export interface TooltipProps {
    title?: string;
    component?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    placement?: "top" | "bottom" | "left" | "right" | "auto";
    arrow?: boolean;
    arrowSize?: number;
    openStyle?: "fade" | "zoom" | "slide-down";
    trigger?: "hover" | "click";
    width?: string;
    maxWidth?: string;
    wrap?: "wrap" | "no-wrap" | "max-width-wrap";
    color?: TextColor;
    background?: BackgroundColor;
    border?: BorderColor;
    shadow?: boolean;
    visible?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}
