/* test-navigation-Home.js - Tests the Home page */
import React from 'react'
import { Map } from 'immutable'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import { User } from '../src/state/user/user'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
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
