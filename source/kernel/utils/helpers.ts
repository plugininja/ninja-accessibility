/**
 * Generic helpers (subset of ninja-drive's kernel helpers).
 */

export function isValidArray<T = unknown>( value: unknown ): value is T[] {
	return Array.isArray( value ) && value.length > 0;
}

export function trimString( value: string ): string {
	return value ? value.trim() : '';
}
