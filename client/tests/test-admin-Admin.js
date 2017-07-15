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
import Admin from '../src/admin/Admin'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
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
const emptyList = []
const oneList = [validUser]

function getAdmin (userList, dispatchSpy = undefined) {
  let myDispatch = dispatchSpy !== undefined
    ? dispatchSpy
    : () => { console.log('defaultSpy') }
  let myState = Map({user: Map({list: userList})})
  return mount(
    <IntlProvider locale='en'>
      <MemoryRouter initialEntries={['/admin']}>
        <TestContainer dispatch={myDispatch} state={myState}>
          <Admin userList={userList}/>
        </TestContainer>
      </MemoryRouter>
    </IntlProvider>
  )
}

describe('Admin basic render tests', () => {
  it('renders with no users in list', () => {
    const mounted = getAdmin(emptyList)
    chai.expect(mounted).to.contain(<th>User Name</th>)
  })
  it('renders with one user in list', () => {
    const mounted = getAdmin(oneList)
    chai.expect(mounted).to.contain(<td>Testing</td>)
  })
  it('dispatches editUser and updateUser when role is clicked', () => {
    let dispatchSpy = sinon.spy()
    const mounted = getAdmin(oneList, dispatchSpy)
    let setTemplateEdit = mounted.find('#templateEditCheck_0').first()
    setTemplateEdit.simulate('change')
    sinon.assert.calledOnce(dispatchSpy)
  })
  it('dispatches deleteUser when delete is clicked', () => {
    let dispatchSpy = sinon.spy()
    const mounted = getAdmin(oneList, dispatchSpy)
    let deleteLink = mounted.find('#deleteLink_0').first()
    deleteLink.simulate('click')
    sinon.assert.calledOnce(dispatchSpy)
  })
  it('dispatches listUsers when form is submitted', () => {
    let dispatchSpy = sinon.spy()
    const mounted = getAdmin(oneList, dispatchSpy)
    let form = mounted.find('form').first()
    form.simulate('submit')
    sinon.assert.calledOnce(dispatchSpy)
  })
})
