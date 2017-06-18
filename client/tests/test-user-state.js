/* test-user-state.js - Tests user state */
import { fromJS } from 'immutable'
import { describe, it, afterEach } from 'mocha'
import { combineReducers } from 'redux-immutable'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import nock from 'nock'
import expect from 'expect'
import { isd, testAsync } from './TestUtils'
import { listUsers, loginUser, logoutUser, registerUser } from '../../client/src/state/user/userActions'
import { user, userMessage, componentText as userComponentText } from '../../client/src/state/user/userReducer'
import { fetchStatus } from '../../client/src/state/fetchStatus/fetchStatusReducer'
import { componentText } from '../../client/src/state/fetchStatus/fetchStatusActions'

// Here's the application (for this test anyway) reducer
const testUserState = combineReducers({ fetchStatus, user })

// Set up the various state constants I'm going to use for testing, which
// are a potential walkthrough of a create/edit/lookup/delete sequence
// I assert I'm still following test independence, because these are
// all set up in advance and not side effects of other tests
const initialState = fromJS({
  fetchStatus: { fetching: false, message: undefined },
  user: {
    username: undefined,
    email: undefined,
    phone: undefined,
    preferences: undefined,
    user_id: undefined,
    token: undefined
  }
})

// Login states, starting fetch, success, and failed
const stateLoginStart = initialState.setIn(['user', 'fetchingUser'], true)
                                    .setIn(['fetchStatus', 'fetching'], true)
                                    .setIn(['user', 'username'], 'testing')
const stateLoginSuccess = initialState.setIn(['user', 'username'], 'testing')
                                      .setIn(['user', 'token'], 'token')
                                      .setIn(['user', 'phone'], '9999')
                                      .setIn(['user', 'email'], 'test@wittle.net')
                                      .setIn(['user', 'preferences'], fromJS({color: 'blue'}))
                                      .setIn(['user', 'user_id'], 'UUID')
                                      .setIn(['fetchStatus', 'messageType'], 'status')
                                      .setIn(['fetchStatus', 'message'], userComponentText.userLogin)
const stateLogoutSuccess = initialState.setIn(['fetchStatus', 'message'], userMessage(logoutUser()))
                                       .setIn(['fetchStatus', 'messageType'], 'status')
                                       .setIn(['fetchStatus', 'transitionTo'], '/home')
const stateLoginFailed = initialState.setIn(['fetchStatus', 'message'], componentText.invalidCredentials)
                                     .setIn(['fetchStatus', 'messageType'], 'error')
// List user states starting from successful login state
const stateListUsersStart = stateLoginSuccess.setIn(['user', 'list'], undefined)
                                             .setIn(['fetchStatus', 'fetching'], true)
const stateListUsersFailed = stateLoginSuccess.setIn(['fetchStatus', 'message'], componentText.invalidCredentials)
                                              .setIn(['fetchStatus', 'messageType'], 'error')
const userList = [ { username: 'testing', preferences: {}, user_id: 1 } ]
const stateUsersListed = stateLoginSuccess.setIn(['user', 'list'], fromJS(userList))
// Create states starting from initialState
const stateRegisterStart = initialState.setIn(['user', 'creatingUser'], true)
                                       .setIn(['fetchStatus', 'fetching'], true)
const stateRegisterSuccess = initialState.setIn(['fetchStatus', 'message'], userComponentText.userCreated)
                                         .setIn(['fetchStatus', 'messageType'], 'status')
                                         .setIn(['fetchStatus', 'transitionTo'], '/cover')
const stateRegisterFailed = initialState.setIn(['fetchStatus', 'message'], componentText.invalidRequest)
                                         .setIn(['fetchStatus', 'messageType'], 'error')
// Update states starting from successful created state
// Delete states starting from successful updated state

describe('user: testing reducing of synchronous actions', () => {
  it('returns initial state', () => {
    expect(isd(testUserState(undefined, {}), initialState)).toEqual(true)
  })
  it('handles logoutUser', () => {
    expect(isd(testUserState(stateLoginSuccess, logoutUser()), stateLogoutSuccess)).toEqual(true)
  })
})

describe('user: testing reducing of asynchronous actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('handles loginUser with a successful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    const receivedData = {
      token: 'token',
      username: 'testing',
      user_id: 'UUID',
      preferences: {color: 'blue'},
      phone: '9999',
      email: 'test@wittle.net'
    }
    nock(process.env.TEST_URL).get('/login').reply(200, receivedData)
    testAsync(store, stateLoginStart, stateLoginSuccess, done)
    store.dispatch(loginUser('testing', 'testing'))
  })
  it('handles loginUser with an unsuccessful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/login').reply(401)
    testAsync(store, stateLoginStart, stateLoginFailed, done)
    store.dispatch(loginUser('testing', 'invalid password'))
  })
  it('handles listUsers with a successful response', (done) => {
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(200, userList)
    testAsync(store, stateListUsersStart, stateUsersListed, done)
    store.dispatch(listUsers('testing', 'testing'))
  })
  it('handles listUsers with an unsuccessful response', (done) => {
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(401)
    testAsync(store, stateListUsersStart, stateListUsersFailed, done)
    store.dispatch(listUsers('testing', 'invalid password'))
  })
  it('handles registerUser with a successful response and next path', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    const receivedData = {id: 100}
    nock(process.env.TEST_URL).post('/users').reply(200, receivedData)
    testAsync(store, stateRegisterStart, stateRegisterSuccess, done)
    store.dispatch(registerUser('testing2', 'testing2', 'email', '9199291199', 'recaptchaResponse', '/cover'))
  })
  it('handles registerUser with an unsuccessful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/users').reply(400)
    testAsync(store, stateRegisterStart, stateRegisterFailed, done)
    store.dispatch(registerUser('testing2', '', 'email'))
  })
})

if (process.env.INTEGRATION_TESTS === 'Yes') {
  let addUser = JSON.parse(process.env.ADD_USER)
  const listUsersStart = initialState.setIn(['user', 'list'], undefined)
                                     .setIn(['fetchStatus', 'fetching'], true)
  const listUsersSuccess = initialState.setIn(['user', 'list'], fromJS([
    {username: 'testing', user_id: addUser.user_id, preferences: null, phone: '9199999999', email: 'test@wittle.net'}
  ]))
  describe('user: live aychronous tests against the test server', () => {
    it('handles loginUser with a successful response', (done) => {
      let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
      testAsync(store, listUsersStart, listUsersSuccess, done)
      store.dispatch(listUsers('testing', 'testing0'))
    })
  })
}
