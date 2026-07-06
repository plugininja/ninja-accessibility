import { cloneElement, isValidElement } from "@wordpress/element";
import type { TopbarProps } from "./Topbar.type";
import { isValidArray } from "~/kernel/utils/helpers";
import clsx from "clsx";
import { InlineStack } from "../InlineStack";

const Topbar = ({
    id,
    style,
    top,
    zIndex = 9999,
    className = "",
    border = true,
    wrap = true,
    padding = 20,
    leftContents = [],
    rightContents = [],
    children,
    leftContentsClassName = "flex-1",
}: TopbarProps) => {
    const renderContent = (item: React.ReactNode, index: number) => {
        if (!isValidElement(item)) {return null;}

        return cloneElement(item, {
            key: item.key ?? index,
        });
    };

    return (
        <InlineStack
            id={id}
            gap={10}
            align="between"
            wrap={wrap}
            style={{
                ...style,
                padding,
                top,
                zIndex,
            }}
            className={clsx(
                "pn-topbar",
                border && "pn-topbar--border",
                className,
            )}
        >
            {isValidArray(leftContents) && (
                <InlineStack gap={10} className={leftContentsClassName}>
                    {leftContents.map(renderContent)}
                </InlineStack>
            )}

            {children}

            {isValidArray(rightContents) && (
                <InlineStack gap={10}>
                    {rightContents.map(renderContent)}
                </InlineStack>
            )}
        </InlineStack>
    );
};

export default Topbar;
