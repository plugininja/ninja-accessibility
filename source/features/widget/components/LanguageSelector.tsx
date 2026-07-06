/**
 * Visitor-facing language dropdown with flag images.
 *
 * The selected language is persisted in localStorage (pnpna_language) and
 * applied instantly — no page reload required.
 */

import { useRef, useState } from '@wordpress/element';
import languages, { LanguageKey } from '~/features/widget/i18n/languages';

interface Props {
	selected: LanguageKey;
	onChange: ( language: LanguageKey ) => void;
}

export default function LanguageSelector( { selected, onChange }: Props ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const wrapperRef = useRef<HTMLDivElement>( null );

	const assetsUrl = window.pnpna?.assetsUrl || '';
	const flagUrl = ( key: string ) => `${ assetsUrl }/images/flags/${ key }.png`;

	const validSelected: LanguageKey = languages[ selected ]
		? selected
		: ( Object.keys( languages )[ 0 ] as LanguageKey );
	const selectedLanguage = languages[ validSelected ];

	const handleChange = ( key: LanguageKey ) => {
		onChange( key );
		setIsOpen( false );
	};

	return (
		<div
			ref={ wrapperRef }
			className="pnpna-lang"
			onBlur={ ( e ) => {
				if ( ! wrapperRef.current?.contains( e.relatedTarget as Node ) ) {
					setIsOpen( false );
				}
			} }
		>
			<button
				type="button"
				className="pnpna-lang__button"
				aria-haspopup="listbox"
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ! isOpen ) }
			>
				<img
					className="pnpna-lang__flag"
					src={ flagUrl( validSelected ) }
					alt=""
					aria-hidden="true"
				/>
				<span className="pnpna-lang__label">{ selectedLanguage.label }</span>
				<span className="material-symbols-outlined pnpna-lang__caret" aria-hidden="true">
					expand_more
				</span>
			</button>

			{ isOpen && (
				<ul className="pnpna-lang__dropdown" role="listbox">
					{ ( Object.entries( languages ) as [ LanguageKey, ( typeof languages )[ LanguageKey ] ][] ).map(
						( [ key, { label } ] ) => (
							<li
								key={ key }
								role="option"
								aria-selected={ key === validSelected }
								className={ key === validSelected ? 'pnpna-lang__item--selected' : '' }
							>
								<button type="button" onClick={ () => handleChange( key ) }>
									<img className="pnpna-lang__flag" src={ flagUrl( key ) } alt="" aria-hidden="true" />
									<span className="pnpna-lang__label">{ label }</span>
								</button>
							</li>
						)
					) }
				</ul>
			) }
		</div>
	);
}
