import { useEffect, useRef, useState } from "@wordpress/element";
import { SettingsFieldProps } from "./SettingsField.type";
import { toBoolean } from "~/kernel/utils/functions";
import { SettingsSubField } from "./SettingsField";
import { InlineStack } from "~/ui/molecules";
import { Description } from "~/ui/molecules";
import { IconButton } from "~/ui/molecules";
import { BlockStack } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { __ } from "@wordpress/i18n";
import { Button } from "~/ui/atoms";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import clsx from "clsx";

const CollapsibleField: SettingsFieldProps = ({
    id,
    style,
    className,
    title,
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
    isPro = false,
    statusProps,
    collapsible = false,
    open = false,
}) => {
    const hasCollapse = collapsible && !!children && !isIgnoreChildren;
    const contentRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(open ?? false);
    const [height, setHeight] = useState<string>(
        open ?? false ? "none" : "0px",
    );
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            setIsOpen(open ?? false);
            setHeight(open ?? false ? "none" : "0px");
            return;
        }

        animate(open ?? false);
        setIsOpen(open ?? false);
    }, [open]);

    const animate = (nextOpen: boolean) => {
        if (!contentRef.current) {return;}

        if (nextOpen) {
            setHeight(`${contentRef.current.scrollHeight}px`);
        } else {
            setHeight(`${contentRef.current.scrollHeight}px`);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setHeight("0px");
                });
            });
        }
    };

    const handleToggle = () => {
        if (isPro && !toBoolean(pnpna?.is_pro)) {return;}

        const next = !isOpen;
        animate(next);
        setIsOpen(next);
    };

    const handleTransitionEnd = () => {
        if (isOpen) {setHeight("none");}
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
            className={clsx(className, "pn-settings-field")}
        >
            <InlineStack align="between" gap={10}>
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

                {hasCollapse && (
                    <IconButton
                        variant="outlined"
                        rounded="md"
                        className={clsx(
                            "pn-settings-field__collapse-button",
                            isOpen &&
                                "pn-settings-field__collapse-button--open",
                        )}
                        aria-expanded={isOpen}
                        onClick={handleToggle}
                    >
                        <Icon name="keyboard_arrow_down" fontSize="2xl" />
                    </IconButton>
                )}
            </InlineStack>

            <div
                ref={contentRef}
                style={{
                    maxHeight: height,
                    overflow: height === "none" ? "visible" : "hidden",
                }}
                className="pn-settings-field__body"
                onTransitionEnd={handleTransitionEnd}
            >
                {isPro ? (
                    toBoolean(pnpna?.is_pro) ? (
                        <BlockStack gap={gap}>{children}</BlockStack>
                    ) : null
                ) : (
                    <BlockStack gap={gap}>{children}</BlockStack>
                )}
            </div>
        </Card>
    );
};

CollapsibleField.SubField = SettingsSubField;

export default CollapsibleField;
