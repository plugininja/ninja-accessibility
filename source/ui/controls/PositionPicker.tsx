import type { IconPosition } from '~/kernel/types/settings';

type Cell = [ IconPosition | 'left' | 'center' | 'right', string | null ];

const POSITIONS: Cell[] = [
	[ 'top-left', '↖' ],    [ 'top-center', '↑' ],    [ 'top-right', '↗' ],
	[ 'left', null ],         [ 'center', null ],         [ 'right', null ],
	[ 'bottom-left', '↙' ], [ 'bottom-center', '↓' ], [ 'bottom-right', '↘' ],
];

const VALID: Set<string> = new Set( [
	'top-left', 'top-center', 'top-right',
	'bottom-left', 'bottom-center', 'bottom-right',
] );

interface Props {
	value: string;
	onChange: ( pos: IconPosition ) => void;
}

export default function PositionPicker( { value, onChange }: Props ) {
	return (
		<div className="pnpna-position-grid" role="radiogroup" aria-label="Widget position">
			{ POSITIONS.map( ( [ pos, symbol ] ) => {
				const isValid  = VALID.has( pos );
				const isActive = value === pos;

				if ( ! isValid ) {
					return (
						<div key={ pos } className="pnpna-position-grid__cell pnpna-position-grid__cell--center" aria-hidden="true" />
					);
				}

				return (
					<button
						key={ pos }
						type="button"
						role="radio"
						aria-checked={ isActive }
						className={ 'pnpna-position-grid__cell' + ( isActive ? ' pnpna-position-grid__cell--active' : '' ) }
						title={ pos }
						aria-label={ pos }
						onClick={ () => onChange( pos as IconPosition ) }
					>
						{ isActive ? <span className="pnpna-position-grid__dot" /> : symbol }
					</button>
				);
			} ) }
		</div>
	);
}
