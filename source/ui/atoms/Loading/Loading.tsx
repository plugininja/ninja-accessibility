import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

interface LoadingProps {
	size?: number;
	className?: string;
}

export const Loading = ( { size = 32, className = '' }: LoadingProps ) => (
	<span
		className={ clsx( 'pn-loading', className ) }
		role="status"
		aria-label={ __( 'Loading', 'ninja-accessibility' ) }
		style={ { width: size, height: size } }
	>
		<svg viewBox="0 0 50 50" aria-hidden="true">
			<circle
				cx="25"
				cy="25"
				r="20"
				fill="none"
				stroke="currentColor"
				strokeWidth="5"
				strokeLinecap="round"
				strokeDasharray="90 150"
			>
				<animateTransform
					attributeName="transform"
					type="rotate"
					from="0 25 25"
					to="360 25 25"
					dur="0.9s"
					repeatCount="indefinite"
				/>
			</circle>
		</svg>
	</span>
);

export default Loading;
