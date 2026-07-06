/**
 * Small shared runtime helpers (subset of ninja-drive's kernel utils).
 */

export const toBoolean = ( val: boolean | string | number | undefined | null ) =>
	val === true || val === 'true' || val === '1' || val === 1;
