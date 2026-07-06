import { useState, useRef, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    SelectBoxDropdownProps,
    SelectBoxProps,
    SelectBoxTriggerProps,
} from "./SelectBox.type";
import { Icon } from "~/ui/atoms";

export const SelectBox = ({
    id,
    style,
    className = "",
    gap = 10,
    background = "white",
    color = "primary-light",
    size = "medium",
    borderStyle = "solid",
    rounded = "sm",
    multiple = false,
    visible = true,
    disabled = false,
    optionIcon = false,
    placement = "bottom",
    prefix,
    suffix,
    label,
    helperText,
    error = false,
    errorText,
    searchable = false,
    required = false,
    readonly = false,
    waiting = false,
    loading = false,
    placeholder = __("Select…", "ninja-accessibility"),
    options = [],
    value,
    defaultValue = [],
    requiredValue = [],
    skipValues = [],
    onChange,
    onSearch,
    onClick,
    onFocus,
    onBlur,
}: SelectBoxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [internalValue, setInternalValue] = useState<string[]>(
        value ?? defaultValue,
    );
    const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">(
        "bottom",
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const controlled = value !== undefined;
    const selectedValues = controlled ? value ?? [] : internalValue;

    useEffect(() => {
        if (!isOpen || !containerRef.current) {return;}

        const rect = containerRef.current.getBoundingClientRect();
        const ESTIMATED_DROPDOWN_HEIGHT = 240;

        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        if (placement === "auto") {
            if (
                spaceBelow < ESTIMATED_DROPDOWN_HEIGHT &&
                spaceAbove > spaceBelow + 80
            ) {
                setDropdownPosition("top");
            } else {
                setDropdownPosition("bottom");
            }
        } else {
            setDropdownPosition(placement as "top" | "bottom");
        }
    }, [isOpen, placement, options.length]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setIsOpen(false);
                onBlur?.();
            }
        };
        if (isOpen) {document.addEventListener("mousedown", handleClickOutside);}
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onBlur]);

    const toggleOpen = () => {
        if (readonly || disabled) {return;}
        setIsOpen((prev) => !prev);
        if (!isOpen) {onFocus?.();}
        onClick?.();
    };

    const handleSelect = (val: string) => {
        if (disabled || val === "") {return;}

        const next: string[] = multiple
            ? selectedValues.includes(val)
                ? selectedValues.filter((v) => v !== val)
                : [...selectedValues, val]
            : [val];

        const final = next.filter((v) => !skipValues.includes(v));

        if (!controlled) {setInternalValue(next);}
        onChange?.(final);

        if (!multiple) {setIsOpen(false);}
    };

    const handleRemove = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || requiredValue.includes(val)) {return;}

        const next = selectedValues.filter((v) => v !== val);
        const final = next.filter((v) => !skipValues.includes(v));

        if (!controlled) {setInternalValue(next);}
        onChange?.(final);
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        const final: string[] = requiredValue.length > 0 ? requiredValue : [];
        if (!controlled) {setInternalValue(final);}
        onChange?.(final);
    };

    if (!visible) {return null;}

    return (
        <div
            id={id}
            style={{ ...style, gap }}
            ref={containerRef}
            className={clsx(
                "pn-select-box",
                isOpen && "pn-select-box--open",
                className,
            )}
        >
            {label && (
                <label className="pn-select-box__label">
                    {label}
                    {required && (
                        <span className="pn-select-box__required">*</span>
                    )}
                </label>
            )}

            <SelectTrigger
                background={background}
                color={color}
                size={size}
                borderStyle={borderStyle}
                rounded={rounded}
                disabled={disabled}
                waiting={waiting}
                isOpen={isOpen}
                selectedValues={selectedValues}
                options={options}
                placeholder={placeholder}
                multiple={multiple}
                optionIcon={optionIcon}
                prefix={prefix}
                suffix={suffix}
                error={error}
                onToggle={toggleOpen}
                onRemove={handleRemove}
            >
                <SelectDropdown
                    isOpen={isOpen}
                    position={dropdownPosition}
                    searchable={searchable}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    onSearch={onSearch}
                    loading={loading}
                    options={options}
                    selectedValues={selectedValues}
                    multiple={multiple}
                    optionIcon={optionIcon}
                    onSelect={handleSelect}
                    onClearAll={clearAll}
                />
            </SelectTrigger>

            {(helperText || (error && errorText)) && (
                <span
                    className={clsx(
                        "pn-select-box__helper-text",
                        error && "pn-select-box__helper-text--error",
                    )}
                >
                    {error && errorText ? errorText : helperText}
                </span>
            )}
        </div>
    );
};

const SelectTrigger = ({
    background = "white",
    color,
    size,
    borderStyle,
    rounded,
    disabled,
    waiting,
    isOpen,
    selectedValues,
    options,
    placeholder,
    multiple,
    optionIcon,
    prefix,
    suffix,
    error,
    children,
    onToggle,
    onRemove,
}: SelectBoxTriggerProps) => {
    const selectedOpts = options.filter((o) =>
        selectedValues.includes(o.value),
    );

    return (
        <div
            className={clsx(
                "pn-select-trigger",
                "border",
                `bg-${background}`,
                error ? "border-error" : `border-${color}`,
                `border-${borderStyle}`,
                `pn-select-trigger--${size}`,
                `rounded-${rounded}`,
                multiple &&
                    selectedOpts.length > 0 &&
                    "pn-select-trigger--multiple-select",
                disabled && "pn-select-trigger--disabled",
            )}
            onClick={onToggle}
        >
            {prefix}

            <div className="pn-select-value">
                {waiting ? (
                    <Icon
                        name="progress_activity"
                        style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                        }}
                        className="loading"
                    />
                ) : selectedValues.length === 0 ? (
                    <span className="pn-select-placeholder">{placeholder}</span>
                ) : multiple ? (
                    selectedOpts.map((opt) => (
                        <span
                            key={opt.value}
                            className={clsx(
                                "pn-select-tag",
                                opt?.warning && "pn-select-tag--warning",
                            )}
                        >
                            {optionIcon && opt.icon && (
                                <Icon
                                    name={opt.icon}
                                    color="gray-700"
                                    fontSize="lg"
                                />
                            )}

                            {opt.name ?? opt.value}

                            <span
                                className="pn-select-remove"
                                onClick={(e) => onRemove(opt.value, e)}
                            >
                                ×
                            </span>
                        </span>
                    ))
                ) : (
                    <>
                        {optionIcon && selectedOpts[0]?.icon && (
                            <Icon name={selectedOpts[0].icon} fontSize="lg" />
                        )}

                        <span>
                            {selectedOpts[0]?.name ?? selectedValues[0]}
                        </span>
                    </>
                )}
            </div>

            {suffix}

            <Icon
                name="expand_more"
                fontSize="xl"
                className={clsx(
                    "pn-select-arrow",
                    isOpen && "pn-select-arrow--open",
                )}
            />

            {children}
        </div>
    );
};

const SelectDropdown = ({
    isOpen,
    position,
    searchable,
    searchText,
    setSearchText,
    onSearch,
    loading,
    options,
    selectedValues,
    multiple,
    optionIcon,
    onSelect,
    onClearAll,
}: SelectBoxDropdownProps) => {
    const filtered = options?.filter(
        (o) =>
            (o.name ?? o.value)
                ?.toLowerCase()
                .includes(searchText.toLowerCase()),
    );

    const visibleOptions = multiple
        ? filtered.filter((o) => !selectedValues.includes(o.value))
        : filtered;

    return (
        <div
            className={clsx(
                "pn-select-dropdown",
                `pn-select-dropdown--${position}`,
                isOpen && "pn-select-dropdown--open",
            )}
        >
            <div className="pn-select-scroll">
                {searchable && (
                    <div
                        style={{
                            position: "sticky",
                            top: 0,
                        }}
                        className="pn-select-search"
                    >
                        <Icon name="search" fontSize="xl" />

                        <input
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                onSearch?.(e.target.value);
                            }}
                            placeholder={__("Search…", "ninja-accessibility")}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="pn-select-loading">
                        {__("Loading…", "ninja-accessibility")}
                        <Icon name="progress_activity" className="loading" />
                    </div>
                ) : visibleOptions.length === 0 ? (
                    <div className="pn-select-not-found">
                        {__("No results found", "ninja-accessibility")}
                    </div>
                ) : (
                    visibleOptions.map((opt) => (
                        <div
                            key={opt.value}
                            className={clsx(
                                "pn-select-option",
                                selectedValues.includes(opt.value) &&
                                    "pn-select-option--selected",
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(opt.value);
                            }}
                        >
                            {optionIcon && opt.icon && (
                                <Icon
                                    name={opt.icon}
                                    color={
                                        selectedValues.includes(opt.value)
                                            ? "primary"
                                            : "black"
                                    }
                                    fontSize="lg"
                                />
                            )}

                            <span className="pn-select-option-name">
                                {opt.name ?? opt.value}
                            </span>
                        </div>
                    ))
                )}

                {multiple && selectedValues.length > 0 && (
                    <div
                        className="pn-select-clear-all"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClearAll(e);
                        }}
                    >
                        <span className="pn-select-clear-all-text">
                            {__("Clear all", "ninja-accessibility")}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectBox;
