/* test-user-Preferences.js - Tests the Preferences page */
import React from 'react'
import { Map, fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { shallow } from 'enzyme'
// import sinon from 'sinon'
import Preferences from '../src/user/Preferences.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

// Set up a default state object in context
const defaultStateContext = {
  reduxState: fromJS({
    user: {
      username: 'Test',
      user_id: 'A really long UUID string',
      phone: '9199291234',
      email: 'test@olsnet.com'
    }
  }),
  intl: {
    formatMessage: (message) => { return undefined },
    formatDate: (date) => { console.log(date) },
    formatTime: (time) => { console.log(time) },
    formatNumber: (num) => { console.log(num) },
    formatRelative: (x) => { console.log(x) },
    formatPlural: (plural) => { console.log(plural) },
    formatHTMLMessage: (msg) => { console.log(msg) },
    now: () => { return 'now' }
  }
}

describe('Preferences basic render tests', () => {
  it('renders with logged in user', () => {
    const wrapper = shallow(<Preferences />, { context: defaultStateContext })
    chai.expect(wrapper).to.contain(
     <p>Preferences for { defaultStateContext.reduxState.getIn(['user', 'username']) }</p>
    )
  })
})
