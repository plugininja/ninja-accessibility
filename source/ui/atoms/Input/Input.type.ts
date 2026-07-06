import {
    BorderRadius,
    BorderStyle,
    FontSize,
    FontWeight,
    Size,
    TextColor,
} from "~/kernel/types/styles";

export interface InputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        | "size"
        | "type"
        | "prefix"
        | "suffix"
        | "value"
        | "onBlur"
        | "onChange"
        | "onKeyDown"
    > {
    id?: string;
    name?: string;
    background?: TextColor;
    style?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    className?: string;
    gap?: number | string;
    inputClassName?: string;
    type?: "text" | "email" | "tel" | "url" | "number" | "search" | "password";
    title?: string;
    placeholder?: string;
    value: string | number;
    visible?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    spellCheck?: boolean;
    color?: TextColor;
    inputTextColor?: TextColor;
    size?: Size;
    borderStyle?: BorderStyle;
    rounded?: BorderRadius;
    fullWidth?: boolean;
    customWidth?: React.CSSProperties["width"];
    label?: string;
    labelColor?: TextColor;
    labelFontSize?: FontSize;
    labelFontWeight?: FontWeight;
    helperText?: string;
    error?: boolean;
    errorText?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    searchIcon?: boolean;
    ariaLabel?: string;
    tabIndex?: number;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onChange?: (value: string | number) => void;
    onBlur?: (value: string | number) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
