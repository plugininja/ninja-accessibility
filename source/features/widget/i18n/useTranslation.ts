/**
 * Runtime translation hook for the frontend widget.
 *
 * Unlike `__()` (locked to the site locale at render time), the widget lets
 * each visitor pick their own language, so translations are resolved from
 * the bundled languages map. Lookup order: selected language → English → key.
 */

import { useWidgetSelector } from '~/kernel/store/hooks';
import { selectLanguage } from '~/features/widget/state/widgetSlice';
import languages, { LanguageKey } from './languages';

export type Translator = ( key: string ) => string;

export function translate( lang: LanguageKey, key: string ): string {
	return (
		languages[ lang ]?.translations[ key ] ||
		languages.en.translations[ key ] ||
		key
	);
}

export default function useTranslation(): Translator {
	const lang = useWidgetSelector( selectLanguage );
	return ( key: string ) => translate( lang, key );
}
