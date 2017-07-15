/* Login.jsx - Implements login page */
import React from 'react'
import PropTypes from 'prop-types'
import { Col, ControlLabel, Form, FormControl, Panel, Row } from 'react-bootstrap'
import { intlShape, defineMessages } from 'react-intl'
import PanelHeader from '../components/PanelHeader'
import { editUserField, loginFacebook, loginUser } from '../state/user/userActions'
import './Login.css'

export default class Login extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      fbAuthenticated: false
    }
    this.handleFacebookAuth = this.handleFacebookAuth.bind(this)
    this.onFBCheck = this.onFBCheck.bind(this)
    this.loginUser = this.loginUser.bind(this)
    this.onFieldChange = this.onFieldChange.bind(this)
    this.componentText = defineMessages({
      pageName: { id: 'Login.pageName', defaultMessage: 'Continue with Facebook' },
      userNameLabel: { id: 'Login.loginPrompt', defaultMessage: 'User Name' },
      userNamePlaceholder: { id: 'Login.userNamePlaceholder', defaultMessage: 'User name...' },
      pwdLabel: { id: 'Login.pwdLabel', defaultMessage: 'Password:' },
      pwdPlaceholder: { id: 'Login.pwdPlaceholder', defaultMessage: 'Password...' },
      loginButtonLabel: { id: 'Login.loginButtonLabel', defaultMessage: 'Sign In!' },
      olsLoginHeader: { id: 'Login.olsLoginHeader', defaultMessage: 'Log in with Our Life Stories account' },
      olsLoginInstructions: {
        id: 'Login.olsLoginInstructions',
        defaultMessage: 'If you already have an OurLifeStories.net account, please enter your username and password. Otherwise, click the Register link in the upper right hand corner of the page.'
      },
      fbLoginHeader: { id: 'Login.fbLoginHeader', defaultMessage: 'Continue with Facebook' }
    })
  }
  // Test coverage should ignore callbacks triggered by Facebook code
  /* istanbul ignore next */
  handleFacebookAuth (response) {
    if (response.status === 'connected') {
      this.setState({fbAuthenticated: true})
      this.context.dispatch(loginFacebook(response.authResponse.accessToken, '/home'))
    } else if (response.status === 'not_authorized') {
      console.log('Not authorized')
    } else {
      console.log(`Facebook response.status = ${response.status}`, response)
      FB.login(this.handleFacebookAuth)
    }
  }
  // Test coverage should ignore callbacks triggered by Facebook code
  /* istanbul ignore next */
  onFBCheck (e) {
    FB.init({
      appId: '323284451372735',
      version: 'v2.8'
    })
    FB.getLoginStatus(this.handleFacebookAuth)
  }
  loginUser (e) {
    this.context.dispatch(loginUser('/home'))
    e.preventDefault()
  }
  onFieldChange (e) {
    this.context.dispatch(editUserField(e.target.id, e.target.value))
  }
  render () {
    let formatMessage = this.context.intl.formatMessage
    return (
      <Row>
        <Col md={5}>
         <Form onSubmit={this.loginUser} name='loginForm'>
          <div className='panel panel-default'>
            <PanelHeader>
              <span className='panelTitle'>{formatMessage(this.componentText.olsLoginHeader)}</span>
              <span className='glyphicon glyphicon-save pull-right' onClick={this.loginUser}></span>
            </PanelHeader>
            <div className='panel-body'>
              <Col md={6}>
                <ControlLabel>{formatMessage(this.componentText.userNameLabel)}</ControlLabel>
                <FormControl
                 type='text'
                 id='username'
                 placeholder={formatMessage(this.componentText.userNamePlaceholder)}
                 onChange={this.onFieldChange}/>
              </Col>
              <Col md={6}>
                <ControlLabel>{formatMessage(this.componentText.pwdLabel)}</ControlLabel>
                <FormControl
                  type='password'
                  id='password'
                  placeholder={formatMessage(this.componentText.pwdPlaceholder)}
                  onChange={this.onFieldChange}/>
              </Col>
              <div className='loginInstructions'>{formatMessage(this.componentText.olsLoginInstructions)}</div>
              <input type="submit" id="hiddenSubmit"/>
            </div>
          </div>
         </Form>
        </Col>
        <Col md={7}>
          <Panel header={formatMessage(this.componentText.fbLoginHeader)}>
            <p><span id='fbLoginLink' onClick={this.onFBCheck}>{formatMessage(this.componentText.pageName)}</span></p>
          </Panel>
        </Col>
      </Row>
    )
  }
}

Login.contextTypes = {
  dispatch: PropTypes.func,
  intl: intlShape
}
