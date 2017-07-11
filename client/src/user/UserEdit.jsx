/* UserEdix.jsx - Used for changing user data 
 *
 * This page operates in the following modes:
 * register - For new user signup, shows reCaptcha, does not show roles
 * edit - For editing current user data
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Col, ControlLabel, Form, FormControl, FormGroup, Row } from 'react-bootstrap'
import PanelHeader from '../components/PanelHeader'
import { intlShape, defineMessages } from 'react-intl'
var Recaptcha = require('react-recaptcha')
import { registerUser, editUserField, updateUser } from '../state/user/userActions'
import { setMessage } from '../state/fetchStatus/fetchStatusActions'
import './Login.css'

export default class UserEdit extends React.Component {
  constructor (props, context) {
    super(props, context)

    // Called when ReCaptcha interaction is complete
    this.onVerifyCallback = this.onVerifyCallback.bind(this)
    this.onloadCallback = this.onloadCallback.bind(this)

    // Called to check if input provided is valid
    this.validInput = this.validInput.bind(this)

    // Called when a field value changes
    this.onFieldChange = this.onFieldChange.bind(this)

    // Called when form submitted
    this.onSubmit = this.onSubmit.bind(this)

    // State for the password2 field is handled locally
    this.onPW2Change = this.onPW2Change.bind(this)
    this.onNewPW2Change = this.onNewPW2Change.bind(this)

    // Check if we're in edit mode (alternative is register mode)
    this.isEditMode = this.isEditMode.bind(this)

    this.state = {
      password2: undefined,
      passwordsMatch: false,
      newPassword2: undefined,
      newPasswordsMatch: true
    }

     // All text on the form needs to be internationalized
    this.componentText = defineMessages({
      olsSignupHeader: { id: 'UserEdit.olsSignupHeader', defaultMessage: 'Sign up for an OurLifeStories.net account' },
      olsEditUserHeader: { id: 'UserEdit.olsEditUserHeader', defaultMessage: 'Edit your information here' },
      olsSignupUsernameLabel: { id: 'UserEdit.olsSignupUsernameLabel', defaultMessage: 'Username:' },
      olsSignupUsernamePlaceholder: { id: 'UserEdit.olsSignupUsernamePlaceholder', defaultMessage: 'User Name...' },
      olsSignupEmailLabel: { id: 'UserEdit.olsSignupEmailLabel', defaultMessage: 'Email Address:' },
      olsSignupEmailPlaceholder: { id: 'UserEdit.olsSignupEmailPlaceholder', defaultMessage: 'email...' },
      olsSignupPassword1Label: { id: 'UserEdit.olsSignupPassword1Label', defaultMessage: 'Enter Password:' },
      olsEditPasswordLabel: { id: 'UserEdit.olsEditPasswordLabel', defaultMessage: 'Current password:' },
      olsSignupPassword1Placeholder: { id: 'UserEdit.olsSignupPassword1Placeholder', defaultMessage: 'At least 8 chars with a number and special character' },
      olsEditPasswordPlaceholder: { id: 'UserEdit.olsEditPasswordPlaceholcer', defaultMessage: 'Enter your current password...' },
      olsSignupPassword2Label: { id: 'UserEdit.olsSignupPassword2Label', defaultMessage: 'Repeat Password: ' },
      olsSignupPassword2Placeholder: { id: 'UserEdit.olsSignupPassword2Placeholder', defaultMessage: 'Repeat Password...' },
      olsEditPassword2Label: { id: 'UserEdit.olsEditPassword2Label', defaultMessage: 'Repeat New Password: ' },
      olsEditPassword2Placeholder: { id: 'UserEdit.olsEditPassword2Placeholder', defaultMessage: 'Repeat new password...' },
      olsSignupNewPasswordLabel: { id: 'UserEdit.olsSignupNewPasswordLabel', defaultMessage: 'New Password:' },
      olsSignupPhoneLabel: { id: 'UserEdit.olsSignupPhoneLabel', defaultMessage: 'Phone Number: ' },
      olsSignupPhonePlaceholder: { id: 'UserEdit.olsSignupPhonePlaceholder', defaultMessage: '(numbers only no spaces)...' },
      olsSignupInstructions: { id: 'UserEdit.olsSignupInstructions', defaultMessage: 'Please create a username and password' },
      olsInvalidUserName: { id: 'UserEdit.olsUserEditUsername', defaultMessage: 'User name must be at least 4 characters long and no more than 32 characters' },
      olsInvalidEmail: { id: 'UserEdit.olsInvalidEmail', defaultMessage: 'Invalid email address' },
      olsInvalidPhone: { id: 'UserEdit.olsInvalidPhone', defaultMessage: 'Invalid phone number' },
      olsRecaptchaResponse: { id: 'UserEdit.recaptchaResponse', defaultMessage: 'Must complete robot (recaptcha) test to register' },
      olsPasswordMismatch: { id: 'UserEdit.passwordMismatch', defaultMessage: 'Passwords do not match' },
      olsPasswordFormat: {
        id: 'UserEdit.passwordFormat',
        defaultMessage: 'Password must be at least 8 characters, and include both a number and a special character'
      }
    })
  }
  isEditMode () {
    return window.location.pathname === '/user'
  }
  onPW2Change (e) {
    this.setState({
      password2: e.target.value,
      passwordsMatch: this.props.user.getUserPassword() === e.target.value
    })
  }
  onNewPW2Change (e) {
    this.setState({
      newPassword2: e.target.value,
      newPasswordsMatch: this.props.user.getNewPassword() === e.target.value
    })
  }
  onloadCallback () {
    // All new users start with the role 'User'
    this.context.dispatch(editUserField('roles', 'User'))
  }
  onVerifyCallback (response) {
    this.context.dispatch(editUserField('reCaptchaResponse', response))
  }
  onSubmit (e) {
    if (this.validInput()) {
      if (this.isEditMode()) {
        this.context.dispatch(updateUser('/home'))
      } else {
        this.context.dispatch(registerUser('/home/login'))
      }
    } else {
      console.log('UserEdit form not valid on submit')
    }
    e.preventDefault()
  }
  onFieldChange (e) {
    this.context.dispatch(editUserField(e.target.id, e.target.value))
    if (e.target.id == 'password') {
      this.setState({
        passwordsMatch: this.state.password2 === e.target.value,
      })
    } else if (e.target.id == 'newPassword') {
      this.setState({
        newPasswordsMatch: this.state.newPassword2 === e.target.value
      })
    }
  }
  validInput () {
    if (!this.props.user.isUserNameValid()) { this.context.dispatch(setMessage(this.componentText.olsInvalidUserName, 'error')) }
    else if (!this.props.user.isEmailValid()) { this.context.dispatch(setMessage(this.componentText.olsInvalidEmail, 'error')) }
    else if (!this.props.user.isPhoneValid()) { this.context.dispatch(setMessage(this.componentText.olsInvalidPhone, 'error')) }
    else if (!this.isEditMode() && !this.props.user.isReCaptchaResponseValid()) { this.context.dispatch(setMessage(this.componentText.olsRecaptchaResponse, 'error')) }
    if (this.isEditMode()) {
      return this.props.user.isEditUserValid() &&
             document.editUserForm.newPassword.value === document.editUserForm.password2.value
    } else {
      return this.props.user.isNewUserValid() &&
             document.editUserForm.password.value === document.editUserForm.password2.value
    }
  }
  render () {
    let formatMessage = this.context.intl.formatMessage
    // Function to conditionally return argument based on current path
    const ifs = (u, s) => this.isEditMode() ? u : s
    // Shorthand for componentText to make the render code more readable
    const ctxt = this.componentText
    return (
      <Row>
        <Col md={12}>
         <Form onSubmit={this.onSubmit} name='editUserForm'>
          <div className='panel panel-default'>
            <PanelHeader>
              <span className='panelTitle'>{formatMessage(ifs(ctxt.olsEditUserHeader, ctxt.olsSignupHeader))}</span>
              <span className='glyphicon glyphicon-save pull-right' onClick={this.onSubmit}></span>
            </PanelHeader>
            <div className='panel-body'>
              <Col md={6}>
                <FormGroup id='userNameFG' validationState={this.props.user.isUserNameValid() ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(ctxt.olsSignupUsernameLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='username'
                    placeholder={formatMessage(ctxt.olsSignupUsernamePlaceholder)}
                    value={this.props.user.getUserName()}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={this.props.user.isPasswordValid() ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(ifs(ctxt.olsEditPasswordLabel, ctxt.olsSignupPassword1Label))}</ControlLabel>
                  <FormControl
                    type='password'
                    id='password'
                    placeholder={formatMessage(ifs(ctxt.olsEditPasswordPlaceholder, ctxt.olsSignupPassword1Placeholder))}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={this.props.user.isEmailValid() ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupEmailLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='email'
                    placeholder={formatMessage(this.componentText.olsSignupEmailPlaceholder)}
                    value={this.props.user.getUserEmail()}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                {ifs(
                  <FormGroup validationState={this.props.user.isNewPasswordValid() ? undefined : 'warning'}>
                    <ControlLabel>{formatMessage(ctxt.olsSignupNewPasswordLabel)}</ControlLabel>
                    <FormControl
                      type='password'
                      id='newPassword'
                      placeholder={formatMessage(ctxt.olsSignupPassword1Placeholder)}
                      onChange={this.onFieldChange}/>
                  </FormGroup>,
                  <FormGroup validationState={this.state.passwordsMatch ? undefined : 'warning'}>
                    <ControlLabel>{formatMessage(this.componentText.olsSignupPassword2Label)}</ControlLabel>
                    <FormControl
                      type='password'
                      id='password2'
                      placeholder={formatMessage(this.componentText.olsSignupPassword2Placeholder)}
                      onChange={this.onPW2Change} />
                  </FormGroup>
                )}
              </Col>
              <Col md={6}>
                <FormGroup validationState={this.props.user.isPhoneValid() ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupPhoneLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='phone'
                    placeholder={formatMessage(this.componentText.olsSignupPhonePlaceholder)}
                    value={this.props.user.getUserPhone()}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                {ifs(
                  <FormGroup validationState={this.state.newPasswordsMatch ? undefined : 'warning'}>
                    <ControlLabel>{formatMessage(ctxt.olsEditPassword2Label)}</ControlLabel>
                    <FormControl
                      type='password'
                      id='password2'
                      placeholder={formatMessage(ctxt.olsEditPassword2Placeholder)}
                      onChange={this.onNewPW2Change} />
                  </FormGroup>,
                  <Recaptcha sitekey="6LcUlxgUAAAAAGN7uFzcRZBkhdqlh_kC-D-UtYm9"
                             render="explicit"
                             onloadCallback={this.onloadCallback}
                             verifyCallback={this.onVerifyCallback} />
                )}
              </Col>
              {ifs(<div />,
                <Col md={6}>
                  <div className='loginInstructions'>{formatMessage(this.componentText.olsSignupInstructions)}</div>
                </Col>
              )}
              <input type="submit" id="hiddenSubmit"/>
            </div>
          </div>
         </Form>
        </Col>
      </Row>
    )
  }
}

UserEdit.contextTypes = {
  dispatch: PropTypes.func,
  router: PropTypes.object,
  intl: intlShape
}
