import { CSS_VAR } from '~/kernel/types/tokens';

const LogoIcon = () => (
	<svg
		className="pnpna-logo-icon"
		width="36"
		height="36"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<rect width="24" height="24" rx="6" fill={ `var(${ CSS_VAR.PRIMARY })` } />
		<path
			fill="#ffffff"
			d="M12 4.75a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Zm6 3.35c.41 0 .75.34.75.75s-.34.75-.75.75l-3.9.6c-.28.05-.45.2-.45.5 0 1.9.35 3.35.9 4.95l.86 2.4a.75.75 0 0 1-1.41.52L12.6 15.5c-.1-.3-.26-.45-.6-.45s-.5.15-.6.45l-1.4 3.12a.75.75 0 0 1-1.41-.52l.86-2.4c.55-1.6.9-3.05.9-4.95 0-.3-.17-.45-.45-.5l-3.9-.6a.75.75 0 0 1 0-1.5c1.87.34 3.9.6 6 .6s4.13-.26 6-.6Z"
		/>
	</svg>
);

export default LogoIcon;
