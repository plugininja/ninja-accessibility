export type ExtraContents = Array<
    | JSX.Element
    | React.ReactElement
    | Iterable<React.ReactNode>
    | number
    | boolean
    | null
    | undefined
>;

export interface TopbarProps {
    id?: string;
    style?: React.CSSProperties;
    top?: number | string;
    zIndex?: number;
    className?: string;
    border?: boolean;
    wrap?: boolean;
    leftContentsClassName?: string;
    padding?: string | number;
    leftContents?: ExtraContents;
    rightContents?: ExtraContents;
    children?: React.ReactNode;
}
