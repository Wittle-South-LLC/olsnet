/* test-user-Register.js - Tests the Preferences page */
import React from 'react'
import { FormControl } from 'react-bootstrap'
import { Map } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import sinon from 'sinon'
import { TestContainer } from './TestUtils'
import { MemoryRouter } from 'react-router'
import { IntlProvider } from 'react-intl'
import { User } from '../src/state/user/user'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
import UserEdit from '../src/user/UserEdit'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const noUser = new User()
const incompleteUser = new User({ [RO_INIT_DATA]: {
  username: 'Tes',
  password: 'testing0',
  user_id: 'User Identifier',
  phone: '919929433',
  preferences: {},
  roles: 'User'
}})
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
const makeState = (fromUser) => {
  return Map({ user: Map({ current: fromUser }) })
}

describe('UserEdit basic render tests', () => {
  it('renders with warning class when username is undefined', () => {
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/register']}>
          <UserEdit user={noUser}/>
        </MemoryRouter>
      </IntlProvider>
    )
    chai.expect(mounted.find({id: 'userNameFG'}).first().hasClass('has-warning')).to.equal(true)
  })
  it('renders with no warning class when username is undefined', () => {
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/user']}>
          <UserEdit user={validUser}/>
        </MemoryRouter>
      </IntlProvider>
    )
    chai.expect(mounted.find({id: 'userNameFG'}).first().hasClass('has-warning')).to.equal(false)
  })
  it('calls dispatch() with an error message when form is submitted with an incomplete user', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/register']}>
          <TestContainer dispatch={dispatchFunc}>
            <UserEdit user={incompleteUser}/>
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    // Test that the first argument to the first call to dispatchFunc is SET_MESSAGE, indicating an error condition
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('SET_MESSAGE')
  })
  it('calls dispatch() with EDIT_USER when a form value is changed', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/register']}>
          <TestContainer dispatch={dispatchFunc}>
            <UserEdit user={noUser}/>
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    let userNameInput = mounted.find(FormControl).first()
    userNameInput.simulate('change', { target: { value: 'Testing', id: 'username' } })
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('USER')
    chai.expect(dispatchFunc.args[0][0]['verb']).to.equal('EDIT')
  })
  it('calls dispatch() when form is submitted with valid user from register path', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/register']}>
          <TestContainer dispatch={dispatchFunc} state={makeState(validUser)}>
            <UserEdit user={validUser}/>
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    let password2Input = mounted.find('#password2').first()
    if (!password2Input) { console.log('could not find password2 input') }
    password2Input.simulate('change', { target: { value: 'testing0$', id: 'password2' } })
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    sinon.assert.calledOnce(dispatchFunc)
  })
  it('calls dispatch() when form is submitted with valid user from edit path', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/user']}>
          <TestContainer dispatch={dispatchFunc} state={makeState(validUser)}>
            <UserEdit user={validUser}/>
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    sinon.assert.calledOnce(dispatchFunc)
  })
})
