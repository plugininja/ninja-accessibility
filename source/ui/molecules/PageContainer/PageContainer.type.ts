export interface PageContainerProps {
    id?: string;
    compact?: boolean;
    style?: React.CSSProperties;
    className?: string;
    gap?: number | string;
    title?: string;
    nodeTitle?: React.ReactNode;
    description?: string;
    docLink?: string;
    widget?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}
