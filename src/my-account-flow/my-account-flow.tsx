import {
  Component,
  Event,
  h,
  Method,
  Listen,
  State,
  EventEmitter,
  Element,
} from '@stencil/core';
import { AuthService, AuthClient, IAuthState, IChangePasswordConfig } from '../../utils/authService';
import { HFormRegistration, HEventPayload } from '@pharma/H-web-components';
import { RegisteredFormComponent } from '../../interfaces/registered-form-component';
import { StateVariable } from '../../interfaces/state-variable';
import Tunnel, {State as tunnelState} from '../../data/form';
import { useTunnelDataEffect } from '../../hooks/tunnel-data-effect';
import { FlowElement } from '../../interfaces/flow-element';
import { professionalDesignationList } from '../../utils/us/us-professional-designations';
import { SelectListItem } from '../../interfaces/select-list-item';

@Component({
  tag: 'my-account-flow',
  styleUrl: 'my-account-flow.scss',
  shadow: true,
})
export class MyAccountFlow implements FlowElement {

  /** The host element */
  @Element() el: HTMLMyAccountFlowElement;

  /** Events */
  @Event({ bubbles: true }) public HEvent: EventEmitter<HEventPayload>;
  @Event() closeModal: EventEmitter;
  @State() private data: Map<string, RegisteredFormComponent> = new Map();
  @State() private variables: Map<string, StateVariable> = new Map();

  /** Events to handle flow start and completion */
  @Event({ bubbles: true }) FlowStarted: EventEmitter;
  @Event({ bubbles: true }) FlowCompleted: EventEmitter;

  /** Non-validated message if license information cannot be verified */
  private _nonValidatedMsg = `Unfortunately, we were unable to verify the license information you provided.
  To access resources offered exclusively to verified healthcare professionals,
  including sample ordering (subject to availability and eligibility),
  please update your Last Name and/or license information, or call us at <a href="tel:1-800-505-4426">1-800-505-4426</a> for further assistance.`;

  private _userHasBecomeValidatedMessage = `We have verified your license information.
  You now have full access to pharma professional resources,
  including <a href='/request-samples' target='_blank'>sample ordering</a> (subject to availability and eligibility).`;

  // tunnel data for form
  public tunnelData: tunnelState;

  // authService/ fields
  // tslint:disable: variable-name
  @State() private license_number;
  @State() private issuing_authority;
  @State() private designation;
  @State() private specialty;
  @State() private streetName;
  @State() private municipality;
  @State() private state;
  @State() private postalCode;

  @State() private authUser: IAuthState;
  @State() titleFullName;
  @State() email: string;
  // tslint:disable-next-line:variable-name
  @State() emailPermission_subscribed: boolean;
  @State() validatedHcp = false;
  @State() disableActionButton = false;

  /** Internal reference to the Step Controller. */
  private _stepController: HTMLStepControllerElement;
  /** Internal reference to the Edit Personal component. */
  private _editPersonal: HTMLMyAccountEditPersonalElement;
  /** Internal reference to the Edit Professional component. */
  private _editProfessional: HTMLMyAccountEditProfessionalElement;
  /** Internal reference to the Edit Password component. */
  private _editPassword: HTMLMyAccountPasswordElement;
  /** Internal reference to the authService service. */
  private authService: AuthService = AuthClient.getService();
  /** Keeps track of server hcp statuses */
  private _hcpStatuses = {
    notValidated: 'notvalidated',
    pending: 'pending',
    validated: 'validated'
  };

  /** Listens to a cancelled call */
  @Listen('cancelled')
  cancelledHandler() {
    this.tunnelData.setFormVariable('disableActionButton', false);
    this.cancelClickedHandler();
  }

  /** Listens to a close flow call */
  @Listen('closeFlow')
  closeFlowHandler() {
    this.close();
  }

  /** Listen for a change in email permission */
  @Listen('emailPermissionEvent')
  emailPermissionHandler(ev) {
    this.emailPermission_subscribed = ev.detail.emailPermission_subscribed;
  }

  @Listen('unlockForEditing')
  async unlockForEditingHandler() {
    this.tunnelData.setFormVariable('disableActionButton', false);
    await this._stepController.clearNotificatiuons();
  }

  /** Handles when a user progresses a step */
  @Listen('progressStep')
  progressStepHandler(event) {
    enum editComponents {
      editPersonal = 'editPersonal',
      editProfessional = 'editProfessional',
      editPassword = 'editPassword',
    }

    const action = event.detail.action;

    // Edit Personal
    if (action === editComponents.editPersonal) {
      const fields = {
        givenName: this.getFormComponentValue('givenName'),
        familyName: this.getFormComponentValue('familyName'),
        email: this.getFormComponentValue('email'),
        emailPermission_subscribed: this.emailPermission_subscribed ? 'true' : 'false'
      };
      this._callauthUpdateProfile(this._editPersonal, fields);
    }

    // Edit Professional
    if (action === editComponents.editProfessional) {
      const designationSpecialty = {
        designation_name: this.getFormComponentValue('designation_name'),
        designation_specialty: this.getFormComponentValue(
          'designation_specialty'
        ),
      };

      // see if the designation requires a license
      this._setLicenseDetails();

      // TODO need to include SLN or DEA check and fields
      const license = {
        license_number: this.license_number,
        issuing_authority: this.issuing_authority,
      };

      const mailingAddress = {
        mailingAddress_streetName1: this.getFormComponentValue(
          'mailingAddress_streetName1'
        ),
        mailingAddress_municipality: this.getFormComponentValue(
          'mailingAddress_municipality'
        ),
        mailingAddress_administrativeArea: this.getFormComponentValue(
          'mailingAddress_administrativeArea'
        ),
        mailingAddress_postalCode: this.getFormComponentValue(
          'mailingAddress_postalCode'
        ),
      };

      const fields = { ...designationSpecialty, ...mailingAddress, ...license };

      this._callauthUpdateProfile(this._editProfessional, fields);
    }

    // Change Password
    if (action === editComponents.editPassword) {
      this.editPassword();
    }
  }

  /** Listen for a change in license validation state change */
  @Listen('isValidLicense')
  isValidLicenseHandler(ev) {
    if (ev.detail && !ev.detail.isValid) {
      this.showLicenseNotValidMessage();
    }
  }

  /**
   * Set the license details from the available fields.
   */
  private _setLicenseDetails(): void {
    let licenseNumber = '';
    let licenseType = '';
    if (this.designationRequiresLicense()) {
      licenseNumber = this.getFormComponentValue('hcpId');
      const info = this.data.get('hcpId');
      licenseType = info.element.type;
    }
    this.license_number = licenseNumber;
    this.issuing_authority = licenseType;
  }

  /** Closes the flow */
  @Method()
  public async close() {
    this.FlowCompleted.emit();
  }

  async componentDidLoad() {
    this._stepController = this.el.shadowRoot.querySelector(
      '#myAccountStepCtrl'
    );

    this.FlowStarted.emit();

    this.authUser = this.authService.activeUser.getCurrentUser();

    if (!this.authUser) {
      this.close();

      return;
    }

    this.email = this.authUser.authRecord.email;
    this.titleFullName = `${this.authUser.authRecord.givenName} ${this.authUser.authRecord.familyName}`;
    this.emailPermission_subscribed = this.getSubscribedValue(this.authUser.authRecord);
    this.designation = this.authUser.authRecord.designation.name;
    this.specialty = this.authUser.authRecord.designation.specialty;
    this.license_number = this.authUser.authRecord.license.number;

    this.issuing_authority = this.authUser.authRecord.license.issuingAuthority;

    this.streetName = this.authUser.authRecord.mailingAddress.streetName1;
    this.municipality = this.authUser.authRecord.mailingAddress.municipality;
    this.state = this.authUser.authRecord.mailingAddress.administrativeArea;
    this.postalCode = this.authUser.authRecord.mailingAddress.postalCode;

    this.setHcpValidationStatus(this.authUser.authRecord);
    if (this.authUser.authRecord.hcpValidation.status === this._hcpStatuses.pending) {
      this.showLicenseNotValidMessage();
    }
    this.tunnelData.setFormVariable('disableActionButton', false);
  }

  /** Called when a license fails a validation check */
  showLicenseNotValidMessage() {
    this._stepController.dispatchEvent(
      new CustomEvent('Notification', {
        detail: {
          type: 'error',
          message: this._nonValidatedMsg,
        },
      })
    );
  }

  /**
  * Show/hide the validation message, check SelectListItem
  * Doc ref 24/5 24/6
  */
  private designationRequiresLicense(): boolean {
    const requiresLicense = professionalDesignationList.some((des: SelectListItem) => (des.label === this.getFormComponentValue('designation_name') && des.filter));

    return requiresLicense;
  }

  // TODO: Check this
  private emitHEvent(name: string): void {
    const payload = new HEventPayload();
    payload.name = name;
    payload.path = ['AccountFlow'];
    payload.meta = [
      {
        name: 'my-account-flow',
      },
    ];
    this.HEvent.emit(payload);
  }

  /** Function to call when a user changes their password */
  /* tslint:enable:cyclomatic-complexity */
  async editPassword() {

    this._callauthChangePassword(this._editPassword);

    this.emitHEvent('MyAccountFlowInitiated');
  }

  /** Event handler for H loaded event */
  @Listen('HLoaded')
  protected async HLoadedHandler(event) {
    // Take the first in the path because shadowDom causes the target to be remapped.
    const propagationPath = event.propagationPath();
    const element = propagationPath[0];

    const info: RegisteredFormComponent = {
      element,
      registration: event.detail as HFormRegistration,
    };
    this.addFormComponent(info);
  }

  /**
  * Toggle between DEA and SLN fields
  */
  private showDeaNumber(): boolean {

    return this.issuing_authority === 'DEA' ? true : false;
  }

  /** Asyncronouse call to update a users password */
  private async _callauthChangePassword(component: any) {
    component.loading = true;

    const internalData: any = {
      currentPassword: this.getFormComponentValue('oldPassword'),
      newPassword: this.getFormComponentValue('_password_input'),
    };

    const _passwordConfig: IChangePasswordConfig = {
      passwordFieldName: 'newpassword',
      requiresExistingPassword: true,
      oldPasswordFieldName: 'oldpassword',
      // Note this is US Specific.
      formName: 'newPasswordFormProfile',
    };

    await this.authService.auth.changePassword(
      internalData.newPassword,
      internalData.currentPassword,
      _passwordConfig
    )
    .then(() => this.displayPostServerFeedback(component, 'change_password'))
    .catch(err => this.showError(component, err));
  }

  /** Asyncronouse call to update a users profile */
  private async _callauthUpdateProfile(component: any, fields: any) {
    component.loading = true;
    const previousHcpValidationStatus = this.authUser.authRecord.hcpValidation.status;
    this.authService.auth
      .updateProfile(fields)
      .then(async (res) => {
        // below two lines of code should be removed when update_profile tracks internal user state
        const exUser = await this.authService.activeUser.getCurrentUser();
        this.authService.activeUser.setUser({...exUser, ...{authRecord: res}});
        // reassign the authenticated user
        this.authUser = {...this.authUser, ...{authRecord: res}};
        // update the new validation status
        this.setHcpValidationStatus(this.authUser.authRecord);
        // check if a user has become validated
        const userHasBecomeValidated = this.userHasBecomeValidated(previousHcpValidationStatus);

        this.email = res.email;
        this.titleFullName = `${res.givenName} ${res.familyName}`;
        this.emailPermission_subscribed = this.getSubscribedValue(this.authUser.authRecord);

        this.designation = res.designation.name;
        this.specialty = res.designation.specialty;
        this.license_number = res.license.number;
        this.issuing_authority = res.license.issuingAuthority;

        this.streetName = res.mailingAddress.streetName1;
        this.municipality = res.mailingAddress.municipality;
        this.state = res.mailingAddress.administrativeArea;
        this.postalCode = res.mailingAddress.postalCode;

        return userHasBecomeValidated;
      })
      .then(userHasBecomeValidated => this.displayPostServerFeedback(component, 'update_profile', userHasBecomeValidated))
      .catch(err => this.showError(component, err));
  }

  /** Determines if a user has just become validated */
  private userHasBecomeValidated(previousHcpValidationStatus: string) {
    if (
      (previousHcpValidationStatus === this._hcpStatuses.notValidated ||
      previousHcpValidationStatus === this._hcpStatuses.pending) &&
      this.tunnelData.getFormVariable('hcpValidationStatus')
    ) {
      return true;
    } else {
      return false;
    }
  }

  /** Sets the HCP validation status in the state */
  private setHcpValidationStatus(authRecord) {
    authRecord.hcpValidation.status === this._hcpStatuses.notValidated ||
    authRecord.hcpValidation.status === this._hcpStatuses.pending
      ? (this.validatedHcp = false)
      : (this.validatedHcp = true);
    this.tunnelData.setFormVariable('hcpValidationStatus', this.validatedHcp);
  }

  /** Display post server feeedback to the user */
  private displayPostServerFeedback(component: any, type: string, userHasBecomeValidated?: boolean) {
    let message = '';
    switch(type) {
      case 'update_profile':
        message = userHasBecomeValidated ?
          `Your changes have been saved.<br/>${this._userHasBecomeValidatedMessage}` :
          'Your changes have been saved.';
      break;
      case 'change_password':
        message = 'Your password has been updated.';
        break;
      default:
    }
    component.loading = false;
    this._stepController.dispatchEvent(
      new CustomEvent('Notification', {
        detail: {
          type: 'success',
          message
        },
      })
    );
    if (type === 'change_password') {
      this._editPassword.clear();
    }
  }

  /** Show server error */
  private showError(component, err) {
    // tslint:disable-next-line:no-console
    console.error(err);
    const apiMessage = AuthClient.getErrorMessage(err);
    this._stepController.dispatchEvent(
      new CustomEvent('Notification', {
        detail: {
          type: 'error',
          message: apiMessage || 'An error occurred. Please try again later.',
        },
      })
    );
    component.loading = false;
    this.tunnelData.setFormVariable('disableActionButton', false);
  }

  /** Called when a user chooses to edit personal information */
  private editPersonalClickedHandler() {
    this._stepController.goToStep('editPersonal', true);
  }

  /** Called when a user chooses to edit professional information */
  private editProfClickedHandler() {
    this._stepController.goToStep('editProfessional', true);
  }

  /** Called when a user chooses to edit password information */
  private editPasswordClickHandler() {
    this._stepController.goToStep('editPassword', true);
  }

  /** Handles a cancel click */
  private cancelClickedHandler() {
    this.emailPermission_subscribed = this.getSubscribedValue(this.authUser.authRecord);
    this._stepController.goToStep('account');
  }

  /** Checks authService email subscription value and returns the response as a boolean */
  private getSubscribedValue(authRecord): boolean {
    return authRecord.emailPermission.subscribed === 'true' ? true : false;
  }

  /** Adds a form component to the tunnel state */
  private addFormComponent = (component: RegisteredFormComponent) => {
    if (component.element.name) {
      this.data.set(component.element.name, component);
    } else {
      // tslint:disable-next-line
      console.info(
        'Component registration attempted without name attribute, skipped.'
      );
    }
  }

  /** Gets a form component from the tunnel state */
  private getFormComponent = (component: string) => {
    return this.data.get(component);
  }

  /** Gets a form value from the tunnel state */
  public getFormComponentValue = (componentName: string): string => {
    const _element = this.getFormComponent(componentName);

    return _element && _element.element ? _element.element.value : '';
  }

  /** Renders the read-only personal information page */
  private renderPersonalInformation() {
    return <div class="my-account__tabs" data-tab="Personal">
      <a
        class="my-account__tabs-edit"
        href="#"
        onClick={() => this.editPersonalClickedHandler()}
      >
        Edit
      </a>
      <div class="my-account__tabs-section">
        <div class="my-account__tabs-title">
          Registered email address
        </div>
        <div class="my-account__tabs-item-text">
          {this.email}
        </div>
      </div>
      <div class="my-account__tabs-section">
        <div class="my-account__tabs-title">Name</div>
        <div class="my-account__tabs-item-text">
          {this.titleFullName}
        </div>
      </div>
      <div class="my-account__tabs-title">
        I would like to receive professional marketing emails
        from pharma or authorized parties on its behalf about
        pharma products, programs, specialty areas, and services
      </div>
      {this.emailPermission_subscribed ? (
        <div>Yes</div>
      ) : (
        <div>No</div>
      )}
    </div>;
  }

  /** Renders license information in read only mode */
  private renderLicenseInformation() {
    return (<div class="my-account__tabs-section">
      <div class="my-account__tabs-title">
        Licence information
      </div>
      <div class="my-account__tabs-subtitle">
        DEA Number
      </div>
      <div class="my-account__tabs-license-item-text">
        {this.showDeaNumber() && this.license_number && this.license_number !== '' ? this.license_number : '-'}
      </div>
      <div class="my-account__tabs-subtitle">
        SLN (State Licence Number)
      </div>
      <div class="my-account__tabs-license-item-text">
        {!this.showDeaNumber() && this.license_number && this.license_number !== '' ? this.license_number : '-'}
      </div>
      <div class="my-account__tabs-subtitle">
        Licence State
      </div>
      <div class="my-account__tabs-item-text">
        {!this.showDeaNumber() && this.issuing_authority && this.issuing_authority !== '' ? this.issuing_authority : '-'}
      </div>
    </div>);
  }

  /** Render address information in read only mode */
  private renderAddressInformation() {
    return (<div class="my-account__tabs-section">
      <div class="my-account__address-tabs-title">
        Office Address
      </div>
      <div class="my-account__tabs-subtitle">Address</div>
      <div class="my-account__address-item-text">
        {this.streetName}
      </div>
      <div class="my-account__address-item-text">
        {this.municipality}
      </div>
      <div class="my-account__address-item-text">
        {this.postalCode}
      </div>
      <div class="my-account__address-item-text">
        {this.state}
      </div>
    </div>);
  }

  /** Renders professional information in read only mode */
  private renderProfessionalInformation() {
    return <div class="my-account__tabs" data-tab="Professional">
      {!this.validatedHcp ? (<a
        class="my-account__tabs-edit"
        href="#"
        onClick={() => this.editProfClickedHandler()}
      >
        Edit
      </a>) : ('')}
      <div class="my-account__tabs-section">
        <div class="my-account__tabs-title">
          Professional information
        </div>
        <div class="my-account__tabs-subtitle">
          Professional designation
        </div>
        <div class="my-account__tabs-item-text">
          {this.designation}
        </div>
        <div class="my-account__tabs-subtitle">
          Specialty
        </div>
        <div class="my-account__tabs-item-text">
          {this.specialty}
        </div>
      </div>
      {this.renderLicenseInformation()}
      {this.renderAddressInformation()}
    </div>;
  }

  /** Renders the read-only password information page */
  private renderPasswordInformation() {
    return <div class="my-account__tabs" data-tab="Password">
      <a
        class="my-account__tabs-edit"
        href="#"
        onClick={() => this.editPasswordClickHandler()}
      >
        Edit
      </a>
      <div class="my-account__tabs-section">
        <div class="my-account__tabs-title">Password</div>
        <div class="my-account__tabs-item-text">
          &#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;
        </div>
      </div>
    </div>;
  }

  render() {
    this.tunnelData = useTunnelDataEffect(this.data, this.variables);

    return (
      <Tunnel.Provider state={this.tunnelData}>
        <div class="my-account-flow">
          <step-controller
            id="myAccountStepCtrl"
            startingStep="account"
            hasStepIndicator={false}
            hasHeader={true}
            ref={step => (this._stepController = step)}
          >
            <step
              name="account"
              action="account"
              stepTitle="Account"
              hideBackButton={true}
              hideFooter
            >
              <div class="my-account">
                <tab-controller>
                  <div slot="pages">
                    {this.renderPersonalInformation()}
                    {this.renderProfessionalInformation()}
                    {this.renderPasswordInformation()}
                  </div>
                </tab-controller>
              </div>
            </step>
            <my-account-edit-personal
              subscribed={this.emailPermission_subscribed}
              step-to-auto-load="editPersonal"
              ref={per => (this._editPersonal = per)}
            ></my-account-edit-personal>
            <my-account-edit-professional
              step-to-auto-load="editProfessional"
              ref={prof => (this._editProfessional = prof)}
            ></my-account-edit-professional>
            <my-account-password
              step-to-auto-load="editPassword"
              ref={prof => (this._editPassword = prof)}
              > </my-account-password>
          </step-controller>
        </div>
      </Tunnel.Provider>
    );
  }
}
