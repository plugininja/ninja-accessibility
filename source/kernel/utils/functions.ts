/**
 * Small shared runtime helpers (subset of ninja-drive's kernel utils).
 */

export const toBoolean = ( val: boolean | string | number | undefined | null ) =>
	val === true || val === 'true' || val === '1' || val === 1;

/**
 * Convert a hex colour (#abc or #aabbcc) to HSL. Lightness is 0–100.
 *
 * Accessiy parity — used to decide when the widget glyph needs to flip
 * to a dark colour on light backgrounds.
 */
export function hexToHSL( hex: string | undefined | null ): { h: number; s: number; l: number } {
	if ( ! hex || typeof hex !== 'string' ) {
		return { h: 0, s: 0, l: 0 };
	}

	let value = hex.replace( '#', '' );

	if ( 3 === value.length ) {
		value = value
			.split( '' )
			.map( ( c ) => c + c )
			.join( '' );
	}

	if ( 6 !== value.length || /[^0-9a-f]/i.test( value ) ) {
		return { h: 0, s: 0, l: 0 };
	}

	const r = parseInt( value.substring( 0, 2 ), 16 ) / 255;
	const g = parseInt( value.substring( 2, 4 ), 16 ) / 255;
	const b = parseInt( value.substring( 4, 6 ), 16 ) / 255;

	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );
	const l = ( max + min ) / 2;

	let h = 0;
	let s = 0;

	if ( max !== min ) {
		const d = max - min;
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );

		switch ( max ) {
			case r:
				h = ( g - b ) / d + ( g < b ? 6 : 0 );
				break;
			case g:
				h = ( b - r ) / d + 2;
				break;
			default:
				h = ( r - g ) / d + 4;
		}

		h /= 6;
	}

	return {
		h: Math.round( h * 360 ),
		s: Math.round( s * 100 ),
		l: Math.round( l * 100 ),
	};
}

/**
 * True when a background colour is light enough (~80% white, lightness ≥ 70)
 * that a white glyph on top of it would be unreadable.
 *
 * Same threshold as Accessiy's `ccpa-darker-icon` and the PHP side
 * (`App\Display::resolve_primary_color()`).
 */
export const isLightColor = ( hex: string | undefined | null ): boolean =>
	hexToHSL( hex ).l >= 70;
