import { forwardRef } from "@wordpress/element";
import clsx from "clsx";

interface ContentWrapperProps {
    style?: React.CSSProperties;
    children: React.ReactNode;
}

interface MainLayoutProps extends ContentWrapperProps {
    style?: React.CSSProperties;
    className?: string;
    isBg?: boolean;
}

const MainLayout = ({
    children,
    className,
    isBg = true,
    style,
}: MainLayoutProps) => {
    return (
        <div
            style={style}
            className={clsx("pnpna", { "pnpna-bg": isBg }, className)}
        >
            {children}
        </div>
    );
};

MainLayout.ContentWrapper = ({ style, children }: ContentWrapperProps) => {
    return (
        <div style={style} className="pnpna-content-wrapper">
            {children}
        </div>
    );
};

MainLayout.Content = forwardRef<HTMLElement, MainLayoutProps>(
    ({ children, className, style }, ref) => {
        const classNames = clsx("pnpna-content", className);

        return (
            <div
                style={style}
                className={classNames}
                ref={ref as React.RefObject<HTMLDivElement>}
            >
                {children}
            </div>
        );
    },
);

export default MainLayout;
