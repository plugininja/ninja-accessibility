import clsx from "clsx";
import {
    LinkProps,
    ListProps,
    NoteProps,
    TextProps,
    TitleProps,
} from "./Note.type";
import { Text } from "~/ui/atoms";

const Note = ({
    id,
    style,
    className = "",
    type = "info",
    rounded = "md",
    children,
}: NoteProps) => {
    return (
        <ul
            id={id}
            style={style}
            className={clsx(
                "pn-note",
                `pn-note--${type}`,
                `rounded-${rounded}`,
                className,
            )}
        >
            {children}
        </ul>
    );
};

Note.Bullet = ({ children }: ListProps) => {
    return <li className="pn-note__bullet">{children}</li>;
};

Note.Normal = ({ children }: ListProps) => {
    return <li className="pn-note__normal">{children}</li>;
};

Note.Title = ({ title }: TitleProps) => {
    return (
        <Text as="span" size="xs" weight="semibold">
            {title}{" "}
        </Text>
    );
};

Note.Text = ({ children }: TextProps) => {
    return <>{children}</>;
};

Note.Link = ({ url, children }: LinkProps) => {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="pn-note__link"
        >
            {children}
        </a>
    );
};

export default Note;
