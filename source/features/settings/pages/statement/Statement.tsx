/**
 * Accessibility Statement settings page.
 *
 * Either link an existing statement URL, or generate a new WordPress page
 * from company details via the REST createPage endpoint.
 * Supports searching and selecting existing pages.
 */

import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAppDispatch, useAppSelector } from '~/kernel/store/hooks';
import { updateSetting, selectSettings } from '~/features/settings/state/settingsSlice';
import { useCreatePageMutation, useGetPagesQuery } from '~/features/settings/api/settingsApi';
import SettingsField from '~/shared/molecules/SettingsField';
import { BlockStack, Description, InlineStack, Note, PageContainer, SelectBox } from '~/ui/molecules';
import { Button, Icon, Input, Text } from '~/ui/atoms';

interface GeneratorForm {
	company_name: string;
	company_website: string;
	business_email: string;
}

function buildStatementHtml( form: GeneratorForm ): string {
	const name = form.company_name;
	const website = form.company_website;
	const email = form.business_email;

	const paragraphs = [
		sprintf(
			/* translators: %s: company name */
			__( '%s is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.', 'ninja-accessibility' ),
			name
		),
		__( 'The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.', 'ninja-accessibility' ),
		sprintf(
			/* translators: %s: company website */
			__( 'We aim to make all pages and content on %s accessible, but some content may not yet fully meet the highest accessibility standards.', 'ninja-accessibility' ),
			website
		),
		sprintf(
			/* translators: 1: company name, 2: business email */
			__( 'We welcome your feedback on the accessibility of %1$s. Please let us know if you encounter accessibility barriers: %2$s. We try to respond to feedback within 3–5 business days.', 'ninja-accessibility' ),
			name,
			email
		),
	];

	return (
		`<h2>${ __( 'Conformance Status', 'ninja-accessibility' ) }</h2>` +
		paragraphs.map( ( p ) => `<p>${ p }</p>` ).join( '' )
	);
}

function StatementPreview( { form }: { form: GeneratorForm } ) {
	const name = form.company_name || '[Company Name]';
	const website = form.company_website || '[Company Website]';
	const email = form.business_email || '[Company Email]';

	return (
		<div className="pnpna-statement-preview">
			<h2>{ __( 'Accessibility Statement For', 'ninja-accessibility' ) } { website }</h2>
			<p>
				<strong>{ name }</strong>{ ' ' }
				{ __( 'is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.', 'ninja-accessibility' ) }
			</p>
			<p><strong>{ __( 'Conformance Status', 'ninja-accessibility' ) }</strong></p>
			<p>
				{ __( 'The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.', 'ninja-accessibility' ) }
			</p>
			<p><strong>{ __( 'Feedback', 'ninja-accessibility' ) }</strong></p>
			<p>
				{ __( 'We welcome your feedback on the accessibility of', 'ninja-accessibility' ) }{ ' ' }
				<strong>{ name }</strong>.{ ' ' }
				{ __( 'Please let us know if you encounter accessibility barriers on our website:', 'ninja-accessibility' ) }
			</p>
			<p>E-Mail: <strong>{ email }</strong></p>
		</div>
	);
}

export default function Statement() {
	const dispatch = useAppDispatch();
	const settings = useAppSelector( selectSettings );
	const [ createPage, { isLoading: creating } ] = useCreatePageMutation();
	const { data: pages = [] } = useGetPagesQuery();

	const [ showModal, setShowModal ] = useState( false );
	const [ showCreateNew, setShowCreateNew ] = useState( false );
	const [ createError, setCreateError ] = useState( '' );
	const [ selectedPageId, setSelectedPageId ] = useState<string>( '' );
	const [ form, setForm ] = useState<GeneratorForm>( {
		company_name: '',
		company_website: '',
		business_email: '',
	} );

	const existingUrl = String( settings.statement_url || '' );
	const existingPageId = String( settings.statement_page_id || '' );

	// Get the selected page URL
	const selectedPage = pages.find( ( p ) => String( p.value ) === selectedPageId );
	const selectedPageUrl = selectedPage?.label
		? window.location.origin + '/?p=' + selectedPageId
		: '';

	function setField( key: keyof GeneratorForm, val: string ) {
		setForm( ( prev ) => ( { ...prev, [ key ]: val } ) );
	}

	const formValid =
		form.company_name.trim() !== '' &&
		form.company_website.trim() !== '' &&
		form.business_email.trim() !== '';

	const handlePageSelect = ( pageId: string ) => {
		setSelectedPageId( pageId );
		const page = pages.find( ( p ) => String( p.value ) === pageId );
		if ( page ) {
			const pageUrl = window.location.origin + '/?p=' + pageId;
			dispatch( updateSetting( { key: 'statement_url', value: pageUrl } ) );
			dispatch( updateSetting( { key: 'statement_page_id', value: pageId } ) );
		}
	};

	const onCreate = async () => {
		if ( ! formValid ) {
			setCreateError( __( 'Please fill in all fields.', 'ninja-accessibility' ) );
			return;
		}

		setCreateError( '' );

		try {
			const page = await createPage( {
				title: __( 'Accessibility Statement', 'ninja-accessibility' ),
				content: buildStatementHtml( form ),
			} ).unwrap();

			dispatch( updateSetting( { key: 'statement_url', value: page.page_url } ) );
			dispatch( updateSetting( { key: 'statement_page_id', value: String( page.page_id ) } ) );
			setShowModal( false );
			setShowCreateNew( false );
		} catch {
			setCreateError( __( 'Could not create the page. Please try again.', 'ninja-accessibility' ) );
		}
	};

	return (
		<PageContainer compact style={ { margin: '0 auto' } }>
			<SettingsField
				title={ __( 'Accessibility Statement', 'ninja-accessibility' ) }
				description={ __( "Generate or link to a statement that reflects your site's commitment to accessibility and inclusivity.", 'ninja-accessibility' ) }
			>
				<BlockStack gap={ 20 }>
					<div className="pnpna-statement-cards">
						<button
							type="button"
							className={
								'pnpna-statement-card' +
								( ( ! existingUrl && ! showCreateNew ) || showCreateNew
									? ' pnpna-statement-card--active'
									: '' )
							}
							onClick={ () => {
								setShowCreateNew( true );
								setShowModal( true );
							} }
						>
							<div className="pnpna-statement-card__preview" aria-hidden="true">
								<div className="pnpna-statement-card__mock">
									<div className="pnpna-statement-card__mock-line pnpna-statement-card__mock-line--title" />
									<div className="pnpna-statement-card__mock-line" />
									<div className="pnpna-statement-card__mock-add">+</div>
								</div>
							</div>
							<span className="pnpna-statement-card__label">
								{ __( 'Yes I Need One', 'ninja-accessibility' ) }
							</span>
						</button>

						<button
							type="button"
							className={
								'pnpna-statement-card' +
								( existingUrl && ! showCreateNew
									? ' pnpna-statement-card--active'
									: '' )
							}
							onClick={ () => {
								setShowCreateNew( false );
							} }
						>
							<div className="pnpna-statement-card__preview" aria-hidden="true">
								<div className="pnpna-statement-card__mock">
									{ [ 0, 1, 2, 3, 4 ].map( ( i ) => (
										<div key={ i } className="pnpna-statement-card__mock-line" />
									) ) }
								</div>
							</div>
							<span className="pnpna-statement-card__label">
								{ __( 'No, I Already Have One', 'ninja-accessibility' ) }
							</span>
						</button>
					</div>

					{ /* Page Selection with Search */ }
					<BlockStack gap={ 10 }>
						<Text size="sm" weight="medium" color="gray-700">
							{ __( 'Select Existing Page', 'ninja-accessibility' ) }
						</Text>
						<Description
							text={ __( 'Search and select an existing page to use as your accessibility statement.', 'ninja-accessibility' ) }
						/>
						<SelectBox
							size="small"
							background="gray-50"
							searchable
							style={ { width: 320 } }
							placeholder={ __( 'Search for a page…', 'ninja-accessibility' ) }
							options={ pages.map( ( page ) => ( {
								value: String( page.value ),
								name: page.label,
							} ) ) }
							value={ selectedPageId ? [ selectedPageId ] : [] }
							onChange={ ( value ) => {
								if ( value.length > 0 ) {
									handlePageSelect( value[ 0 ] );
								}
							} }
						/>
						{ selectedPageUrl && (
							<Description
								text={ sprintf(
									/* translators: %s: page URL */
									__( 'Selected: %s', 'ninja-accessibility' ),
									selectedPageUrl
								) }
							/>
						) }
					</BlockStack>

					<InlineStack gap={ 10 } alignment="center">
						<div style={ { width: 1, height: 40, background: '#e5e7eb' } } />
						<Text size="sm" color="gray-500">{ __( 'or', 'ninja-accessibility' ) }</Text>
						<div style={ { width: 1, height: 40, background: '#e5e7eb' } } />
					</InlineStack>

					<InlineStack gap={ 10 } alignment="center">
						<Button
							variant="primary"
							startIcon="add"
							onClick={ () => {
								setShowCreateNew( true );
								setShowModal( true );
							} }
						>
							{ __( 'Create New Statement Page', 'ninja-accessibility' ) }
						</Button>
					</InlineStack>

					<BlockStack gap={ 10 }>
						<Input
							id="pnpna-statement-url"
							type="url"
							title={ __( 'Or enter URL manually', 'ninja-accessibility' ) }
							placeholder="https://example.com/accessibility"
							value={ existingUrl }
							onChange={ ( value ) => {
								dispatch( updateSetting( { key: 'statement_url', value: String( value ) } ) );
								dispatch( updateSetting( { key: 'statement_page_id', value: '' } ) );
							} }
						/>
						<Description
							text={ __( 'This link is shown in the widget footer so visitors can read your statement.', 'ninja-accessibility' ) }
						/>
					</BlockStack>
				</BlockStack>
			</SettingsField>

			{ showModal && showCreateNew && (
				<div
					className="pnpna-modal-overlay"
					role="dialog"
					aria-modal="true"
					aria-label={ __( 'Statement Generator', 'ninja-accessibility' ) }
				>
					<div className="pnpna-modal pnpna-top-level-wrapper">
						<div className="pnpna-modal__header">
							<span className="pnpna-modal__title">
								<Icon name="description" color="gray-700" />
								{ __( 'Statement Generator', 'ninja-accessibility' ) }
							</span>
							<button
								type="button"
								className="pnpna-modal__close"
								onClick={ () => {
									setShowModal( false );
									setShowCreateNew( false );
								} }
								aria-label={ __( 'Close', 'ninja-accessibility' ) }
							>
								<Icon name="close" color="gray-600" />
							</button>
						</div>

						<div className="pnpna-modal__body">
							<BlockStack gap={ 15 }>
								<BlockStack gap={ 5 }>
									<Text size="sm" weight="medium" color="gray-700">
										{ __( 'Company Information', 'ninja-accessibility' ) }
									</Text>
									<Description
										text={ __( 'Add your company name and details for use in the accessibility statement.', 'ninja-accessibility' ) }
									/>
								</BlockStack>

								<Input
									id="pnpna-co-name"
									title={ __( 'Company Name', 'ninja-accessibility' ) }
									placeholder="Example Inc."
									value={ form.company_name }
									onChange={ ( value ) => setField( 'company_name', String( value ) ) }
								/>
								<Input
									id="pnpna-co-web"
									type="url"
									title={ __( 'Company Website', 'ninja-accessibility' ) }
									placeholder="https://www.example.com/"
									value={ form.company_website }
									onChange={ ( value ) => setField( 'company_website', String( value ) ) }
								/>
								<Input
									id="pnpna-co-email"
									type="email"
									title={ __( 'Business Email', 'ninja-accessibility' ) }
									placeholder="contact@example.com"
									value={ form.business_email }
									onChange={ ( value ) => setField( 'business_email', String( value ) ) }
								/>

								{ createError && (
									<Note type="error">
										<Note.Normal>{ createError }</Note.Normal>
									</Note>
								) }
							</BlockStack>

							<BlockStack gap={ 10 }>
								<Text size="sm" weight="medium" color="gray-700">
									{ __( 'Preview Your Accessibility Statement', 'ninja-accessibility' ) }
								</Text>
								<StatementPreview form={ form } />
							</BlockStack>
						</div>

						<div className="pnpna-modal__footer">
							<InlineStack gap={ 10 }>
								<Button
									variant="outlined"
									onClick={ () => {
										setShowModal( false );
										setShowCreateNew( false );
									} }
								>
									{ __( 'Cancel', 'ninja-accessibility' ) }
								</Button>
								<Button
									variant="primary"
									startIcon="add"
									disabled={ creating || ! formValid }
									loading={ creating }
									onClick={ onCreate }
								>
									{ __( 'Create Statement & Page', 'ninja-accessibility' ) }
								</Button>
							</InlineStack>
						</div>
					</div>
				</div>
			) }
		</PageContainer>
	);
}
