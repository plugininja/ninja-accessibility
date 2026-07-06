import { FontSize, FontWeight, TextColor } from "~/kernel/types/styles";
import { useCallback, useMemo } from "@wordpress/element";
import { ButtonProps } from "./Button.type";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import { Icon } from "../Icon";
import { Status } from "../Status";

const ICON_COLORS: Record<string, TextColor> = {
    default: "black",
    secondary: "black",
    outlined: "black",
    link: "black",
    primary: "white",
    warning: "warning",
    error: "error",
};

const FONT_WEIGHT = "medium" as FontWeight;

const Button = ({
    id,
    style,
    className = "",
    variant = "default",
    iconUrl,
    title,
    color,
    size = "medium",
    iconSize: _iconSize,
    rounded = "sm",
    textTransform = "capitalize",
    full = false,
    visible = true,
    disabled = false,
    loading = false,
    loadingIndicator,
    startIcon,
    startIconColor,
    startIconClassName,
    endIcon,
    endIconColor,
    endIconClassName,
    ariaLabel,
    role: roleProp,
    tabIndex,
    href,
    target,
    rel,
    preventDefault = false,
    stopPropagation = false,
    statusProps,
    children,
    onClick,
    onBlur,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    onDoubleClick,
}: ButtonProps) => {
    if (!visible) {return null;}

    const classes = clsx(
        "pn-button",
        `pn-button--${variant}`,
        `pn-button--${size}`,
        `rounded-${rounded}`,
        color && `text-${color}`,
        `text-${textTransform}`,
        full && "w-full",
        !color && "not-own-color",
        disabled && "pn-button--disabled",
        className,
    );

    const iconColor = ICON_COLORS[variant] ?? "black";

    const iconSize: FontSize = _iconSize
        ? _iconSize
        : ["large", "extralarge"].includes(size)
        ? "xl"
        : "lg";

    const getIconClassName = useCallback(
        (icon: string) =>
            icon === startIcon ? startIconClassName : endIconClassName,
        [startIcon, startIconClassName, endIconClassName],
    );

    const renderIcon = useCallback(
        (icon?: string, colorOverride?: TextColor) => {
            if (loading) {
                return (
                    loadingIndicator ?? (
                        <Icon
                            name="progress_activity"
                            className="loading"
                            color={colorOverride ?? iconColor}
                            fontSize={iconSize}
                            fontWeight={FONT_WEIGHT}
                        />
                    )
                );
            }
            if (iconUrl) {
                return (
                    <img
                        referrerPolicy="no-referrer"
                        src={iconUrl}
                        alt={__("button-icon", "ninja-accessibility")}
                    />
                );
            }
            if (!icon) {return null;}
            return (
                <Icon
                    name={icon}
                    color={colorOverride ?? iconColor}
                    fontSize={iconSize}
                    fontWeight={FONT_WEIGHT}
                    className={getIconClassName(icon)}
                />
            );
        },
        [
            loading,
            loadingIndicator,
            iconColor,
            iconSize,
            iconUrl,
            getIconClassName,
        ],
    );

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            if (disabled || loading) {return;}
            if (preventDefault) {e.preventDefault();}
            if (stopPropagation) {e.stopPropagation();}
            onClick?.(e);
        },
        [disabled, loading, preventDefault, stopPropagation, onClick],
    );

    const role = roleProp ?? (href ? "link" : "button");

    const commonProps = useMemo(
        () => ({
            id,
            style,
            className: classes,
            title,
            "aria-label": ariaLabel,
            role,
            tabIndex: disabled && !!href ? -1 : tabIndex,
            ...(href && disabled ? { "aria-disabled": true as const } : {}),
            onBlur,
            onFocus,
            onMouseEnter,
            onMouseLeave,
            onDoubleClick,
        }),
        [
            id,
            style,
            classes,
            title,
            ariaLabel,
            role,
            tabIndex,
            href,
            disabled,
            onBlur,
            onFocus,
            onMouseEnter,
            onMouseLeave,
            onDoubleClick,
        ],
    );

    const { default: showDefaultStatus, ...statusRest } = statusProps ?? {};

    const status = useMemo(
        () =>
            showDefaultStatus
                ? {
                      ...statusRest,
                      size: "extrasmall" as const,
                      placement: "right-center" as const,
                      right:
                          size === "extrasmall" ? 4 : size === "small" ? 6 : 8,
                  }
                : statusRest,
        [showDefaultStatus, statusRest, size],
    );

    const content = useMemo(() => {
        const hasIcons = startIcon || endIcon;
        const showChildren = !(loading && !startIcon && !endIcon);

        if (!hasIcons && loading) {
            return renderIcon(undefined);
        }

        return (
            <>
                {startIcon && renderIcon(startIcon, startIconColor)}
                {showChildren && children}
                {endIcon && renderIcon(endIcon, endIconColor)}
            </>
        );
    }, [
        startIcon,
        endIcon,
        loading,
        children,
        startIconColor,
        endIconColor,
        renderIcon,
    ]);

    if (href) {
        return (
            <Status {...status}>
                <a
                    href={disabled ? undefined : href}
                    target={target}
                    rel={rel}
                    {...commonProps}
                    onClick={handleClick}
                >
                    {content}
                </a>
            </Status>
        );
    }

    return (
        <Status widthFull={false} {...status}>
            <button
                type="button"
                {...commonProps}
                onClick={handleClick}
                disabled={disabled || loading}
            >
                {content}
            </button>
        </Status>
    );
};

export { Button };

export default Button;
