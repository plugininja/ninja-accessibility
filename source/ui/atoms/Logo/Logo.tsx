import { __ } from '@wordpress/i18n';
import LogoIcon from './LogoIcon';

const Logo = () => (
	<span className="pnpna-logo" aria-label={ __( 'Ninja Accessibility', 'ninja-accessibility' ) }>
		<LogoIcon />
		<span className="pnpna-logo__text">
			{ __( 'Ninja', 'ninja-accessibility' ) }{ ' ' }
			<strong>{ __( 'Accessibility', 'ninja-accessibility' ) }</strong>
		</span>
	</span>
);

export default Logo;
