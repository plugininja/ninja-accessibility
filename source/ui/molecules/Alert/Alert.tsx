/**
 * Alert component - toast and modal alerts with timer, icons, and progress bar support.
 * Based on ninja-drive implementation, adapted for ninja-accessibility.
 */

import { __ } from "@wordpress/i18n";
import clsx from "clsx";
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    createPortal,
} from "@wordpress/element";
import {
    AlertContextType,
    AlertProps,
    AlertState,
    AlertType,
} from "./Alert.type";

const AlertContext = createContext< AlertContextType | undefined >( undefined );

export function CustomAlertProvider( {
    children,
}: {
    children: React.ReactNode;
} ) {
    const [ alerts, setAlerts ] = useState< AlertState[] >( [] );

    const closeAlert = useCallback( ( id: string ) => {
        setAlerts( ( prev ) => prev.filter( ( alert ) => alert.id !== id ) );
    }, [] );

    const showAlert = useCallback(
        (
            options: AlertProps,
        ): Promise< { isConfirmed: boolean; value?: string | number } > => {
            return new Promise( ( resolve ) => {
                const id = options.id || `alert-${ Date.now() }-${ Math.random() }`;

                const handleConfirm = async ( inputValue: string | number ) => {
                    if ( options.input && options.inputValidator ) {
                        const error = options.inputValidator( inputValue );

                        if ( error ) {
                            return;
                        }
                    }

                    if ( options.onConfirm ) {
                        setAlerts( ( prev ) =>
                            prev.map( ( a ) =>
                                a.id === id ? { ...a, isLoading: true } : a,
                            ),
                        );

                        await options.onConfirm( inputValue );
                    }

                    closeAlert( id );

                    resolve( {
                        isConfirmed: true,
                        value: inputValue,
                    } );
                };

                const handleCancel = () => {
                    if ( options.onCancel ) {
                        options.onCancel();
                    }

                    closeAlert( id );

                    resolve( { isConfirmed: false } );
                };

                const handleClose = () => {
                    if ( options.onClose ) {
                        options.onClose();
                    }

                    closeAlert( id );

                    resolve( { isConfirmed: false } );
                };

                const newAlert: AlertState = {
                    ...options,
                    id,
                    isOpen: true,
                    onConfirm: handleConfirm,
                    onCancel: handleCancel,
                    onClose: handleClose,
                    inputValue: options.inputValue || "",
                    pauseOnHover: options.pauseOnHover ?? true,
                };

                setAlerts( ( prev ) => [ ...prev, newAlert ] );
            } );
        },
        [ closeAlert ],
    );

    return (
        <AlertContext.Provider value={ { showAlert, closeAlert } }>
            { children }

            <AlertContainer alerts={ alerts } />
        </AlertContext.Provider>
    );
}

export function useCustomAlert() {
    const context = useContext( AlertContext );

    if ( ! context ) {
        throw new Error(
            "useCustomAlert must be used within CustomAlertProvider",
        );
    }

    return context;
}

function AlertContainer( { alerts }: { alerts: AlertState[] } ) {
    if ( typeof window === "undefined" ) return null;

    const modals = alerts.filter( ( a ) => ! a.toast );
    const toasts = alerts.filter( ( a ) => a.toast );
    const rootedToasts = toasts.filter( ( a ) => a.root_id );
    const traylessToasts = toasts.filter( ( a ) => ! a.root_id );

    const toastGroups = new Map< string, AlertState[] >();

    for ( const toast of traylessToasts ) {
        const pos = toast.position || "top-center";

        if ( ! toastGroups.has( pos ) ) {
            toastGroups.set( pos, [] );
        }

        toastGroups.get( pos )!.push( toast );
    }

    return (
        <>
            { modals.map( ( modal ) => {
                const root = modal.root_id
                    ? document.getElementById( modal.root_id ) || document.body
                    : document.body;

                if ( ! root ) return null;

                return createPortal(
                    <div className="pnpna-top-level-wrapper">
                        <AlertComponent key={ modal.id } { ...modal } />
                    </div>,
                    root,
                );
            } ) }

            { rootedToasts.map( ( toast ) => {
                const root =
                    document.getElementById( toast.root_id! ) || document.body;

                if ( ! root ) return null;

                return createPortal(
                    <div className="pnpna-top-level-wrapper">
                        <AlertComponent key={ toast.id } { ...toast } />
                    </div>,
                    root,
                );
            } ) }

            { Array.from( toastGroups.entries() ).map( ( [ position, groupToasts ] ) =>
                createPortal(
                    <div key={ position } className={ `pnpna-toast-tray ${ position }` }>
                        { groupToasts.map( ( toast ) => (
                            <AlertComponent key={ toast.id } { ...toast } inTray />
                        ) ) }
                    </div>,
                    document.body,
                ),
            ) }
        </>
    );
}

function AlertComponent( props: AlertState & { inTray?: boolean } ) {
    const {
        title,
        text,
        html,
        type = "info",
        width,
        height,
        style,
        icon,
        showConfirmButton = true,
        showCancelButton = false,
        confirmButtonText = __( "OK", "ninja-accessibility" ),
        cancelButtonText = __( "Cancel", "ninja-accessibility" ),
        showIcon = true,
        timer,
        timerProgressBar = false,
        position = "center-center",
        toast = false,
        allowOutsideClick = true,
        allowEscapeKey = true,
        showCloseButton = false,
        onConfirm,
        onCancel,
        onClose,
        input,
        inputPlaceholder = "",
        inputValue: initialInputValue = "",
        inputSuffix,
        inputOptions = [],
        isLoading = false,
        pauseOnHover = true,
        id,
        confirmOnEnter = true,
        root_id,
        inTray = false,
    } = props;

    const [ inputValue, setInputValue ] = useState( initialInputValue );
    const [ errorMessage, setErrorMessage ] = useState< string | null >( null );
    const [ closing, setClosing ] = useState( false );

    const [ remainingTime, setRemainingTime ] = useState( timer || 0 );
    const timerRef = useRef< NodeJS.Timeout | null >( null );
    const startTimeRef = useRef< number >( 0 );
    const pausedElapsedRef = useRef< number >( 0 );
    const inputRef = useRef< HTMLElement | null >( null );
    const [ isPaused, setIsPaused ] = useState( false );
    const onCloseRef = useRef( onClose );
    onCloseRef.current = onClose;

    const isToastWithTimer = toast && !! timer && timer > 0;
    const shouldPauseOnHover = isToastWithTimer && pauseOnHover;

    useEffect( () => {
        if ( ! isToastWithTimer ) return;

        if ( startTimeRef.current === 0 ) {
            startTimeRef.current = Date.now();
        }

        if ( ! isPaused ) {
            timerRef.current = setInterval( () => {
                const now = Date.now();
                const totalElapsed =
                    now - startTimeRef.current + pausedElapsedRef.current;
                const newRemaining = Math.max( 0, timer - totalElapsed );

                setRemainingTime( newRemaining );

                if ( newRemaining <= 0 ) {
                    if ( timerRef.current ) clearInterval( timerRef.current );
                    if ( onCloseRef.current ) onCloseRef.current();
                }
            }, 16 );
        }

        return () => {
            if ( timerRef.current ) clearInterval( timerRef.current );
        };
    }, [ isPaused, isToastWithTimer, timer ] );

    const handleMouseEnter = () => {
        if ( ! shouldPauseOnHover ) return;

        if ( timerRef.current ) {
            clearInterval( timerRef.current );
            timerRef.current = null;
        }

        const now = Date.now();
        pausedElapsedRef.current += now - startTimeRef.current;
        startTimeRef.current = 0;

        setIsPaused( true );
    };

    const handleMouseLeave = () => {
        if ( ! shouldPauseOnHover ) return;

        startTimeRef.current = Date.now();
        setIsPaused( false );
    };

    useEffect( () => {
        if ( input && inputRef.current ) {
            setTimeout( () => {
                inputRef.current?.focus();
            }, 0 );
        }
    }, [ input ] );

    useEffect( () => {
        if ( ! allowEscapeKey ) return;

        const handleEscape = ( e: KeyboardEvent ) => {
            e.stopPropagation();
            if ( e.key === "Escape" && onClose ) {
                handleCloseWithAnimation();
            }
        };

        document.addEventListener( "keydown", handleEscape );
        return () => document.removeEventListener( "keydown", handleEscape );
    }, [ allowEscapeKey, onClose ] );

    const handleCloseWithAnimation = () => {
        if ( onClose ) onClose();
    };

    const handleBackdropClick = ( e: React.MouseEvent ) => {
        e.stopPropagation();
        if ( allowOutsideClick && e.target === e.currentTarget ) {
            handleCloseWithAnimation();
        }
    };

    const handleConfirmClick = async () => {
        if ( props.inputValidator && inputValue ) {
            const error = props.inputValidator( inputValue );
            if ( error ) {
                setErrorMessage( error );
                return;
            }
        }

        if ( onConfirm ) {
            await onConfirm( inputValue );
        }
    };

    useEffect( () => {
        if ( ! confirmOnEnter ) return;

        const handleEnter = ( e: KeyboardEvent ) => {
            if ( e.key === "Enter" && showConfirmButton && ! isLoading ) {
                e.stopPropagation();
                handleConfirmClick();
            }
        };

        document.addEventListener( "keydown", handleEnter );

        return () => {
            document.removeEventListener( "keydown", handleEnter );
        };
    }, [ confirmOnEnter, inputValue ] );

    const getPositionClass = () => {
        const positionMap = {
            "center-center": "center-center",
            "top-left": "top-left",
            "top-center": "top-center",
            "top-right": "top-right",
            "bottom-left": "bottom-left",
            "bottom-center": "bottom-center",
            "bottom-right": "bottom-right",
        };

        return positionMap[ position ] || "center-center";
    };

    const overlayClasses = [
        "pnpna-alert-overlay",
        toast && "pnpna-toast",
        inTray && "pnpna-toast-in-tray",
        getPositionClass(),
    ]
        .filter( Boolean )
        .join( " " );

    const containerClasses = [
        "pnpna-alert-container",
        toast && "pnpna-toast",
        closing && ( toast ? "toast-closing" : "closing" ),
        id,
    ]
        .filter( Boolean )
        .join( " " );

    const iconClasses = [
        "pnpna-alert-icon-container",
        `pnpna-${ type }`,
        type === "question" ? "bg-extralight" : `bg-${ type }extralight`,
        toast && "pnpna-toast",
    ]
        .filter( Boolean )
        .join( " " );

    const contentClasses = [ "pnpna-alert-content", toast && "pnpna-toast" ]
        .filter( Boolean )
        .join( " " );

    const titleClasses = [ "pnpna-alert-title", toast && "pnpna-toast" ]
        .filter( Boolean )
        .join( " " );

    const messageClasses = [ "pnpna-alert-message", toast && "pnpna-toast" ]
        .filter( Boolean )
        .join( " " );

    const inputClasses = [ "pnpna-alert-input", errorMessage && "error" ]
        .filter( Boolean )
        .join( " " );

    const buttonsClasses = [ "pnpna-alert-buttons", toast && "pnpna-toast" ]
        .filter( Boolean )
        .join( " " );

    const confirmButtonClasses = [
        "pnpna-alert-button",
        "pnpna-alert-confirm-button",
        type,
        toast && "pnpna-toast",
    ]
        .filter( Boolean )
        .join( " " );

    const cancelButtonClasses = [
        "pnpna-alert-button",
        "pnpna-alert-cancel-button",
        toast && "pnpna-toast",
    ]
        .filter( Boolean )
        .join( " " );

    const container = (
        <div
            style={ {
                ...style,
                maxWidth: width ? width : "",
                height: height ? height : "",
            } }
            className={ containerClasses }
        >
            { timerProgressBar && isToastWithTimer && (
                <div
                    style={ {
                        transform: `scaleX(${ remainingTime / timer })`,
                        transformOrigin: "left",
                        transition: isPaused
                            ? "none"
                            : "transform 0.05s linear",
                        borderRadius:
                            "0 0 var(--alert-border-radius) var(--alert-border-radius)",
                    } }
                    className={ clsx(
                        "pnpna-alert-timer-progress",
                        `pnpna-progress-${ type }`,
                    ) }
                />
            ) }

            { showCloseButton && (
                <button
                    aria-label={ __( "Close", "ninja-accessibility" ) }
                    className={ clsx( "pnpna-alert-close-button" ) }
                    onClick={ handleCloseWithAnimation }
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                </button>
            ) }

            { toast ? (
                <div className="pnpna-alert-toast-content">
                    { showIcon && (
                        <div className={ iconClasses }>
                            { getIcon( { icon, type, toast } ) }
                        </div>
                    ) }

                    <div className="pnpna-alert-toast-text">
                        { title && <h3 className={ titleClasses }>{ title }</h3> }

                        { text && <p className={ messageClasses }>{ text }</p> }

                        { html && (
                            <div className="pnpna-alert-html-content">{ html }</div>
                        ) }
                    </div>
                </div>
            ) : (
                <>
                    { showIcon && (
                        <div className={ iconClasses }>
                            { getIcon( { icon, type, toast } ) }
                        </div>
                    ) }

                    <div className={ contentClasses }>
                        { title && <h2 className={ titleClasses }>{ title }</h2> }

                        { text && <p className={ messageClasses }>{ text }</p> }

                        { html && (
                            <div className="pnpna-alert-html-content">{ html }</div>
                        ) }
                    </div>
                </>
            ) }

            { ( showConfirmButton || showCancelButton ) && (
                <div className={ buttonsClasses }>
                    { showCancelButton && (
                        <button
                            className={ cancelButtonClasses }
                            onClick={ onCancel }
                            disabled={ isLoading }
                        >
                            { cancelButtonText }
                        </button>
                    ) }

                    { showConfirmButton && (
                        <button
                            className={ confirmButtonClasses }
                            onClick={ handleConfirmClick }
                            disabled={ isLoading }
                        >
                            { isLoading && <span className="pnpna-alert-spinner" /> }
                            { confirmButtonText }
                        </button>
                    ) }
                </div>
            ) }
        </div>
    );

    const overlayEventHandlers: Record< string, unknown > = {};

    if ( toast ) {
        overlayEventHandlers.onMouseEnter = handleMouseEnter;
        overlayEventHandlers.onMouseLeave = handleMouseLeave;
    }

    if ( ! toast ) {
        overlayEventHandlers.onClick = handleBackdropClick;
    }

    return (
        <div className={ overlayClasses } { ...overlayEventHandlers }>
            { container }
        </div>
    );
}

const getIcon = ( {
    icon,
    type,
    toast,
}: {
    icon?: React.ReactNode | AlertType;
    type?: string;
    toast?: boolean;
} ) => {
    if ( typeof icon !== "string" && icon ) return icon;

    const iconSize = toast ? "24" : "40";

    const iconType = icon || type;

    switch ( iconType ) {
        case "success":
            return (
                <svg
                    width={ iconSize }
                    height={ iconSize }
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M8 12.5l2.5 2.5L16 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        case "error":
            return (
                <svg
                    width={ iconSize }
                    height={ iconSize }
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "warning":
            return (
                <svg
                    width={ iconSize }
                    height={ iconSize }
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M12 2L2 20h20L12 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 9v4M12 17h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "info":
            return (
                <svg
                    width={ iconSize }
                    height={ iconSize }
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M12 16v-4M12 8h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            );

        case "question":
            return (
                <svg
                    width={ iconSize }
                    height={ iconSize }
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            );
    }
};
