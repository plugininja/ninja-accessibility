import { __ } from '@wordpress/i18n';
import LogoIcon from './LogoIcon';

const Logo = () => (
	<span className="pnpna-logo" aria-label={ __( 'Ninja Accessibility', 'ninja-accessibility' ) }>
		<LogoIcon />
	</span>
);

export default Logo;
