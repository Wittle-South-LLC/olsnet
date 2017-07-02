/* test-navigation-Home.js - Tests the Home page
   Currently this is using render(), which is not ideal in my opinion,
   as I'll need to test for the rendered HTML. I need to either find
   a way to get shallow() working with react-router-4, or get mount()
   working so that I can test for react components rather than HTML */
import React from 'react'
// import PropTypes from 'prop-types'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount, render, shallow } from 'enzyme'
// import sinon from 'sinon'
import { makeTestContext, TestContainer } from './TestUtils.js'
import Home from '../src/navigation/Home.jsx'

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

describe('Home basic render tests', () => {
  /* Removed 7/1/17 - I was only using render() before because I could not get mount()
   * or shallow() to work. shallow() is broken with context in enzyme right now (issue 664),
   * but I have mount working as of TPS-30
  it('Render: renders without logged in user', () => {
    const rendered = render(<TestContainer><IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider></TestContainer>, makeTestContext(defaultState))
    chai.expect(rendered.text()).to.contain('Hello World!')
  })
  */
  it('Mount: renders without Container and logged in user', () => {
    const mounted = mount(<IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider>)
    chai.expect(mounted).to.contain(<p>Hello World!</p>)
  })
})
