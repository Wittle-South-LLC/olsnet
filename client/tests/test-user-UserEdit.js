/* test-user-Register.js - Tests the Preferences page */
import React from 'react'
import { FormControl } from 'react-bootstrap'
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import sinon from 'sinon'
import { TestContainer } from './TestUtils.js'
import { IntlProvider } from 'react-intl'
import { User } from '../src/state/user/user'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
import UserEdit from '../src/user/UserEdit.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const noUser = new User()
const validUser = new User({ [RO_INIT_DATA]: {
  username: 'Testing',
  password: 'testing0$',
  user_id: undefined,
  phone: '9199294333',
  preferences: {},
  roles: 'User'
}})

describe('UserEdit basic render tests', () => {
  it('renders with warning class when username is undefined', () => {
    const mounted = mount(<IntlProvider locale='en'><UserEdit user={noUser}/></IntlProvider>)
    chai.expect(mounted.find({id: 'userNameFG'}).first().hasClass('has-warning')).to.equal(true)
  })
  it('renders with no warning class when username is undefined', () => {
    const mounted = mount(<IntlProvider locale='en'><UserEdit user={validUser}/></IntlProvider>)
    chai.expect(mounted.find({id: 'userNameFG'}).first().hasClass('has-warning')).to.equal(false)
  })
  it('calls dispatch() with an error message when form is submitted with valid user data but no reCaptchaResponse', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(<IntlProvider locale='en'><TestContainer dispatch={dispatchFunc}><UserEdit user={validUser}/></TestContainer></IntlProvider>)
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    // Test that the first argument to the first call to dispatchFunc is SET_MESSAGE, indicating an error condition
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('SET_MESSAGE')
  })
  it('calls dispatch() with EDIT_USER when a form value is change', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(<IntlProvider locale='en'><TestContainer dispatch={dispatchFunc}><UserEdit user={noUser}/></TestContainer></IntlProvider>)
    let userNameInput = mounted.find(FormControl).first()
    userNameInput.simulate('change', { target: { value: 'Testing', id: 'username' } })
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('USER')
    chai.expect(dispatchFunc.args[0][0]['verb']).to.equal('EDIT')
  })
/* Removed 7/4/17 - Unable to set reCaptcha value on the component, so unable to test a successful submit
  it('updates state when value of password2 changes', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(<IntlProvider locale='en'><TestContainer dispatch={dispatchFunc}><UserEdit user={noUser}/></TestContainer></IntlProvider>)
    const usrEdit = mounted.find(UserEdit)
    let password2Input = mounted.find('#password2').first()
    password2Input.simulate('change', { target: { value: 'Junk', id: 'password2' } })
    chai.expect(usrEdit.state('password2')).to.equal('Junk')
  })
  it('calls dispatch() with a REGISTER_USER action when form is submitted with valid user data and reCaptchaResponse', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(<IntlProvider locale='en'><TestContainer dispatch={dispatchFunc}><UserEdit user={validUser}/></TestContainer></IntlProvider>)
    let userEdit = mounted.find(UserEdit)
    if (!userEdit) { console.log('could not find UserEdit') }
    userEdit.onVerifyCallback('ReCaptcha Response Simulation')
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    // Test that the first argument to the first call to dispatchFunc is SET_MESSAGE, indicating an error condition
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('REGISTER_USER')
  })
*/
})
