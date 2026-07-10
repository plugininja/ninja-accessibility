/**
 * DOM-level implementations for each accessibility feature.
 *
 * Every feature implements { apply( step ), remove() }. Simple toggles only
 * ever receive step 1; multi-step features (Content Scaling, Font Sizing,
 * Line Height, Letter Spacing, Brightness, Saturation, Cursor, Text Align)
 * receive 1..n and adjust their intensity accordingly.
 */

import { __ } from '@wordpress/i18n';
import type { ActiveFeatureMap, FeatureKey } from '~/kernel/types/widget';

/** Number of active steps per feature (1 = plain on/off toggle). */
export const STEP_COUNTS: Record<FeatureKey, number> = {
	content_scaling:    4,
	bigger_text:        4,
	bigger_line_height: 4,
	letter_spacing:     4,
	text_align:         3,
	readable_font:      1,
	text_magnifier:     1,
	highlight_links:    1,
	cursor:             4,
	page_structure:     1,
	screen_reader:      1,
	reading_mask:       1,
	sitemap:            1,
	hide_images:        1,
	pause_animation:    1,
	mute_sounds:        1,
	reading_line:       1,
	outline_focus:      1,
	grey_scale:         1,
	contrast:           1,
	invert_color:       1,
	brightness:         3,
	saturation:         3,
};

/**
 * Notify the widget UI that a feature deactivated itself (e.g. the user
 * closed the Page Structure dialog with its own close button) so the
 * Redux state and the pressed-button styling stay in sync.
 * @param key Feature that closed itself.
 */
function announceSelfClose( key: FeatureKey ): void {
	document.dispatchEvent(
		new CustomEvent( 'pnpna:feature-closed', { detail: { key } } )
	);
}

interface FeatureImpl {
	apply: ( step: number ) => void;
	remove: () => void;
}

// ─── Body class helpers ───────────────────────────────────────────────────────

function toggleBodyClass( cls: string ): FeatureImpl {
	return {
		apply(): void { document.body.classList.add( cls ); },
		remove(): void { document.body.classList.remove( cls ); },
	};
}

/**
 * Stepped body class: applies `${prefix}-${step}` and clears the others.
 * @param prefix Class prefix without the trailing step number.
 * @param max    Highest step the feature supports.
 */
function steppedBodyClass( prefix: string, max: number ): FeatureImpl {
	const all = Array.from( { length: max }, ( _, i ) => `${ prefix }-${ i + 1 }` );

	return {
		apply( step: number ): void {
			document.body.classList.remove( ...all );
			if ( step >= 1 && step <= max ) {
				document.body.classList.add( `${ prefix }-${ step }` );
			}
		},
		remove(): void {
			document.body.classList.remove( ...all );
		},
	};
}

// ─── Content scaling (zoom on <html>) ─────────────────────────────────────────

const contentScalingFeature: FeatureImpl = {
	apply( step: number ): void {
		const scale = 1 + Math.max( 0, Math.min( step, 4 ) ) * 0.1;
		( document.documentElement.style as CSSStyleDeclaration & { zoom: string } ).zoom = String( scale );

		// Counter-zoom the widget so the plugin UI itself never rescales.
		const widget = document.getElementById( 'pnpna-frontend' );
		if ( widget ) {
			( widget.style as CSSStyleDeclaration & { zoom: string } ).zoom = String( 1 / scale );
		}
	},
	remove(): void {
		( document.documentElement.style as CSSStyleDeclaration & { zoom: string } ).zoom = '';

		const widget = document.getElementById( 'pnpna-frontend' );
		if ( widget ) {
			( widget.style as CSSStyleDeclaration & { zoom: string } ).zoom = '';
		}
	},
};

// ─── Big cursor (stepped image cursor, like the reference plugin) ─────────────

const CURSOR_SIZE_STEPS = [ 0, 48, 72, 96, 120 ];

let cursorEl: HTMLDivElement | null = null;

function cursorMouseMove( e: MouseEvent ): void {
	if ( cursorEl ) {
		cursorEl.style.left = `${ e.clientX }px`;
		cursorEl.style.top = `${ e.clientY }px`;
	}
}

function createCursorEl(): void {
	if ( cursorEl ) {
		return;
	}

	const assetsUrl = window.pnpna?.assetsUrl || '';

	cursorEl = document.createElement( 'div' );
	cursorEl.id = 'pnpna-custom-cursor';
	cursorEl.setAttribute( 'aria-hidden', 'true' );

	Object.assign( cursorEl.style, {
		position: 'fixed',
		pointerEvents: 'none',
		zIndex: '2147483647',
		transform: 'translate(-15%, -10%)',
		transition: 'width 0.2s ease, height 0.2s ease',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'contain',
		backgroundPosition: 'center',
		backgroundImage: `url(${ assetsUrl }/images/icons/mouse-default.svg)`,
		top: '0',
		left: '0',
	} );

	document.body.appendChild( cursorEl );
	document.addEventListener( 'mousemove', cursorMouseMove );
}

const cursorFeature: FeatureImpl = {
	apply( step: number ): void {
		const size = CURSOR_SIZE_STEPS[ step ] || 0;

		if ( 0 === size ) {
			cursorFeature.remove();
			return;
		}

		createCursorEl();

		if ( cursorEl ) {
			cursorEl.style.width = `${ size }px`;
			cursorEl.style.height = `${ size }px`;
		}

		document.body.classList.add( 'pnpna-hide-native-cursor' );
	},
	remove(): void {
		if ( cursorEl ) {
			cursorEl.remove();
			cursorEl = null;
			document.removeEventListener( 'mousemove', cursorMouseMove );
		}
		document.body.classList.remove( 'pnpna-hide-native-cursor' );
	},
};

// ─── Reading mask ─────────────────────────────────────────────────────────────

let readingMaskEl: HTMLElement | null = null;
let maskWindowEl: HTMLElement | null = null;

function maskMouseMove( e: MouseEvent ): void {
	if ( maskWindowEl ) {
		maskWindowEl.style.top = e.clientY - 40 + 'px';
	}
}

const readingMaskFeature: FeatureImpl = {
	apply(): void {
		if ( readingMaskEl ) {return;}
		readingMaskEl = document.createElement( 'div' );
		readingMaskEl.className = 'pnpna-reading-mask';
		readingMaskEl.setAttribute( 'aria-hidden', 'true' );
		// Inline, so no theme stylesheet can ever make the mask swallow clicks.
		readingMaskEl.style.pointerEvents = 'none';
		maskWindowEl = document.createElement( 'div' );
		maskWindowEl.className = 'pnpna-reading-mask__window';
		maskWindowEl.style.pointerEvents = 'none';
		// Start mid-viewport so the mask looks right before the first mousemove.
		maskWindowEl.style.top = Math.round( window.innerHeight / 2 - 40 ) + 'px';
		readingMaskEl.appendChild( maskWindowEl );
		document.body.appendChild( readingMaskEl );
		document.addEventListener( 'mousemove', maskMouseMove );
	},
	remove(): void {
		if ( readingMaskEl ) {
			readingMaskEl.remove();
			readingMaskEl = null;
			maskWindowEl = null;
		}
		document.removeEventListener( 'mousemove', maskMouseMove );
	},
};

// ─── Reading line ─────────────────────────────────────────────────────────────

let readingLineEl: HTMLElement | null = null;

function lineMouseMove( e: MouseEvent ): void {
	if ( readingLineEl ) {
		readingLineEl.style.top = e.clientY + 'px';
	}
}

const readingLineFeature: FeatureImpl = {
	apply(): void {
		if ( readingLineEl ) {return;}
		readingLineEl = document.createElement( 'div' );
		readingLineEl.className = 'pnpna-reading-line';
		readingLineEl.setAttribute( 'aria-hidden', 'true' );
		document.body.appendChild( readingLineEl );
		document.addEventListener( 'mousemove', lineMouseMove );
	},
	remove(): void {
		if ( readingLineEl ) {
			readingLineEl.remove();
			readingLineEl = null;
		}
		document.removeEventListener( 'mousemove', lineMouseMove );
	},
};

// ─── Page structure ───────────────────────────────────────────────────────────

let pageStructureEl: HTMLElement | null = null;

const pageStructureFeature: FeatureImpl = {
	apply(): void {
		if ( pageStructureEl ) {return;}

		const headings = Array.from(
			document.querySelectorAll<HTMLElement>(
				'h1, h2, h3, h4, h5, h6, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'
			)
		);

		pageStructureEl = document.createElement( 'div' );
		pageStructureEl.className = 'pnpna-page-structure';
		pageStructureEl.setAttribute( 'role', 'dialog' );
		pageStructureEl.setAttribute( 'aria-modal', 'true' );

		const panel   = document.createElement( 'div' );
		panel.className = 'pnpna-page-structure__panel';

		const closeBtn = document.createElement( 'button' );
		closeBtn.className = 'pnpna-page-structure__close';
		closeBtn.textContent = '✕ ' + __( 'Close', 'ninja-accessibility' );
		closeBtn.addEventListener( 'click', () => {
			pageStructureFeature.remove();
			announceSelfClose( 'page_structure' );
		} );

		const title = document.createElement( 'p' );
		title.className = 'pnpna-page-structure__title';
		title.textContent = __( 'Page Structure', 'ninja-accessibility' );

		const list = document.createElement( 'ul' );
		list.className = 'pnpna-page-structure__list';

		headings.forEach( ( el ) => {
			const li   = document.createElement( 'li' );
			li.className = 'pnpna-' + el.tagName.toLowerCase();
			li.textContent = el.textContent?.trim().slice( 0, 80 ) ?? el.getAttribute( 'role' ) ?? el.tagName;
			li.addEventListener( 'click', () => {
				el.scrollIntoView( { behavior: 'smooth', block: 'center' } );
				el.setAttribute( 'tabindex', '-1' );
				el.focus( { preventScroll: true } );
			} );
			list.appendChild( li );
		} );

		panel.appendChild( closeBtn );
		panel.appendChild( title );
		panel.appendChild( list );
		pageStructureEl.appendChild( panel );
		document.body.appendChild( pageStructureEl );
		closeBtn.focus();
	},
	remove(): void {
		pageStructureEl?.remove();
		pageStructureEl = null;
	},
};

// ─── Sitemap ──────────────────────────────────────────────────────────────────

let sitemapEl: HTMLElement | null = null;

const sitemapFeature: FeatureImpl = {
	apply(): void {
		if ( sitemapEl ) {return;}

		const links = Array.from(
			document.querySelectorAll<HTMLAnchorElement>( 'nav a, header a, .menu a, [role="navigation"] a' )
		).filter( ( a ) => a.href && a.textContent?.trim() );

		const seen  = new Set<string>();
		const unique = links.filter( ( a ) => {
			if ( seen.has( a.href ) ) {return false;}
			seen.add( a.href );
			return true;
		} );

		sitemapEl = document.createElement( 'div' );
		sitemapEl.className = 'pnpna-sitemap';
		sitemapEl.setAttribute( 'role', 'dialog' );
		sitemapEl.setAttribute( 'aria-modal', 'true' );

		const panel = document.createElement( 'div' );
		panel.className = 'pnpna-sitemap__panel';

		const titleBar  = document.createElement( 'div' );
		titleBar.className = 'pnpna-sitemap__title';
		titleBar.appendChild( document.createTextNode( __( 'Site Navigation', 'ninja-accessibility' ) ) );

		const closeBtn = document.createElement( 'button' );
		closeBtn.className = 'pnpna-sitemap__close';
		closeBtn.textContent = '✕ ' + __( 'Close', 'ninja-accessibility' );
		closeBtn.addEventListener( 'click', () => {
			sitemapFeature.remove();
			announceSelfClose( 'sitemap' );
		} );
		titleBar.appendChild( closeBtn );

		const list = document.createElement( 'ul' );
		list.className = 'pnpna-sitemap__links';

		unique.forEach( ( a ) => {
			const li   = document.createElement( 'li' );
			const link = document.createElement( 'a' );
			link.href = a.href;
			link.textContent = a.textContent?.trim() ?? '';
			li.appendChild( link );
			list.appendChild( li );
		} );

		panel.appendChild( titleBar );
		panel.appendChild( list );
		sitemapEl.appendChild( panel );
		document.body.appendChild( sitemapEl );
		closeBtn.focus();
	},
	remove(): void {
		sitemapEl?.remove();
		sitemapEl = null;
	},
};

// ─── Screen reader ────────────────────────────────────────────────────────────

let ttsEnabled = false;

function ttsMouseOver( e: MouseEvent ): void {
	if ( ! ttsEnabled || ! window.speechSynthesis ) {return;}
	const text = ( e.target as HTMLElement ).textContent?.trim();
	if ( text ) {
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak( new SpeechSynthesisUtterance( text.slice( 0, 200 ) ) );
	}
}

const screenReaderFeature: FeatureImpl = {
	apply(): void {
		if ( ! window.speechSynthesis ) {return;}
		ttsEnabled = true;
		document.addEventListener( 'mouseover', ttsMouseOver );
	},
	remove(): void {
		ttsEnabled = false;
		window.speechSynthesis?.cancel();
		document.removeEventListener( 'mouseover', ttsMouseOver );
	},
};

// ─── Mute sounds ──────────────────────────────────────────────────────────────

const muteSoundsFeature: FeatureImpl = {
	apply(): void {
		document.querySelectorAll<HTMLMediaElement>( 'audio, video' ).forEach( ( el ) => {
			el.dataset.pnpnaMuted = el.muted ? '1' : '0';
			el.muted = true;
			el.pause();
		} );
	},
	remove(): void {
		document.querySelectorAll<HTMLMediaElement>( 'audio, video' ).forEach( ( el ) => {
			if ( el.dataset.pnpnaMuted === '0' ) {
				el.muted = false;
			}
		} );
	},
};

// ─── Feature map ──────────────────────────────────────────────────────────────

export const FEATURES: Record<FeatureKey, FeatureImpl> = {
	content_scaling:    contentScalingFeature,
	bigger_text:        steppedBodyClass( 'pnpna-bigger-text', 4 ),
	bigger_line_height: steppedBodyClass( 'pnpna-line-height', 4 ),
	letter_spacing:     steppedBodyClass( 'pnpna-letter-spacing', 4 ),
	text_align:         steppedBodyClass( 'pnpna-text-align', 3 ),
	readable_font:      toggleBodyClass( 'pnpna-readable-font' ),
	text_magnifier:     toggleBodyClass( 'pnpna-text-magnifier' ),
	highlight_links:    toggleBodyClass( 'pnpna-highlight-links' ),
	cursor:             cursorFeature,
	page_structure:     pageStructureFeature,
	screen_reader:      screenReaderFeature,
	reading_mask:       readingMaskFeature,
	sitemap:            sitemapFeature,
	hide_images:        toggleBodyClass( 'pnpna-hide-images' ),
	pause_animation:    toggleBodyClass( 'pnpna-pause-animations' ),
	mute_sounds:        muteSoundsFeature,
	reading_line:       readingLineFeature,
	outline_focus:      toggleBodyClass( 'pnpna-outline-focus' ),
	grey_scale:         toggleBodyClass( 'pnpna-greyscale' ),
	contrast:           toggleBodyClass( 'pnpna-high-contrast' ),
	invert_color:       toggleBodyClass( 'pnpna-invert-colors' ),
	brightness:         steppedBodyClass( 'pnpna-brightness', 3 ),
	saturation:         steppedBodyClass( 'pnpna-saturation', 3 ),
};

/**
 * Apply a feature at the given step (step 0 removes it).
 * @param key  Feature to apply.
 * @param step Step index (0 = off).
 */
export function applyFeature( key: FeatureKey, step: number ): void {
	const impl = FEATURES[ key ];

	if ( ! impl ) {
		return;
	}

	if ( step > 0 ) {
		impl.apply( step );
	} else {
		impl.remove();
	}
}

/**
 * Apply a whole map of features (used when restoring persisted state).
 * @param features Map of feature → step.
 */
export function applyFeatureMap( features: ActiveFeatureMap ): void {
	( Object.entries( features ) as [ FeatureKey, number ][] ).forEach( ( [ key, step ] ) => {
		applyFeature( key, step );
	} );
}

export function deactivateAll(): void {
	( Object.keys( FEATURES ) as FeatureKey[] ).forEach( ( key ) => {
		FEATURES[ key ].remove();
	} );
}
