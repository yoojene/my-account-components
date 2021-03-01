import { Component, State, h, Listen, Prop, Event, EventEmitter, Method } from '@stencil/core';
import { hEventPayload } from '@pharma/h-web-components';

@Component({
 tag: 'my-account-password',
 styleUrl: 'my-account-password.scss',
})
export class MyAccountPassword{

  /** Control loading indicator for step */
  @Prop() loading = false;

  /** Events */
  @Event() editClicked: EventEmitter;
  @Event({ bubbles: true }) public hEvent: EventEmitter<hEventPayload>;
  @State() newPassword: string;
  @State() currentPassword: string;
  @Event() cancelled: EventEmitter;

  /** Controls changeStep event and focuses to passed component */
  @Prop() stepToAutoLoad = '';

  /** Listens for a change in step */
  @Listen('changeStep', { target: 'window' })
  onChangeStepHandler(ev: any) {
    if (!this.stepToAutoLoad || ev.detail.action !== this.stepToAutoLoad) {
      return;
    }
  }

  @Method()
  async clear() {
    this._currentPasswordField.clear();
    this._Password.clear();
  }

  /** Whether password fields are required. */
  private _isRequired = true;
  /** References for password components */
  private _Password: HTMLPasswordElement;
  private _currentPasswordField: HTMLInputPasswordElement;

  /** Handles the form when cancel cta is clicked */
  async onCancelledClick() {
    await this.clear();

    this.cancelled.emit();
  }

  render() {
    return (
      <step
        name="editPassword"
        stepTitle="Account"
        hideBackButton={true}
        action="editPassword"
        actionText="Save Changes"
        id="editPasswordStep"
        loading={this.loading}
      >
        <div class="my-account">
          <div class="my-account__title">
            Choose a new password
            </div>
          We need this information to keep your account secure.
            <div class="my-account__title">
            <input-password
              name="oldPassword"
              class="password__initial--pwd"
              label="Current password"
              required={this._isRequired}
              ref={currentPasswordField => this._currentPasswordField = currentPasswordField}
              value={this.currentPassword}
              notValidMessage=""
            />
            <password
              ref={Password => this._Password = Password}
              name="_password_input"
              value={this.newPassword}
            ></password>
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
      </step>
    );
  }
}
