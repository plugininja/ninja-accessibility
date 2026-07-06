import { IconButtonProps } from "./IconButton.type";
import { TextColor } from "~/kernel/types/styles";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import { Icon } from "~/ui/atoms";

const IconButton = ({
    name,
    iconUrl,
    id,
    style,
    className = "",
    iconClassName,
    variant = "default",
    title,
    color,
    size = "medium",
    fontSize = "xl",
    fontWeight = "medium",
    rounded = "sm",
    border = true,
    borderColor = "white",
    borderStyle = "solid",
    full = false,
    visible = true,
    disabled = false,
    loading = false,
    loadingIndicator,
    ariaLabel,
    role = "button",
    tabIndex,
    href,
    target,
    rel,
    preventDefault = false,
    stopPropagation = false,
    children,
    onClick,
    onBlur,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    onDoubleClick,
}: IconButtonProps) => {
    const classes = clsx(
        "pn-icon-button",
        `pn-icon-button--${variant}`,
        `pn-icon-button--${size}`,
        `rounded-${rounded}`,
        border && `border border-${borderColor} border-${borderStyle}`,
        full && "w-full",
        disabled && "pn-icon-button--disabled",
        className,
    );

    const iconColor = color
        ? color
        : ["default", "secondary", "outlined", "link"].includes(variant)
        ? "black"
        : variant === "primary"
        ? "white"
        : variant === "warning"
        ? "warning"
        : variant === "white"
        ? "primary"
        : ("error" as TextColor);

    const content = loading
        ? loadingIndicator ?? (
              <Icon
                  name="progress_activity"
                  color={color ?? iconColor}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  className="loading"
              />
          )
        : (name && (
              <Icon
                  name={name}
                  color={color ?? iconColor}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  className={iconClassName}
              />
          )) ??
          children ??
          (iconUrl && (
              <img
                  referrerPolicy="no-referrer"
                  src={iconUrl}
                  alt={__("icon", "ninja-accessibility")}
                  style={{
                      padding: "3px",
                  }}
              />
          )) ??
          null;

    const commonProps = {
        id,
        style,
        className: classes,
        title,
        "aria-label": ariaLabel,
        role,
        tabIndex,
        onBlur,
        onFocus,
        onMouseEnter,
        onMouseLeave,
        onDoubleClick,
    };

    const handleClick = (
        e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
        if (preventDefault) {e.preventDefault();}
        if (stopPropagation) {e.stopPropagation();}
        if (onClick && !disabled && !loading) {onClick(e);}
    };

    if (!visible) {return null;}

    if (href) {
        return (
            <a
                href={href}
                target={target}
                rel={rel}
                {...commonProps}
                onClick={(e) => {
                    if (disabled || loading) {return;}
                    handleClick(e);
                }}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            {...commonProps}
            onClick={(e) => {
                if (disabled || loading) {return;}
                handleClick(e);
            }}
            disabled={disabled || loading}
        >
            {content}
        </button>
    );
};

export default IconButton;
