/* test-user-PasswordReset.js - Tests the PasswordReset page */
import React from 'react'
import { ControlLabel } from 'react-bootstrap'
import { MemoryRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { describe, it } from 'mocha'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { mount } from 'enzyme'
import sinon from 'sinon'
import nock from 'nock'
import { TestContainer } from './TestUtils.js'
import PasswordReset from '../src/user/PasswordReset.jsx'

// Set up chai to use Enzyme
chai.use(chaiEnzyme())

function getPasswordReset (dispatchSpy = undefined) {
  let myDispatch = dispatchSpy !== undefined
    ? dispatchSpy
    : () => { console.log('defaultSpy') }
  return mount(
    <IntlProvider locale='en'>
      <MemoryRouter>
        <TestContainer dispatch={myDispatch}>
          <PasswordReset />
        </TestContainer>
      </MemoryRouter>
    </IntlProvider>
  )
}

describe('SiteMenu basic render tests', () => {
  it('Renders PasswordReset in default state', () => {
    const mounted = getPasswordReset()
    chai.expect(mounted).to.contain(<span className='panelTitle'>Reset your password here</span>)
    chai.expect(mounted).to.not.contain('New Password:')
  })
  let dispatchSpy = sinon.spy()
  const mounted = getPasswordReset(dispatchSpy)
  let form = mounted.find('form').first()
  it('Renders new password input once password has been requested', (done) => {
    // Set up to respond successfully to the network request
    nock(process.env.TEST_URL).post('/pw_reset').reply(200, {})
    let emailInput = mounted.find('#email').first()
    emailInput.simulate('change', { target: { value: 'joe@nothing.com', id: 'email' } })
    form.simulate('submit')
    setTimeout(() => {
      chai.expect(mounted).to.contain(<ControlLabel>New Password:</ControlLabel>)
      done()
    }, 0)
  })
  it('Dispatches event to set success message when password is reset', (done) => {
    // Set up to respond successfully to the network request
    nock(process.env.TEST_URL).get('/pw_reset').reply(200, {})
    let resetCodeInput = mounted.find('#resetCode').first()
    resetCodeInput.simulate('change', { target: { value: '045345', id: 'resetCode' } })
    let passwordInput = mounted.find('#password').first()
    passwordInput.simulate('change', { target: { value: 'testing0$', id: 'password' } })
    let password2Input = mounted.find('#password2').first()
    password2Input.simulate('change', { target: { value: 'testing0$', id: 'password2' } })
    form.simulate('submit')
    setTimeout(() => {
      sinon.assert.calledOnce(dispatchSpy)
      done()
    }, 0)
  })
})
