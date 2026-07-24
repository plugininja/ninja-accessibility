type Menu = {
    key: string;
    title: string;
    icon?: string;
    /** Marks the menu as a premium feature (crown badge for free users). */
    isPro?: boolean;
};

export interface MenusProps {
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    menus: Menu[];
    active?: string;
    onMenuClick?: (key: string) => void;
}

export interface MenuProps {
    menuKey: string;
    title: string;
    icon?: string;
    isPro?: boolean;
    isActive?: boolean;
    tabIndex?: number;
    onMenuClick?: (menuKey: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}
