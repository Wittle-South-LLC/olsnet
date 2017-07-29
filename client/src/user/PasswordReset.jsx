/* PasswordReset.jsx - Used for changing user data 
 *
 * This page is independent of redux state, because there is no reason to persist
 * anything from this page there.
 */

import React from 'react'
import PropTypes from 'prop-types'
import fetch from 'isomorphic-fetch'
import { Col, ControlLabel, Form, FormControl, FormGroup, Row } from 'react-bootstrap'
import PanelHeader from '../components/PanelHeader'
import { intlShape, defineMessages } from 'react-intl'
import { emailTest, passwordTest } from '../state/user/user'
import { setMessage } from '../state/fetchStatus/fetchStatusActions'
import { getApiHeaders } from '../state/fetchStatus/fetchStatusActions'
import './Login.css'

export default class PasswordReset extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.state = {
      email: '',
      resetCode: '',
      password: '',
      password2: '',
      resetCodeRequested: false
    }

    this.fetchData = this.fetchData.bind(this) // Fetches data as needed
    this.fetchResetCode = this.fetchResetCode.bind(this) // Fetches reset code
    this.fetchNewPassword = this.fetchNewPassword.bind(this) // Fetches new password
    this.isEmailValid = this.isEmailValid.bind(this) // Tests if email is valid
    this.onFieldChange = this.onFieldChange.bind(this) // Handles changes in field values
    this.validInput = this.validInput.bind(this) // Validates that input is valid before actions
    this.onGetResetCode = this.onGetResetCode.bind(this) // Handles button click to get reset code
    this.onResetPassword = this.onResetPassword.bind(this) // Handles reset password request

    this.componentText = defineMessages({
      passwordResetHeader: { id: 'PasswordReset.passwordResetHeader', defaultMessage: 'Reset your password here' },
      emailLabel: { id: 'PasswordReset.emailLabel', defaultMessage: 'Email address for account' },
      emailPlaceholder: { id: 'PasswordReset.emailPlaceholder', defaultMessage: 'Enter email address...' },
      passwordLabel: { id: 'PasswordReset.passwordLabel', defaultMessage: 'New Password:' },
      passwordPlaceholder: { id: 'PasswordReset.passwordPlaceholder', defaultMessage: 'Enter new password...' },
      resetCodeLabel: { id: 'PasswordReset.resetCodeLabel', defaultMessage: 'Reset Code:' },
      resetCodePlaceholder: { id: 'PasswordReset.resetCodePlaceholder', defaultMessage: 'Enter reset code...' },
      password2Label: { id: 'PasswordReset.password2Label', defaultMessage: 'Repeat New Password:' },
      password2Placeholder: { id: 'PasswordReset.password2Placeholder', defaultMessage: 'Enter new password...' },
      invalidPassword: { id: 'PasswordReset.invalidPassword', defaultMessage: 'Password does not match requirements' },
      invalidEmail: { id: 'PasswordReset.invalidEmail', defaultMessage: 'Email address must be valid' },
      invalidResetCode: { id: 'PasswordReset.invalidResetCode', defaultMessage: 'Reset code is not a 6 digit number' },
      passwordMismatch: { id: 'PasswordReset.passwordMismatch', defaultMessage: 'New passwords do not match' },
      fetchError: { id: 'PasswordReset.fetchError', defaultMessage: 'Error communicating with server' },
      passwordReset: { id: 'PasswordReset.passwordReset', defaultMessage: 'Password reset successfully.' }
    })
  }
  fetchData (payload) {
    // The following is a hack so that we can use relative paths for APIs
    // fetch takes relative paths when executing in the browser (where window
    // is guaranteed to be defined), and requires absolute paths when running
    // in node.js server environments, which is where our tests run. If you
    // change how baseUrl is done for tests, you need to fix the TEST_URL
    // definition in bin/testme as well
    let _self = this
    let baseUrl = (typeof window === 'undefined' ||
                   (typeof navigator !== 'undefined' &&
                    navigator.userAgent === 'node.js')) ? 'http://localhost:' + process.env.WEBSERVER_HOST_PORT : ''
    return fetch(baseUrl + process.env.API_PATH + payload.apiUrl, getApiHeaders(payload))
      .then(response => {
        if (response.ok) {
          return response.json
        } else {
          throw 'Error: ' + response.status_code 
        }
      })
      .then(json => {
        if (_self.state.resetCodeRequested) {
          _self.context.dispatch(setMessage(_self.componentText.passwordReset, 'status'), '/home')
          _self.context.router.history.push('/home')
        } else {
          _self.setState({
            resetCodeRequested: true
          })
        }
      })
      .catch(error => _self.context.dispatch(setMessage(_self.componentText.fetchError, 'error')))
  }
  fetchResetCode (e) {
    let payload = {
      apiUrl: '/pw_reset',
      method: 'POST',
      sendData: {
        email: this.state.email
      }
    }
    this.fetchData(payload)
  }
  fetchNewPassword (e) {
    let payload = {
      apiUrl: '/pw_reset',
      method: 'PUT',
      sendData: {
        email: this.state.email,
        password: this.state.password,
        reset_code: this.state.resetCode
      }
    }
    this.fetchData(payload)
  }
  isEmailValid (e) {
    return emailTest.test(this.state.email)
  }
  isPasswordValid (e) {
    return passwordTest.test(this.state.password)
  }
  isPassword2Valid (e) {
    return this.state.password === this.state.password2
  }
  isResetCodeValid (e) {
    return this.state.resetCode.length === 6 && !isNaN(this.state.resetCode)
  }
  onFieldChange (e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  onGetResetCode (e) {
    e.preventDefault()
    if (this.validInput()) {
      this.fetchResetCode()
    }
  }
  onResetPassword (e) {
    e.preventDefault()
    if (this.validInput()) {
      this.fetchNewPassword()
    }
  
  }
  validInput () {
    if (!this.isEmailValid()) {
      this.context.dispatch(setMessage(this.context.intl.formatMessage(this.componentText.invalidEmail), 'error'))
    } else if (this.state.resetCodeRequested) {
      if (!this.isPasswordValid()) {
        this.context.dispatch(setMessage(this.context.intl.formatMessage(this.componentText.invalidPassword), 'error'))
      } else if (this.state.password !== this.state.password2) {
        this.context.dispatch(setMessage(this.context.intl.formatMessage(this.componentText.passwordMismatch), 'error'))
      } else if (!this.isResetCodeValid()) {
        this.context.dispatch(setMessage(this.context.intl.formatMessage(this.componentText.invalidResetCode), 'error'))
      }
    }
    return this.state.resetCodeRequested
      ? this.isEmailValid() && this.isPasswordValid() && this.isPassword2Valid()
      : this.isEmailValid()
  }
  render () {
    // Shorthand for internationalization functions for readability
    let formatMessage = this.context.intl.formatMessage
    const ctxt = this.componentText
    return (
      <Row>
        <Col md={12}>
          <Form onSubmit={this.state.resetCodeRequested ? this.onResetPassword : this.onGetResetCode}
                name='resetPasswordForm'>
            <div className='panel panel-default'>
              <PanelHeader>
                <span className='panelTitle'>{formatMessage(ctxt.passwordResetHeader)}</span>
                <span className='glyphicon glyphicon-save pull-right' 
                      onClick={this.state.resetCodeRequested ? this.onResetPassword : this.onGetResetCode}></span>
              </PanelHeader>
              <div className='panel-body'>
                <Col md={6}>
                  <FormGroup id='emailFG' validationState={this.isEmailValid() ? undefined : 'warning'}>
                    <ControlLabel>{formatMessage(ctxt.emailLabel)}</ControlLabel>
                    <FormControl
                      type='text'
                      id='email'
                      placeholder={formatMessage(ctxt.emailPlaceholder)}
                      value={this.state.email}
                      onChange={this.onFieldChange}/>
                  </FormGroup>
                </Col>
                { this.state.resetCodeRequested &&
                  <Col md={6}>
                    <FormGroup validationState={this.isPasswordValid() ? undefined : 'warning'}>
                      <ControlLabel>{formatMessage(ctxt.passwordLabel)}</ControlLabel>
                      <FormControl
                        type='password'
                        id='password'
                        placeholder={formatMessage(ctxt.passwordPlaceholder)}
                        onChange={this.onFieldChange} />
                    </FormGroup>
                  </Col>
                }
                { this.state.resetCodeRequested &&
                  <Col md={6}>
                    <FormGroup id='resetCodeFG' validationState={this.isResetCodeValid() ? undefined : 'warning'}>
                      <ControlLabel>{formatMessage(ctxt.resetCodeLabel)}</ControlLabel>
                      <FormControl
                        type='text'
                        id='resetCode'
                        placeholder={formatMessage(ctxt.resetCodePlaceholder)}
                        value={this.state.resetCode}
                        onChange={this.onFieldChange}/>
                    </FormGroup>
                  </Col>
                }
                { this.state.resetCodeRequested &&
                  <Col md={6}>
                    <FormGroup validationState={this.isPassword2Valid() ? undefined : 'warning'}>
                      <ControlLabel>{formatMessage(ctxt.password2Label)}</ControlLabel>
                      <FormControl
                        type='password'
                        id='password2'
                        placeholder={formatMessage(ctxt.password2Placeholder)}
                        onChange={this.onFieldChange}/>
                    </FormGroup>
                  </Col>
                }
              <input type="submit" id="hiddenSubmit"/>
              </div>
            </div>
          </Form>
        </Col>
      </Row>      
    )
  }
}

PasswordReset.contextTypes = {
  dispatch: PropTypes.func,
  intl: intlShape,
  router: PropTypes.object
}
