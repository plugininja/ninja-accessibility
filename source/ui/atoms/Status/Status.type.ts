import { Size, TextColor } from "~/kernel/types/styles";

export interface StatusProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    isPro?: boolean;
    isComingSoon?: boolean;
    isHot?: boolean;
    isNew?: boolean;
    isBeta?: boolean;
    placement?:
        | "center"
        | "right-center"
        | "left-center"
        | "top-center"
        | "bottom-center"
        | "default";
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    tooltipPlacement?: "top" | "bottom" | "left" | "right" | "auto";
    size?: Size;
    widthFull?: boolean;
    ignore?: boolean;
    overlay?: boolean;
    children?: React.ReactNode;
}

export type StatusConfig = {
    key: "badge-pro" | "comingsoon" | "hot" | "badge-new" | "beta";
    variant: "badge-pro" | "warning" | "error" | "badge-new" | "secondary";
    title: string;
    icon: string;
    iconColor: TextColor;
    condition: boolean;
};
