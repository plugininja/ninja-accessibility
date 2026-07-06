/**
 * Utility types (subset of ninja-drive's kernel utility types).
 */

/** A union that also accepts any other value of the base type. */
export type LooseLiteral<T extends string | number> = T | ( string & {} );
