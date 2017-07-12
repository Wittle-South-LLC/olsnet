// SiteMenu.jsx - Implements a site-wide menu
import React from 'react'
import PropTypes from 'prop-types'
import { intlShape, defineMessages } from 'react-intl'
import { createUser, logoutUser } from '../state/user/userActions'
import './SiteMenu.css'

export default class SiteMenu extends React.Component {
  constructor (props, context) {
    super(props)
    this.onLogoutClick = this.onLogoutClick.bind(this)
    this.onMenuToggle = this.onMenuToggle.bind(this)
    this.onMenuClick = this.onMenuClick.bind(this)
    this.onSignInClick = this.onSignInClick.bind(this)
    this.onRegisterClick = this.onRegisterClick.bind(this)
    this.componentText = defineMessages({
      signInText: { id: 'SiteMenu.signInText', defaultMessage: 'Sign in' },
      orText: { id: 'SiteMenu.orText', defaultMessage: 'or' },
      registerText: { id: 'SiteMenu.registerText', defaultMessage: 'Register' },
      welcomeText: { id: 'SiteMenu.welcomeText', defaultMessage: 'Welcome {username}!' },
      logoutText: { id: 'SiteMenu.logoutText', defaultMessage: 'Sign out' }
    })
    this.state = {
      contentClass: 'content',
      activePath: '/home'
    }
  }
  onLogoutClick (e) {
    this.context.dispatch(logoutUser())
  }
  onSignInClick (e) {
    this.setState({
      activePath: '/home/login'
    })
    this.context.router.history.push('/home/login')
  }
  onRegisterClick (e) {
    this.setState({
      activePath: '/home/register'
    })
    this.context.dispatch(createUser())
    this.context.router.history.push('/home/register')
  }
  onMenuToggle (e) {
    this.state.contentClass === 'content'
      ? this.setState({ contentClass: 'content isOpen' })
      : this.setState({ contentClass: 'content' })
  }
  onMenuClick (path, e) {
    this.setState({
      activePath: path,
      contentClass: 'content'
    })
    this.context.router.history.push(path)
  }
  render () {
    // If the property navOptions is not empty, create a list of links
    let menuOptions = this.props.navOptions
      ? this.props.navOptions.map((option) =>
        <li key={option.path} className={option.class}>
          <a id={option.id} className={option.path === this.state.activePath ? 'active' : undefined}
             onClick={this.onMenuClick.bind(undefined, option.path)}>{option.label}</a>
        </li>)
      : []
    let userHeader = this.props.userId !== undefined
      ? <div className='loggedIn'>
          <span className='titleor'>
            {this.context.intl.formatMessage(this.componentText.welcomeText, {username: this.props.username})}
          </span>
          <span id='logoutLink' onClick={this.onLogoutClick} className='titlelink'>
            {this.context.intl.formatMessage(this.componentText.logoutText)}
          </span>
        </div>
      : <div className='notLoggedIn'>
          <span id='loginLink' onClick={this.onSignInClick} className='titlelink'>
            {this.context.intl.formatMessage(this.componentText.signInText)}
          </span>
          <span className='titleor'>
            {this.context.intl.formatMessage(this.componentText.orText)}
          </span>
          <span id='registerLink' onClick={this.onRegisterClick} className='titlelink'>
           {this.context.intl.formatMessage(this.componentText.registerText)}
          </span>
        </div>
    return (
      <div className="wsv-container">
        <div className="sidebar">
          <div className="title">Site Menu</div>
          <ul className="nav">
            {menuOptions}
          </ul>
        </div>
        <div id='menuBar' className={this.state.contentClass}>
          <div className='titlebarRight'>
            <select className="languageSelect" onChange={this.props.changeLocale} value={this.props.currentLocale}>
              {this.props.availableLocales.map((locale) =>
                <option key={locale.localeCode} value={locale.localeCode}>{locale.localeDesc}</option>
              )}
            </select>
            {userHeader}
          </div>
          <a className="button" id='menuToggle' onClick={this.onMenuToggle}></a>
          <span className='appTitle'>{this.props.title}</span>
          <div className={'appMessage ' + this.props.messageType}>
            {this.props.message}
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

SiteMenu.contextTypes = {
  dispatch: PropTypes.func,
  router: PropTypes.object,
  intl: intlShape
}
