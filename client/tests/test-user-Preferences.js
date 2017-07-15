/* test-user-Preferences.js - Tests the Preferences page */
import React from 'react'
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { shallow } from 'enzyme'
// import sinon from 'sinon'
import { makeTestContext } from './TestUtils.js'
import { User, USER_STATE_PATH } from '../src/state/user/user'
import Preferences from '../src/user/Preferences.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const defaultState = fromJS({
  user: {
    current: undefined
  }
}).setIn(USER_STATE_PATH, new User())

describe('Preferences basic render tests', () => {
  it('renders with logged in user', () => {
    const wrapper = shallow(<Preferences />, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(
     <p>Preferences page for { defaultState.getIn(['user', 'current', 'username']) }</p>
    )
  })
})
