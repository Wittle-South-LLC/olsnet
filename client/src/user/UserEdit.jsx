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
import { registerUser, editUserField } from '../state/user/userActions'
import { getUserPassword, isEmailValid, isUserNameValid, isPhoneValid, isPasswordValid, isUserValid } from '../state/user/user'
import { setMessage } from '../state/fetchStatus/fetchStatusActions'
import './Login.css'

export default class UserEdit extends React.Component {
  constructor (props, context) {
    super(props, context)

    // Called when ReCaptcha interaction is complete
    this.onVerifyCallback = this.onVerifyCallback.bind(this)

    // Called to check if input provided is valid
    this.validInput = this.validInput.bind(this)

    // Called when a field value changes
    this.onFieldChange = this.onFieldChange.bind(this)

    // Called when form submitted
    this.onSubmit = this.onSubmit.bind(this)

    // State for the password2 field is handled locally
    this.onPW2Change = this.onPW2Change.bind(this)

    this.state = {
      password2: undefined,
      passwordsMatch: false
    }

     // All text on the form needs to be internationalized
    this.componentText = defineMessages({
      olsSignupHeader: { id: 'UserEdit.olsSignupHeader', defaultMessage: 'Sign up for an OurLifeStories.net account' },
      olsSignupUsernameLabel: { id: 'UserEdit.olsSignupUsernameLabel', defaultMessage: 'Username:' },
      olsSignupUsernamePlaceholder: { id: 'UserEdit.olsSignupUsernamePlaceholder', defaultMessage: 'User Name...' },
      olsSignupEmailLabel: { id: 'UserEdit.olsSignupEmailLabel', defaultMessage: 'Email Address:' },
      olsSignupEmailPlaceholder: { id: 'UserEdit.olsSignupEmailPlaceholder', defaultMessage: 'email...' },
      olsSignupPassword1Label: { id: 'UserEdit.olsSignupPassword1Label', defaultMessage: 'Enter Password:' },
      olsSignupPassword1Placeholder: { id: 'UserEdit.olsSignupPassword1Placeholder', defaultMessage: 'At least 8 chars with a number and special character' },
      olsSignupPassword2Label: { id: 'UserEdit.olsSignupPassword2Label', defaultMessage: 'Repeat Password: ' },
      olsSignupPassword2Placeholder: { id: 'UserEdit.olsSignupPassword2Placeholder', defaultMessage: 'Repeat Password...' },
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

    // Initialize the ReCaptcha response to empty
    this.reCaptchaResponse = undefined
  }
  onPW2Change (e) {
    this.setState({
      password2: e.target.value,
      passwordsMatch: getUserPassword(this.props.user) === e.target.value
    })
  }
  onVerifyCallback (response) {
    this.reCaptchaResponse = response
  }
  onSubmit (e) {
    if (this.validInput() && this.reCaptchaResponse) {
      this.context.dispatch(registerUser(this.reCaptchaResponse, '/home/login'))
    } else {
      if (!this.reCaptchaResponse) {
        this.context.dispatch(setMessage(this.componentText.olsRecaptchaResponse, 'error'))
      }
    }
    e.preventDefault()
  }
  onFieldChange (e) {
    if (e.target.id !== 'password2') {
      this.context.dispatch(editUserField(e.target.id, e.target.value))
    }
    if (e.target.id == 'password') {
      this.setState({
        passwordsMatch: this.state.password2 === e.target.value
      })
    }
  }
  validInput () {
    if (!isUserNameValid(this.props.user)) { this.context.dispatch(setMessage(this.componentText.olsInvalidUserName, 'error')) }
    else if (!isEmailValid(this.props.user)) { this.context.dispatch(setMessage(this.componentText.olsInvalidEmail, 'error')) }
    else if (!isPhoneValid(this.props.user)) { this.context.dispatch(setMessage(this.componentText.olsInvalidPhone, 'error')) }
    return isUserValid(this.props.user) &&
           document.editUserForm.password.value === document.editUserForm.password2.value
  }
  render () {
    let formatMessage = this.context.intl.formatMessage
    return (
      <Row>
        <Col md={12}>
         <Form onSubmit={this.onSubmit} name='editUserForm'>
          <div className='panel panel-default'>
            <PanelHeader>
              <span className='panelTitle'>{formatMessage(this.componentText.olsSignupHeader)}</span>
              <span className='glyphicon glyphicon-save pull-right' onClick={this.onSubmit}></span>
            </PanelHeader>
            <div className='panel-body'>
              <Col md={6}>
                <FormGroup id='userNameFG' validationState={isUserNameValid(this.props.user) ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupUsernameLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='username'
                    placeholder={formatMessage(this.componentText.olsSignupUsernamePlaceholder)}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={isPasswordValid(this.props.user) ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupPassword1Label)}</ControlLabel>
                  <FormControl
                    type='password'
                    id='password'
                    placeholder={formatMessage(this.componentText.olsSignupPassword1Placeholder)}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={isEmailValid(this.props.user) ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupEmailLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='email'
                    placeholder={formatMessage(this.componentText.olsSignupEmailPlaceholder)}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={this.state.passwordsMatch ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupPassword2Label)}</ControlLabel>
                  <FormControl
                    type='password'
                    id='password2'
                    placeholder={formatMessage(this.componentText.olsSignupPassword2Placeholder)}
                    onChange={this.onPW2Change} />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup validationState={isPhoneValid(this.props.user) ? undefined : 'warning'}>
                  <ControlLabel>{formatMessage(this.componentText.olsSignupPhoneLabel)}</ControlLabel>
                  <FormControl
                    type='text'
                    id='phone'
                    placeholder={formatMessage(this.componentText.olsSignupPhonePlaceholder)}
                    onChange={this.onFieldChange}/>
                </FormGroup>
              </Col>
              <Col md={6}>
                <Recaptcha sitekey="6LcUlxgUAAAAAGN7uFzcRZBkhdqlh_kC-D-UtYm9"
                           render="explicit"
                           verifyCallback={this.onVerifyCallback} />
              </Col>
              <Col md={6}>
                <input type="submit" id="hiddenSubmit"/>
                <div className='loginInstructions'>{formatMessage(this.componentText.olsSignupInstructions)}</div>
              </Col>
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
  intl: intlShape
}
