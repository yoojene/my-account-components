import {
  Component,
  h,
  Event,
  EventEmitter,
  Element,
  Prop,
  State,
  Listen,
} from '@stencil/core';
import { HValidator, RequiredValueValidator } from '@pharam/h-web-components';
import { IAuthState, AuthService, AuthClient } from '../../utils/authService';
import Tunnel from '../../data/form';

@Component({
  tag: 'my-accountedit-personal',
  styleUrl: 'my-accountedit-personal.scss',
})
export class MyAccountEditPersonal {

  @Element() el: HTMLMyAccountEditPersonalElement;

  @Event() emailPermissionEvent: EventEmitter;
  @Event() cancelled: EventEmitter;

  @State() private authUser: IAuthState;

  /** Control loading indicator for step */
  @Prop() loading = false;

  /** Controls changeStep event and focuses to passed component */
  @Prop() stepToAutoLoad = '';

  // Temp holders for authService fields
  @State() givenName: string;
  @State() familyName: string;
  @State() email: string;
  @State() validatedHcp = false;

  /** Internal reference to the authService service. */
  private authService: AuthService = AuthClient.getService();

  // tslint:disable:variable-name
  @Prop() subscribed: boolean;

  /** Handle disabling of back button */
  @Prop() disableActionButton = false;

  /** Returns the value for a form variable - used by Tunnel */
  @Prop() getFormVariable: (key: string) => any;
  @Prop() setFormVariable: (key: string, value?: any) => void;

  /** Internal reference to  step */
  private _step: HTMLStepElement;

  @Listen('HEvent')
  async onHEvent(ev) {
    if (ev.detail.name  === 'HAcInputValueChange') {
      await this._step.validate();
    }
    if (
      ev.detail.name === 'Hac-checkboxSelect' ||
      ev.detail.name === 'Hac-checkboxUnselect'
    ) {
      if (ev.detail.meta[0].value === 'on') {
        this.subscribed = true;
      }

      if (ev.detail.meta[0].value === '') {
        this.subscribed = false;
      }
      this.emailPermissionEvent.emit({
        emailPermission_subscribed: this.subscribed,
      });
      this.setFormVariable('disableActionButton', false);
    }
  }

  /* tslint:disable cyclomatic-complexity */
  @Listen('changeStep', { target: 'window' })
  onChangeStepHandler(ev: any) {
    if (!this.stepToAutoLoad || ev.detail.action !== this.stepToAutoLoad) {
      return;
    }
    // Populate form with logged in user details
    this.authUser = this.authService.activeUser.getCurrentUser();

    if (this.authUser) {

      this.givenName = this.givenName || this.authUser.authRecord.givenName;
      this.familyName = this.familyName || this.authUser.authRecord.familyName;
      this.email = this.email || this.authUser.authRecord.email;

      this.validatedHcp = this.getFormVariable('hcpValidationStatus');
    }
  }
  /* tslint:enable cyclomatic-complexity */

  /** Returns a list of HValidators for the DEA License number */
  private getGivenNameValidators(): Array<HValidator<any>> {
    const validators: Array<HValidator<any>> = [];

    // Required value.
    validators.push(
      new RequiredValueValidator('Please enter your First Name.')
    );

    return validators;
  }

  /** Returns a list of HValidators for the DEA License number */
  private getFamilyNameValidators(): Array<HValidator<any>> {
    const validators: Array<HValidator<any>> = [];

    // Required value.
    validators.push(new RequiredValueValidator('Please enter your Last Name.'));

    return validators;
  }

  /** Clear field values */
  private clearFieldValues() {
    this.email = undefined;
    this.givenName = undefined;
    this.familyName = undefined;
  }

  onCancelledClick() {
    this.clearFieldValues();

    this.cancelled.emit();
  }

  render() {

    return (
      <AcStep
        id="editPersonalStep"
        name="editPersonal"
        stepTitle="Account"
        hideBackButton={true}
        action="editPersonal"
        actionText="Save Changes"
        loading={this.loading}
        ref={step => this._step = step}
      >
        <div class="edit-personal">
          <div class="edit-personal__container">
            <div class="edit-personal__title">Personal Information</div>
            <div class="edit-personal__form">
              <div class="edit-personal__form-field">
                <AcInput
                  id="givenName"
                  validators={this.getGivenNameValidators()}
                  name="givenName"
                  label="First name"
                  mask={/^[A-Za-z., -]{0,25}$/}
                  value={this.givenName}
                  disabled={this.validatedHcp}
                  required
                >
                  <icon slot="icon-start" icon="person"></icon>
                </AcInput>
              </div>
              <div class="edit-personal__form-field">
                <AcInput
                  id="familyName"
                  validators={this.getFamilyNameValidators()}
                  name="familyName"
                  label="Last name"
                  mask={/^[A-Za-z., -]{0,25}$/}
                  value={this.familyName}
                  disabled={this.validatedHcp}
                  required
                >
                  <icon slot="icon-start" icon="person"></icon>
                </AcInput>
              </div>
              <div class="edit-personal__form-field">
                <AcInput
                  type="email"
                  name="email"
                  label="Work email address"
                  value={this.email}
                  maxlength={100}
                  required
                >
                  <icon slot="icon-start" icon="email"></icon>
                </AcInput>
              </div>
            </div>
            <div class="edit-personal__legal-container">
              <AcCheckbox
                name="marketing_consent"
                checked={this.subscribed}
                required-asterix="false"
                checkbox-text="
                    I would like to receive professional marketing emails from pharma or authorized parties on its behalf about pharma products, programs, specialty areas, and services"
              ></AcCheckbox>
            </div>
          </div>
        </div>
        <a
          slot="afterFooter"
          class="edit-personal__tabs-cancel"
          href="#"
          onClick={() => this.onCancelledClick()}
        >
          Cancel
        </a>
      </AcStep>
    );
  }
}

Tunnel.injectProps(MyAccountEditPersonal, ['getFormVariable', 'setFormVariable']);
