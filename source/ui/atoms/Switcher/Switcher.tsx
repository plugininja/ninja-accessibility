import { InlineStack } from "~/ui/molecules";
import { Status, Text } from "~/ui/atoms";
import type { SwitcherProps } from "./Switcher.type";
import clsx from "clsx";

const Switcher: React.FC<SwitcherProps> = ({
    id = "",
    style,
    className = "",
    checked,
    title,
    titleSize = "md",
    tabIndex,
    ariaLabel,
    loading = false,
    disabled,
    isPro = false,
    onChange,
}) => {
    const handleChange = () => {
        if (disabled || loading) {return;}

        if (onChange) {onChange(!checked);}
    };

    return (
        <div
            id={id}
            style={{
                ...style,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                userSelect: "none",
            }}
            tabIndex={tabIndex}
            aria-label={ariaLabel}
            className={clsx(
                "pn-switcher",
                disabled && "pn-switcher--disabled",
                className,
            )}
        >
            <div
                className={clsx(
                    "pn-switcher__toggle",
                    checked && "pn-switcher__toggle--active",
                    loading && "pn-switcher__toggle--loading",
                )}
                onClick={handleChange}
            >
                <div className="pn-switcher__toggle-thumb" />
            </div>

            {title &&
                (isPro ? (
                    <InlineStack gap={10} wrap={false}>
                        <Text
                            color="gray-700"
                            size={titleSize}
                            weight="medium"
                            className="cursor-pointer"
                            onClick={handleChange}
                        >
                            {title}
                        </Text>

                        <Status.Pro />
                    </InlineStack>
                ) : (
                    <Text
                        color="gray-700"
                        size={titleSize}
                        weight="medium"
                        className="cursor-pointer"
                        onClick={handleChange}
                    >
                        {title}
                    </Text>
                ))}
        </div>
    );
};

export default Switcher;
