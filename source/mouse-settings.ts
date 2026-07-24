/**
 * Mouse cursor customization — frontend effects.
 *
 * The CSS cursor override itself is applied server-side (Mouse_Customization).
 * This script adds the animated ring/dot cursor for the built-in shapes plus
 * the optional JS-based motion effects. No jQuery required.
 */

// ─── Animated ring/dot cursor (built-in shapes — Accessiy parity) ────────────
//
// The five built-in circle shapes are not a static CSS cursor image: the
// native cursor is hidden (server-side CSS) and this pair of elements is
// animated instead. The dot tracks the pointer almost instantly (0.1s
// transition) while the ring eases behind it (0.2s), and on link hover the
// ring morphs to wrap the link's bounding box — exactly like Accessiy.

interface RingCursorConfig {
	shape: string;
	size: number;
	color: string;
}

function initRingCursor( config: RingCursorConfig ): void {
	const shape = config.shape || 'cursor1';

	const wrapper = document.createElement( 'div' );
	// `pnpna-fx` keeps it immune from the widget's page-level adjustments.
	wrapper.className = `pnpna-fx pnpna-cursor-wrapper pnpna-cursor-wrapper--${ shape }`;
	wrapper.setAttribute( 'aria-hidden', 'true' );
	wrapper.style.setProperty( '--pnpna-cursor-color', config.color );

	const ring = document.createElement( 'div' );
	ring.className = 'pnpna-cursor-ring';

	const dot = document.createElement( 'div' );
	dot.className = 'pnpna-cursor-dot';

	wrapper.appendChild( ring );
	wrapper.appendChild( dot );
	document.body.appendChild( wrapper );

	// Accessiy keeps its small dot+ring variant at a fixed 12px ring; the
	// other variants scale with the configured cursor size.
	const ringSize = 'cursor5' === shape ? 12 : Math.max( 12, config.size );
	const dotSize = Math.max( 4, Math.round( ringSize * 0.29 ) );

	dot.style.width = `${ dotSize }px`;
	dot.style.height = `${ dotSize }px`;

	let hoveringLink = false;

	const restoreRing = ( x: number, y: number ): void => {
		ring.style.width = `${ ringSize }px`;
		ring.style.height = `${ ringSize }px`;
		ring.style.borderRadius = '500px';
		ring.style.transform = `translate(${ x - ringSize / 2 }px, ${ y - ringSize / 2 }px)`;
	};

	document.addEventListener( 'mousemove', ( e: MouseEvent ) => {
		dot.style.transform = `translate(${ e.clientX - dotSize / 2 }px, ${ e.clientY - dotSize / 2 }px)`;

		if ( ! hoveringLink ) {
			restoreRing( e.clientX, e.clientY );
		}
	} );

	// Delegated link hover: the ring stretches to wrap the hovered link
	// (works for links added after page load too).
	document.addEventListener( 'mouseover', ( e: MouseEvent ) => {
		const link = ( e.target as Element | null )?.closest?.( 'a' );

		if ( ! link || wrapper.contains( link ) ) {
			return;
		}

		hoveringLink = true;

		const rect = link.getBoundingClientRect();
		ring.style.width = `${ Math.max( 0, rect.width - 1.5 ) }px`;
		ring.style.height = `${ Math.max( 0, rect.height - 1.5 ) }px`;
		ring.style.borderRadius = window.getComputedStyle( link ).borderRadius || '6px';
		ring.style.transform = `translate(${ rect.left }px, ${ rect.top }px)`;
	} );

	document.addEventListener( 'mouseout', ( e: MouseEvent ) => {
		const link = ( e.target as Element | null )?.closest?.( 'a' );

		if ( ! link ) {
			return;
		}

		const to = e.relatedTarget as Element | null;

		// Still inside the same link (moved onto a child element)? Keep wrapping.
		if ( to && to.closest && to.closest( 'a' ) === link ) {
			return;
		}

		hoveringLink = false;
	} );
}

function initFollowingDot(): void {
	const dot = document.createElement( 'div' );
	dot.className = 'pnpna-fx';
	dot.setAttribute( 'aria-hidden', 'true' );
	Object.assign( dot.style, {
		position: 'fixed',
		width: '10px',
		height: '10px',
		background: 'var(--pnpna-primary-color, #9147FF)',
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
		default:
			break;
	}
}

function boot(): void {
	// Skip on touch-only devices — a cursor effect is meaningless there.
	if ( window.matchMedia && ! window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches ) {
		return;
	}

	// Built-in shape selected → animated ring/dot cursor (Accessiy parity).
	// This always runs: the native cursor is hidden server-side, so the
	// ring/dot pair IS the visitor's pointer, not a decorative animation.
	const ringConfig = window.pnpna?.customCursor;

	if ( ringConfig && ringConfig.shape ) {
		initRingCursor( ringConfig );
	}

	// Decorative motion effects (trails, bubbles, emoji …) are suppressed
	// for visitors who ask the OS for reduced motion (WCAG 2.3.3).
	if ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
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
