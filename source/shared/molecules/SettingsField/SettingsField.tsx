import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import clsx from "clsx";
import {
    SettingsFieldProps,
    SettingsSubFieldProps,
} from "./SettingsField.type";

const SettingsField: SettingsFieldProps = ({
    id,
    style,
    className,
    title,
    titleSize = "md",
    description,
    docLink,
    background = "white",
    border = "gray-200",
    borderStyle = "solid",
    rounded,
    gap = 20,
    children,
    compact = false,
    isIgnoreChildren = false,
    action,
    secondaryAction,
    statusProps,
    onClick,
}) => {
    return (
        <Card
            id={id}
            style={{ ...style, maxWidth: compact ? 1024 : "100%" }}
            background={background}
            border={border}
            borderStyle={borderStyle}
            rounded={rounded}
            statusProps={statusProps}
            className={clsx(className, "pn-settings-field")}
            onClick={onClick}
        >
            <InlineStack
                align="between"
                gap={10}
                style={{
                    marginBottom:
                        children &&
                        !isIgnoreChildren &&
                        (title || description || action || secondaryAction)
                            ? 16
                            : 0,
                }}
            >
                <BlockStack gap={10}>
                    <InlineStack gap={15}>
                        {action && action}

                        {title && (
                            <Text
                                as="h4"
                                color="gray-700"
                                size={titleSize}
                                weight="medium"
                            >
                                {title}
                            </Text>
                        )}

                        {secondaryAction && secondaryAction}
                    </InlineStack>

                    {description && <Description text={description} />}
                </BlockStack>

                {docLink && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon="info"
                        href={docLink}
                        target="_blank"
                    >
                        {__("Documentation", "ninja-accessibility")}
                    </Button>
                )}
            </InlineStack>

            <BlockStack gap={gap}>{children}</BlockStack>
        </Card>
    );
};

const SettingsSubField: React.FC<SettingsSubFieldProps> = ({
    id,
    style,
    className,
    title,
    description,
    docLink,
    background = "primary-extralight",
    border,
    borderStyle = "dashed",
    rounded = "md",
    gap = 20,
    children,
    compact = false,
    action,
    secondaryAction,
    isIgnoreChildren,
    depend,
    dependOn = "",
    statusProps,
}) => {
    const classes = clsx(className, depend && "pn-settings-field-disabled");

    const handleClick = (e: React.MouseEvent) => {
        const dependent = document.getElementById(dependOn);

        if (dependent && depend) {
            e.stopPropagation();

            const label = dependent.parentElement as HTMLElement;

            if (!label) {return;}

            label.classList.add("pn-blink");

            setTimeout(() => {
                label.classList.remove("pn-blink");
            }, 500);
        }
    };

    return (
        <Card
            id={id}
            style={{ ...style, maxWidth: compact ? 1024 : "100%" }}
            background={background}
            border={border}
            borderStyle={borderStyle}
            rounded={rounded}
            statusProps={statusProps}
            className={classes}
            onClick={handleClick}
        >
            <InlineStack
                align="between"
                gap={10}
                style={{
                    marginBottom:
                        children &&
                        !isIgnoreChildren &&
                        (title || description || action || secondaryAction)
                            ? 16
                            : 0,
                }}
            >
                <BlockStack gap={10}>
                    <InlineStack gap={15}>
                        {action && action}

                        {title && (
                            <Text as="h4" color="gray-700" weight="medium">
                                {title}
                            </Text>
                        )}

                        {secondaryAction && secondaryAction}
                    </InlineStack>

                    {description && <Description text={description} />}
                </BlockStack>

                {docLink && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon="info"
                        href={docLink}
                        target="_blank"
                    >
                        {__("Documentation", "ninja-accessibility")}
                    </Button>
                )}
            </InlineStack>

            <BlockStack gap={gap}>{children}</BlockStack>
        </Card>
    );
};

export { SettingsSubField };

SettingsField.SubField = SettingsSubField;

export default SettingsField;
