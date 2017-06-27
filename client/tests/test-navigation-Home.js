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
  it('HTML: renders without logged in user', () => {
    const rendered = render(<TestContainer><IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider></TestContainer>, makeTestContext(defaultState))
    chai.expect(rendered.text()).to.contain('Hello World!')
  })
  /*
  it('Mount: simple test', () => {
//    const mounted = mount(<TestContainer><IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider></TestContainer>, makeTestContext(defaultState))
    console.log('About to mount')
    const mounted = mount(<p>Hello World!</p>)
    console.log('mounted = ', mounted)
    chai.expect(mounted).to.contain(<p>Hello World!</p>)
  })
  it('Shallow: Just Home', () => {
    const wrapper = shallow(<Home />, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(<p>Hello World!</p>)
  })
  it('Shallow: Home wrapped with MemoryRouter', () => {
    const wrapper = shallow(<MemoryRouter><Home /></MemoryRouter>, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(<p>Hello World!</p>)
  })
  it('Shallow: Home with IntlProvider and MemoryRouter', () => {
    const wrapper = shallow(<IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider>, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(<p>Hello World!</p>)
  })
  it('Shallow: Home with TestContainer, IntlProvider, and MemoryRouter attempting to check just Home', () => {
    const wrapper = shallow(<TestContainer><IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider></TestContainer>, makeTestContext(defaultState))
    chai.expect(wrapper).to.contain(<p>Hello World!</p>)
  })
  it('Shallow: Home with TestContainer, IntlProvider, and MemoryRouter attempting to check just Home', () => {
    const wrapper = shallow(<TestContainer><IntlProvider locale='en'><MemoryRouter><Home /></MemoryRouter></IntlProvider></TestContainer>, makeTestContext(defaultState))
    const home = wrapper.find(Home)
    chai.expect(home).to.contain(<p>Hello World!</p>)
  })
  */
})
