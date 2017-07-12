/* test-navigation-Home.js - Tests the Home page
   Currently this is using render(), which is not ideal in my opinion,
   as I'll need to test for the rendered HTML. I need to either find
   a way to get shallow() working with react-router-4, or get mount()
   working so that I can test for react components rather than HTML */
import React from 'react'
// import PropTypes from 'prop-types'
import { Map } from 'immutable'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import { User } from '../src/state/user/user'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
// import sinon from 'sinon'
import { TestContainer } from './TestUtils.js'
import Home from '../src/navigation/Home.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

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

describe('Home basic render tests', () => {
  it('Mount: renders /home/login route', () => {
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/login']}>
          <TestContainer state={makeState(validUser)}>
            <Home />
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    chai.expect(mounted).to.contain(<p>Hello World!</p>)
  })
  it('Mount: renders /home/register route', () => {
    const mounted = mount(
      <IntlProvider locale='en'>
        <MemoryRouter initialEntries={['/home/register']}>
          <TestContainer state={makeState(validUser)}>
            <Home />
          </TestContainer>
        </MemoryRouter>
      </IntlProvider>
    )
    chai.expect(mounted).to.contain(<p>Hello World!</p>)
  })
})
