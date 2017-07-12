/* test-user-Login.js - Tests the Login component */
import React from 'react'
import { FormControl } from 'react-bootstrap'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import { IntlProvider } from 'react-intl'
import sinon from 'sinon'
import { logDeep, TestContainer } from './TestUtils'
// import { User } from '../src/state/user/user'
// import { RO_INIT_DATA } from '../src/state/ReduxObject'
import Login from '../src/user/Login'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

describe('Login basic render tests', () => {
  it('renders with no logged in user', () => {
    const mounted = mount(
      <IntlProvider locale='en'><Login /></IntlProvider>
    )
    chai.expect(mounted).to.contain(
     <input type="submit" id="hiddenSubmit"/>
    )
  })
  it('calls dispatch() with EDIT_USER when a form value is changed', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <TestContainer dispatch={dispatchFunc}>
          <Login />
        </TestContainer>
      </IntlProvider>
    )
    let userNameInput = mounted.find(FormControl).first()
    userNameInput.simulate('change', { target: { value: 'Testing', id: 'username' } })
    chai.expect(dispatchFunc.args[0][0]['type']).to.equal('USER')
    chai.expect(dispatchFunc.args[0][0]['verb']).to.equal('EDIT')
  })
  it('calls dispatch() with a login action when form is submitted', () => {
    let dispatchFunc = sinon.spy()
    const mounted = mount(
      <IntlProvider locale='en'>
        <TestContainer dispatch={dispatchFunc}>
          <Login />
        </TestContainer>
      </IntlProvider>
    )
    let form = mounted.find('form').first()
    if (!form) { console.log('could not find form') }
    form.simulate('submit')
    sinon.assert.calledOnce(dispatchFunc)
  })
})
