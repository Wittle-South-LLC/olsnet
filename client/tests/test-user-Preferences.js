/* test-user-Preferences.js - Tests the Preferences page */
import React from 'react'
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { shallow } from 'enzyme'
// import sinon from 'sinon'
import { makeTestContext } from './TestUtils.js'
import Preferences from '../src/user/Preferences.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const defaultState = fromJS({
  user: {
    username: 'Test',
    user_id: 'A really long UUID string',
    phone: '9199291234',
    email: 'test@olsnet.com'
  }
})

describe('Preferences basic render tests', () => {
  it('renders with logged in user', () => {
    const wrapper = shallow(<Preferences />, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(
     <p>Preferences for { defaultState.getIn(['user', 'username']) }</p>
    )
  })
})
