import { Component, h, Event, EventEmitter, Listen, Prop, State } from '@stencil/core';
import { statesList } from '../../utils/us/us-states';
import { professionalDesignationList } from '../../utils/us/us-professional-designations';
import { specialityList } from '../../utils/us/us-specialities';
import { IAuthState, AuthService, AuthClient } from '../../utils/authService';
import { HValidator } from '@pharma/H-web-components';
import { SelectListItem } from '../../interfaces/select-list-item';
import Tunnel from '../../data/form';

@Component({
  tag: 'my-account-edit-professional',
  styleUrl: 'my-account-edit-professional.scss',
})
export class MyAccountEditProfessional {

  /** Events */
  @Event() cancelled: EventEmitter;

  /** Control loading indicator for step */
  @Prop() loading = false;

  /** Whether the step auto loads */
  @Prop() stepToAutoLoad = '';

  // Temp holders for authService fields
  // tslint:disable: variable-name
  @State() designation_name: string;
  @State() designation_specialty: string;
  @State() license_number: string;
  @State() issuing_authority: string;
  @State() mailingAddress_streetName1: string;
  @State() mailingAddress_municipality: string;
  @State() mailingAddress_administrativeArea: string;
  @State() mailingAddress_postalCode: string;
  @State() familyName: string;

  @State() authUser: IAuthState;

  /** Reference to the confirm input-password. */
  private _inputLicense: HTMLUsInputLicenseElement;
  /** Internal reference to the authService service. */
  private _auth: AuthService = AuthClient.getService();

  /** Returns the value for a form variable - used by Tunnel */
  @Prop() getFormVariable: (key: string) => any;

  componentWillLoad() {
    this.setData();
  }

  /** Listener for value changed H event */
  @Listen('HEvent')
  async ValueChangeHandler(ev) {
    const event = ev.detail;

    console.log('HEvent edit prof');
    console.log(event);
    // We want to repopulate the fields everytime the step is displayed.
    if (event.name === 'StepShow' && event.meta[0] === 'editProfessional') {
      this.setData();
    }

    if (event.name !== 'HSelectChange' && event.meta[0].name !== 'designation_name') {
      return;
    }

    if (event.name === 'HSelectChange' && event.meta[0].name === 'designation_name') {
      this.designation_name = event.meta[0].value;
      const licenseRequired = this.designationRequiresLicense(this.designation_name);
      if (!licenseRequired) {
        this._inputLicense.disabled = true;

        return;
      }
      this._inputLicense.disabled = false;
    }
  }

  /** Show/Hide the cancel link */
  showCancelLink(): boolean {
    if (!this.getFormVariable('hcpValidationStatus')) {
      return true;
    }

    return false;
  }

  /** Clear field values */
  private clearFieldValues() {
    this.designation_name = '';
    this.designation_specialty = '';
    this.license_number = undefined;
    this.issuing_authority = undefined;
    this.mailingAddress_streetName1 = undefined;
    this.mailingAddress_municipality = undefined;
    this.mailingAddress_administrativeArea = '';
    this.mailingAddress_postalCode = undefined;
    this.familyName = undefined;
  }

  /** Called when a user cancels */
  onCancelledClick() {
    this.clearFieldValues();

    this.cancelled.emit();
  }

  private setData() {
    // Populate form with logged in user details
    this.authUser = this._auth.activeUser.getCurrentUser();
    if (this.authUser) {
      this.designation_name = this.authUser.authRecord.designation.name;
      this.designation_specialty = this.authUser.authRecord.designation.specialty;
      this.license_number = this.authUser.authRecord.license.number;
      this.issuing_authority = this.authUser.authRecord.license.issuingAuthority;
      this.mailingAddress_streetName1 = this.authUser.authRecord.mailingAddress.streetName1;
      this.mailingAddress_municipality = this.authUser.authRecord.mailingAddress.municipality;
      this.mailingAddress_administrativeArea = this.authUser.authRecord.mailingAddress.administrativeArea;
      this.mailingAddress_postalCode = this.authUser.authRecord.mailingAddress.postalCode;
      this.familyName = this.authUser.authRecord.familyName;
    }
  }

  /**
    * Disable the DEA/SLN and Issuing Authority fields, check SelectListItem
    * Doc ref 25/2 25/3
    */
   private designationRequiresLicense(designation): boolean {
    return professionalDesignationList.some((des: SelectListItem) => (des.label === designation && des.filter));
  }

  /** Builds validators */
  private _buildValidators(
    error: string,
    pattern: RegExp = /^\S[^\r\n\t\f\v]*$/
  ) {
    const validators: Array<HValidator<any>> = [];

    validators.push({
      triggerAutomatically: true,
      isValid: false,
      validate: async val => {
        return pattern.test(val);
      },
      getErrorMessage() {
        return error;
      },
    });

    return validators;
  }

  /** Builds the Zip code validator */
  private _zipValidators(error: string, pattern: RegExp = /^[\d]{5}$/) {
    const validators: Array<HValidator<any>> = [];

    validators.push({
      triggerAutomatically: true,
      isValid: false,
      validate: async val => {
        return pattern.test(val);
      },
      getErrorMessage() {
        return error;
      },
    });

    return validators;
  }

  /** Function to render professional information */
  private renderProfessionalInformation() {

    return (
      <div>
        <div class="edit-professional__title">
          Professional Information
        </div>
        <div class="edit-professional__designation-form-field">
          <select
            options={professionalDesignationList}
            name="designation_name"
            prompt="Professional designation"
            class="select-double-margin"
            value={this.designation_name}
            required
          >
            <icon slot="icon" icon="work"></icon>
          </select>
        </div>
        <div class="edit-professional__specialty-state-form-field">
          <select
            options={specialityList}
            name="designation_specialty"
            prompt="Specialty"
            value={this.designation_specialty}
            required
          >
            <icon slot="icon" icon="star"></icon>
          </select>
        </div>
      </div>
    );
  }

  /** Function to render license information */
  private renderLicenseInformation() {
    return (
      <div>
        <div class="edit-professional__title">
          License Information
        </div>
        <us-input-license
          name="hcpId"
          ref={inputLicense => this._inputLicense = inputLicense}
          value={this.license_number}
          type={this.issuing_authority}
          familyName={this.familyName}
          disabled={!this.designationRequiresLicense(this.designation_name)}
        >
        </us-input-license>
        <div class="edit-professional__title">Office Address</div>
        <input
          name="mailingAddress_streetName1"
          label="Office Street Address"
          value={this.mailingAddress_streetName1}
          validators={this._buildValidators(
            'Please enter a valid Office street address.'
          )}
          maxlength={50}
          mask={/^\S/}
          required
        >
          <icon slot="icon-start" icon="place"></icon>
        </input>
        <input
          name="mailingAddress_municipality"
          label="City"
          value={this.mailingAddress_municipality}
          validators={this._buildValidators('Please enter a valid city.')}
          maxlength={50}
          mask={/^\S/}
          required
        >
          <icon slot="icon-start" icon="place"></icon>
        </input>
        <select
          options={statesList}
          name="mailingAddress_administrativeArea"
          prompt="State"
          emptyOption="Select a state"
          value={this.mailingAddress_administrativeArea}
          required
        >
          <icon slot="icon" icon="map"></icon>
        </select>
        <input
          name="mailingAddress_postalCode"
          label="Zip Code"
          value={this.mailingAddress_postalCode}
          mask="00000"
          validators={this._zipValidators(
            'Please enter a valid 5-digit zip code.'
          )}
          required
        >
          <icon slot="icon-start" icon="map"></icon>
        </input>
      </div>
    );
  }

  render() {

    return (
      <step
        name="editProfessional"
        stepTitle="Account"
        hideBackButton={true}
        action="editProfessional"
        actionText="Save Changes"
        loading={this.loading}
      >
        <div class="edit-professional">
          <div class="edit-professional__container">
            <div class="edit-professional__form">
              {this.renderProfessionalInformation()}
              {this.renderLicenseInformation()}
            </div>
          </div>
        </div>
        {this.showCancelLink() ? (
          <a
            slot="afterFooter"
            class="edit-professional__tabs-cancel"
            href="#"
            onClick={() => this.onCancelledClick()}
          >
            Cancel
          </a>
        ) : (
          ''
        )}
      </step>
    );
  }
}

Tunnel.injectProps(MyAccountEditProfessional, ['getFormVariable']);
