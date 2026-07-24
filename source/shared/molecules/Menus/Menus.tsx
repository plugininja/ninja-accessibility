import { MenuProps, MenusProps } from "./Menus.type";
import { InlineStack } from "~/ui/molecules";
import { Dropdown } from "~/ui/molecules";
import { Card } from "~/ui/molecules";
import { Text } from "~/ui/atoms";
import { Icon } from "~/ui/atoms";
import { toBoolean } from "~/kernel/utils/functions";
import {
    useRef,
    useState,
    useEffect,
    useCallback,
    forwardRef,
} from "@wordpress/element";

const Menus = ({
    id,
    style,
    className,
    menus,
    active,
    onMenuClick,
}: MenusProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
    const moreButtonRef = useRef<HTMLDivElement>(null);

    const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

    const calculate = useCallback(() => {
        const container = containerRef.current;
        if (!container || !menus?.length) {return;}

        const containerWidth = container.offsetWidth;
        const moreBtnWidth = moreButtonRef.current?.offsetWidth ?? 0;
        const keys = menus.map((m) => m.key);

        let totalWidth = keys.reduce(
            (sum, k) => sum + (itemRefs.current.get(k)?.offsetWidth ?? 0),
            0,
        );

        const newHidden = new Set<string>();

        if (totalWidth > containerWidth) {
            for (let i = keys.length - 1; i >= 0; i--) {
                const key = keys[i];

                totalWidth -= itemRefs.current.get(key)?.offsetWidth ?? 0;

                newHidden.add(key);

                if (totalWidth + moreBtnWidth <= containerWidth) {
                    break;
                }
            }
        }

        setHiddenKeys((prev) => {
            const prevStr = [...prev].sort().join(",");
            const nextStr = [...newHidden].sort().join(",");

            return prevStr === nextStr ? prev : newHidden;
        });
    }, [menus]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {return;}

        const timeout = setTimeout(calculate, 0);

        const observer = new ResizeObserver(calculate);
        observer.observe(container);

        return () => {
            clearTimeout(timeout);
            observer.disconnect();
        };
    }, [calculate]);

    const visibleMenus =
        menus?.filter((menu) => !hiddenKeys.has(menu.key)) ?? [];

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>,
        index: number,
    ) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
            return;
        }

        e.preventDefault();

        const direction = e.key === "ArrowRight" ? 1 : -1;

        const nextIndex =
            (index + direction + visibleMenus.length) % visibleMenus.length;

        const nextMenu = visibleMenus[nextIndex];

        if (!nextMenu) {return;}

        menuRefs.current[nextIndex]?.focus();

        onMenuClick?.(nextMenu.key);
    };

    const hiddenMenus = menus?.filter((m) => hiddenKeys.has(m.key)) ?? [];

    const isHiddenExist = hiddenMenus.length > 0;

    const isMoreActive = hiddenMenus.some((m) => m.key === active);

    return (
        <div
            id={id}
            ref={containerRef}
            className={className}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                minWidth: 0,
            }}
        >
            <InlineStack gap={5} align="center" wrap={false}>
                {menus?.map(({ key, title, icon, isPro }) => {
                    const isActive = key === active;
                    const isHidden = hiddenKeys.has(key);

                    const visibleIndex = visibleMenus.findIndex(
                        (menu) => menu.key === key,
                    );

                    return (
                        <div
                            key={key}
                            ref={(el) => {
                                if (el) {itemRefs.current.set(key, el);}
                                else {itemRefs.current.delete(key);}
                            }}
                            style={{
                                position: isHidden ? "absolute" : "relative",
                                visibility: isHidden ? "hidden" : "visible",
                                pointerEvents: isHidden ? "none" : "auto",
                                top: isHidden ? "-9999px" : undefined,
                                flexShrink: 0,
                            }}
                        >
                            <Menus.Menu
                                ref={(el) => {
                                    if (!isHidden && visibleIndex >= 0) {
                                        menuRefs.current[visibleIndex] = el;
                                    }
                                }}
                                menuKey={key}
                                title={title}
                                icon={icon}
                                isPro={isPro}
                                isActive={isActive}
                                tabIndex={isActive ? 0 : -1}
                                onMenuClick={onMenuClick}
                                onKeyDown={(e) =>
                                    handleKeyDown(e, visibleIndex)
                                }
                            />
                        </div>
                    );
                })}

                <div
                    ref={moreButtonRef}
                    style={{
                        flexShrink: 0,
                        position: isHiddenExist ? "relative" : "absolute",
                        opacity: isHiddenExist ? 1 : 0,
                        pointerEvents: isHiddenExist ? "auto" : "none",
                    }}
                >
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Card
                                padding={10}
                                background={isMoreActive ? "gray-100" : "white"}
                                rounded="md"
                                border={isMoreActive ? "gray-300" : "white"}
                                flex
                                align="center"
                                blockAlign="center"
                                gap={8}
                                wrap={false}
                                style={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <Text
                                    color={isMoreActive ? "black" : "gray-500"}
                                    size="sm"
                                    weight="medium"
                                >
                                    More
                                </Text>

                                <Icon
                                    name="keyboard_arrow_down"
                                    color={isMoreActive ? "black" : "gray-500"}
                                    fontSize="lg"
                                />
                            </Card>
                        </Dropdown.Trigger>

                        <Dropdown.Content
                            position={{
                                left: "auto",
                                right: 0,
                                top: "115%",
                            }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                padding: "10px",
                                borderRadius: "12px",
                            }}
                        >
                            {hiddenMenus.map(({ key, title, icon, isPro }) => {
                                const isActive = key === active;

                                return (
                                    <Menus.Menu
                                        key={key}
                                        menuKey={key}
                                        title={title}
                                        icon={icon}
                                        isPro={isPro}
                                        isActive={isActive}
                                        onMenuClick={onMenuClick}
                                    />
                                );
                            })}
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </InlineStack>
        </div>
    );
};

Menus.Menu = forwardRef<HTMLDivElement, MenuProps>(
    (
        {
            menuKey,
            title,
            icon,
            isPro,
            isActive,
            tabIndex,
            onMenuClick,
            onKeyDown,
        },
        ref,
    ) => {
        const showProBadge = isPro && !toBoolean(window.pnpna?.is_pro);

        return (
            <Card
                ref={ref}
                role="button"
                tabIndex={tabIndex}
                onKeyDown={onKeyDown}
                padding={10}
                background={isActive ? "gray-100" : "white"}
                rounded="md"
                border={isActive ? "gray-300" : "white"}
                flex
                blockAlign="center"
                gap={8}
                wrap={false}
                style={{
                    cursor: "pointer",
                    userSelect: "none",
                }}
                onClick={() => onMenuClick?.(menuKey)}
            >
                <Icon
                    name={icon ?? ""}
                    color={isActive ? "black" : "gray-500"}
                />

                <Text
                    color={isActive ? "gray-800" : "gray-500"}
                    size="sm"
                    weight="medium"
                    wrap={false}
                >
                    {title}
                </Text>

                {showProBadge && (
                    <Icon
                        name="crown"
                        color={isActive ? "black" : "gray-500"}
                        fontSize="sm"
                    />
                )}
            </Card>
        );
    },
);

export default Menus;
