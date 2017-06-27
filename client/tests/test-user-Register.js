/* test-user-Register.js - Tests the Preferences page */
import React from 'react'
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { shallow } from 'enzyme'
// import sinon from 'sinon'
import { makeTestContext } from './TestUtils.js'
import Register from '../src/user/Register.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const defaultState = fromJS({
  user: {
    username: undefined,
    user_id: undefined,
    phone: undefined,
    email: undefined
  }
})

describe('Register basic render tests', () => {
  it('renders without logged in user', () => {
    const wrapper = shallow(<Register />, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(
     <input type="submit" id="hiddenSubmit"/>
    )
  })
})
