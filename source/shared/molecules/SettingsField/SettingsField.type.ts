import { StatusProps } from "~/ui/atoms/Status/Status.type";
import {
    BackgroundColor,
    BorderColor,
    BorderRadius,
    BorderStyle,
    FontSize,
} from "~/kernel/types/styles";

interface SettingsField {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    title?: React.ReactNode;
    titleSize?: FontSize;
    description?: string;
    docLink?: string;
    background?: BackgroundColor;
    border?: BorderColor;
    borderStyle?: BorderStyle;
    rounded?: BorderRadius;
    gap?: string | number;
    children?: React.ReactNode;
    compact?: boolean;
    isIgnoreChildren?: boolean;
    action?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    isPro?: boolean;
    statusProps?: StatusProps;
    collapsible?: boolean;
    open?: boolean;
    onClick?: () => void;
}

export interface SettingsFieldProps extends React.FC<SettingsField> {
    SubField: React.FC<SettingsSubFieldProps>;
}

export interface SettingsSubFieldProps extends SettingsField {
    depend?: boolean;
    dependOn?: string;
}
