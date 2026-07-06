/**
 * Mouse cursor customization — frontend effects.
 *
 * The CSS cursor override itself is applied server-side (Mouse_Customization).
 * This script adds the optional JS-based motion effects. No jQuery required.
 */

function initFollowingDot(): void {
	const dot = document.createElement( 'div' );
	dot.setAttribute( 'aria-hidden', 'true' );
	Object.assign( dot.style, {
		position: 'fixed',
		width: '10px',
		height: '10px',
		background: 'var(--pnpna-primary-color, #003C43)',
		borderRadius: '50%',
		pointerEvents: 'none',
		zIndex: '2147483647',
		transition: 'transform 0.1s ease',
		top: '0',
		left: '0',
		transform: 'translate(-50%, -50%)',
	} );
	document.body.appendChild( dot );

	document.addEventListener( 'mousemove', ( e: MouseEvent ) => {
		dot.style.left = e.clientX + 'px';
		dot.style.top = e.clientY + 'px';
	} );
}

function initCursorEffect( effectType: string ): void {
	switch ( effectType ) {
		case 'followingDot':
			initFollowingDot();
			break;
		/* <fs_premium_only> */
		// Pro cursor effects.
		/* </fs_premium_only> */
		default:
			break;
	}
}

function boot(): void {
	// Skip on touch-only devices — a cursor effect is meaningless there.
	if ( window.matchMedia && ! window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches ) {
		return;
	}

	const effectType = window.pnpna?.cursorEffect || '';

	if ( effectType && effectType !== 'none' ) {
		initCursorEffect( effectType );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
