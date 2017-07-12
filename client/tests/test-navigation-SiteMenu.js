/* test-navigation-Home.js - Tests the Home page */
import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { IntlProvider } from 'react-intl'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import sinon from 'sinon'
import { User } from '../src/state/user/user'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
import { TestContainer } from './TestUtils.js'
import SiteMenu from '../src/navigation/SiteMenu.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

const noUser = new User()
const validUser = new User({ [RO_INIT_DATA]: {
  username: 'Testing',
  password: 'testing0$',
  email: 'testing@google.com',
  user_id: 'User Identifier',
  phone: '9199294333',
  preferences: {},
  roles: 'User',
  reCaptchaResponse: 'Valid'
}})

function getSiteMenu (user, localeSpy = undefined, dispatchSpy = undefined, history = undefined) {
  let myDispatch = dispatchSpy !== undefined
    ? dispatchSpy
    : () => { console.log('defaultSpy') }
  let myLocaleChange = localeSpy !== undefined
    ? localeSpy
    : () => { console.log('defaultLocaleChange') }
  let myHistory = history !== undefined
    ? history
    : createMemoryHistory('/')
  return mount(
    <IntlProvider locale='en'>
      <Router history={myHistory}>
        <TestContainer dispatch={myDispatch}>
          <SiteMenu title='Site Menu'
                    navOptions={[{path: '/home', id: 'navlinkHome', class: 'home', role: undefined, label: 'Home'}]}
                    availableLocales={[{localeCode: 'en_US', localDescription: 'English (US)'}]}
                    changeLocale={myLocaleChange}
                    currentLocale='en_US'
                    userId={user.getUserId()}
                    userName={user.getUserName()}
                    messageType='status'
                    message='Hello World!'
          />
        </TestContainer>
      </Router>
    </IntlProvider>
  )
}

describe('SiteMenu basic render tests', () => {
  it('Renders SiteMenu with a logged in user', () => {
    const mounted = getSiteMenu(validUser)
    chai.expect(mounted).to.contain(<div className="appMessage status">Hello World!</div>)
  })
  it('Calls dispatch when sign off is clicked', () => {
    let dispatchSpy = sinon.spy()
    const mounted = getSiteMenu(validUser, undefined, dispatchSpy)
    let logoutLink = mounted.find('#logoutLink').first()
    logoutLink.simulate('click')
    sinon.assert.calledOnce(dispatchSpy)
  })
  it('Calls dispatch when register is clicked', () => {
    let dispatchSpy = sinon.spy()
    const mounted = getSiteMenu(noUser, undefined, dispatchSpy)
    let registerLink = mounted.find('#registerLink').first()
    registerLink.simulate('click')
    sinon.assert.calledOnce(dispatchSpy)
  })
  it('Changes route when sign in is clicked', () => {
    let routeSpy = sinon.spy()
    let history = createMemoryHistory('/')
    let unlisten = history.listen((location, action) => { routeSpy(location, action) })
    const mounted = getSiteMenu(noUser, undefined, undefined, history)
    let registerLink = mounted.find('#loginLink').first()
    registerLink.simulate('click')
    unlisten()
    sinon.assert.calledOnce(routeSpy)
  })
  it('Changes class of menu when menu toggle is clicked', () => {
    const mounted = getSiteMenu(noUser)
    let menuLink = mounted.find('#menuToggle').first()
    menuLink.simulate('click')
    let menuBar = mounted.find('#menuBar')
    chai.expect(menuBar).to.have.className('isOpen')
  })
  it('Changes route when menu item is clicked', () => {
    let routeSpy = sinon.spy()
    let history = createMemoryHistory('/')
    let unlisten = history.listen((location, action) => { routeSpy(location, action) })
    const mounted = getSiteMenu(validUser, undefined, undefined, history)
    let homeLink = mounted.find('#navlinkHome').first()
    homeLink.simulate('click')
    unlisten()
    sinon.assert.calledOnce(routeSpy)
  })
})
