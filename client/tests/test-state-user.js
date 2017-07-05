/* test-user-state.js - Tests user state */
import { fromJS, List, Map } from 'immutable'
import { describe, it, afterEach } from 'mocha'
import { combineReducers } from 'redux-immutable'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import nock from 'nock'
import expect from 'expect'
import { isd, testAsync } from './TestUtils'
import { listUsers, loginUser, logoutUser, createUser, editUserField, registerUser, hydrateApp } from '../src/state/user/userActions'
import { user, componentText as userComponentText } from '../src/state/user/userReducer'
import { fetchStatus } from '../src/state/fetchStatus/fetchStatusReducer'
import { componentText } from '../src/state/fetchStatus/fetchStatusActions'
import * as userRO from '../src/state/user/user'
import { addMeta, setNew, setDirty, setFetching } from '../src/state/ReduxObject'

// Define a regular javascript object like what would be returned
// from a fetch request to use for testing
let userTestData = {}
userTestData[userRO.USER_NAME] = 'TestUser'
userTestData[userRO.USER_ID] = 'SDFDFSDFS-SFSDFDSFSFS'
userTestData[userRO.USER_PHONE] = '9199293456'
userTestData[userRO.USER_EMAIL] = 'testuser@wittle.net'
userTestData[userRO.USER_PREFERENCES] = {'color': 'purple'}
userTestData[userRO.USER_ROLES] = 'User'
userTestData[userRO.USER_PASSWORD] = 'Password'

describe('user: testing ReduxObject actions', () => {
  // Create a new empty user object that matches what we expect from createUser()
  let createUserTest = setNew(addMeta(Map({}).set(userRO.USER_NAME, undefined)
                                             .set(userRO.USER_ID, undefined)
                                             .set(userRO.USER_PHONE, undefined)
                                             .set(userRO.USER_EMAIL, undefined)
                                             .set(userRO.USER_PREFERENCES, Map({}))
                                             .set(userRO.USER_ROLES, undefined)
                                             .set(userRO.USER_PASSWORD, undefined)))
  // Now test it
  it('newUser() returns an empty user object', () => {
    expect(isd(userRO.newUser(), createUserTest)).toEqual(true)
  })
  // Define an equivalent object we would expect to see in response
  // to a newUser() call
  let userTest = addMeta(Map({}).set(userRO.USER_NAME, userTestData[userRO.USER_NAME])
                                .set(userRO.USER_ID, userTestData[userRO.USER_ID])
                                .set(userRO.USER_PHONE, userTestData[userRO.USER_PHONE])
                                .set(userRO.USER_EMAIL, userTestData[userRO.USER_EMAIL])
                                .set(userRO.USER_PREFERENCES, fromJS(userTestData[userRO.USER_PREFERENCES]))
                                .set(userRO.USER_ROLES, userTestData[userRO.USER_ROLES])
                                .set(userRO.USER_PASSWORD, userTestData[userRO.USER_PASSWORD]))
  // Test the new user object against the data from the original object
  it('makeUser() returns a populated user object from existing data', () => {
    expect(isd(userRO.makeUser(userTestData), userTest)).toEqual(true)
  })
  it('getUserName() returns user name', () => {
    expect(userRO.getUserName(userTest)).toEqual(userTestData[userRO.USER_NAME])
  })
  it('getUserId() returns user id', () => {
    expect(userRO.getUserId(userTest)).toEqual(userTestData[userRO.USER_ID])
  })
  it('getUserEmail() returns user email', () => {
    expect(userRO.getUserEmail(userTest)).toEqual(userTestData[userRO.USER_EMAIL])
  })
  it('getUserPhone() returns user phone', () => {
    expect(userRO.getUserPhone(userTest)).toEqual(userTestData[userRO.USER_PHONE])
  })
  it('getUserPreferences() returns user preferences', () => {
    expect(userRO.getUserPreferences(userTest).toJS()).toEqual(userTestData[userRO.USER_PREFERENCES])
  })
  it('getUserRoles() returns user roles', () => {
    expect(userRO.getUserRoles(userTest)).toEqual(userTestData[userRO.USER_ROLES])
  })
  // Update the user object, and test that the update returns what is expected
  let updateUserTest = setDirty(userTest.set(userRO.USER_EMAIL, 'testuser2@wittle.net'), true)
  it('updateUserField() updates a field and sets object to dirty', () => {
    expect(isd(userRO.updateUserField(userTest, userRO.USER_EMAIL, 'testuser2@wittle.net'), updateUserTest)).toEqual(true)
  })
  // Test email validation
  it('isEmailValid() returns true for valid email', () => {
    expect(userRO.isEmailValid(userTest)).toEqual(true)
  })
  it('isEmailValid() returns fale for invalid email', () => {
    let userInvalidEmail = userRO.updateUserField(userTest, userRO.USER_EMAIL, 'junk')
    expect(userRO.isEmailValid(userInvalidEmail)).toEqual(false)
  })
  // Test phone validation
  it('isPhoneValid() returns true for valid phone number', () => {
    expect(userRO.isPhoneValid(userTest)).toEqual(true)
  })
  it('isPhoneValid() returns false for invalid phone number', () => {
    let userInvalidPhone = userRO.updateUserField(userTest, userRO.USER_PHONE, 'junk')
    expect(userRO.isPhoneValid(userInvalidPhone)).toEqual(false)
  })
  // Test username validation
  it('isUserNameValid() returns true for valid user name', () => {
    expect(userRO.isUserNameValid(userTest)).toEqual(true)
  })
  it('isUserNameValid() returns false for invalid user name', () => {
    let invalidUserName = userRO.updateUserField(userTest, userRO.USER_NAME, 't')
    expect(userRO.isUserNameValid(invalidUserName)).toEqual(false)
  })
  // Test password validation
  it('isPasswordValid() returns true for a valid password', () => {
    let validPassword = userRO.updateUserField(userTest, userRO.USER_PASSWORD, 'testing0%')
    expect(userRO.isPasswordValid(validPassword)).toEqual(true)
  })
  it('isPasswordValid() returns false for invalid passwords', () => {
    expect(userRO.isPasswordValid(userTest)).toEqual(false)
  })
})

// Here's the application (for this test anyway) reducer
const testUserState = combineReducers({ fetchStatus, user })

// Set up the various state constants I'm going to use for testing, which
// are a potential walkthrough of a create/edit/lookup/delete sequence
// I assert I'm still following test independence, because these are
// all set up in advance and not side effects of other tests
const initialState = fromJS({
  fetchStatus: { fetching: false, message: undefined },
  user: {
    current: {
      username: undefined,
      email: undefined,
      phone: undefined,
      preferences: Map({}),
      user_id: undefined,
      roles: undefined,
      password: undefined
    }
  }
})

// Create user start state
const createUserState = initialState.setIn(['user', 'current'], userRO.newUser())
// Login states, starting fetch, success, and failed
const stateLoginStart = initialState.setIn(['user', 'current'], setFetching(userRO.makeUser({username: 'TestUser', password: 'testing'}), true))
                                    .setIn(['fetchStatus', 'fetching'], true)
const stateHydrateStart = initialState.setIn(['fetchStatus', 'fetching'], true)
const stateLoginSuccess = initialState.setIn(['user', 'current'], userRO.makeUser(userTestData))
                                      .setIn(['fetchStatus', 'messageType'], 'status')
                                      .setIn(['fetchStatus', 'message'], userComponentText.userLogin)
const stateLoginFailed = stateLoginStart.setIn(['fetchStatus', 'message'], componentText.invalidCredentials)
                                        .setIn(['fetchStatus', 'messageType'], 'error')
                                        .setIn(['fetchStatus', 'fetching'], false)
                                        .setIn(['user', 'current'], setFetching(stateLoginStart.getIn(['user', 'current']), false))
// Create states starting from initialState
const stateRegisterInit = initialState.setIn(['user', 'current'], setDirty(setNew(userRO.makeUser(userTestData).set(userRO.USER_ID, undefined), true), true))
const stateRegisterStart = stateRegisterInit.setIn(['user', 'current'], setFetching(stateRegisterInit.getIn(['user', 'current']), true))
                                            .setIn(['fetchStatus', 'fetching'], true)
const stateRegisterSuccess = stateRegisterStart.setIn(['fetchStatus', 'message'], userComponentText.userCreated)
                                               .setIn(['fetchStatus', 'fetching'], false)
                                               .setIn(['fetchStatus', 'messageType'], 'status')
                                               .setIn(['fetchStatus', 'transitionTo'], '/cover')
                                               .setIn(['user', 'current'], setFetching(setDirty(setNew(stateRegisterStart.getIn(['user', 'current']), false), false), false))
const stateRegisterFailed = stateRegisterInit.setIn(['fetchStatus', 'message'], componentText.invalidRequest)
                                              .setIn(['fetchStatus', 'messageType'], 'error')
// List user states starting from successful login state
const stateListUsersStart = stateLoginSuccess.setIn(['user', 'list'], undefined)
                                             .setIn(['fetchStatus', 'fetching'], true)
const stateListUsersFailed = stateLoginSuccess.setIn(['fetchStatus', 'message'], componentText.invalidCredentials)
                                              .setIn(['fetchStatus', 'messageType'], 'error')
const userList = [ { username: 'testing', preferences: {}, user_id: 1 } ]
const stateUsersListed = stateLoginSuccess.setIn(['user', 'list'], List([]).push(userRO.makeUser(userList[0])))
// Test logout state
const stateLogoutStart = stateLoginSuccess.setIn(['user', 'current'], setFetching(stateLoginSuccess.getIn(['user', 'current']), true))
                                          .setIn(['fetchStatus', 'fetching'], true)
const stateLogoutSuccess = initialState.setIn(['fetchStatus', 'message'], userComponentText.userLogout)
                                       .setIn(['fetchStatus', 'messageType'], 'status')
                                       .setIn(['fetchStatus', 'transitionTo'], '/home')
                                       .setIn(['user', 'current'], addMeta(initialState.getIn(['user', 'current'])))
// Update states starting from successful created state
// Delete states starting from successful updated state

describe('user: testing reducing of asynchronous actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns initial state', () => {
    expect(isd(testUserState(undefined, {}), initialState)).toEqual(true)
  })
  it('handles createUser successfully', () => {
    expect(isd(testUserState(initialState, createUser()), createUserState)).toEqual(true)
  })
  it('handles loginUser with a successful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/login').reply(200, userTestData)
    testAsync(store, stateLoginStart, stateLoginSuccess, done)
    store.dispatch(loginUser('TestUser', 'testing'))
  })
  it('handles hydrateApp with a successful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/login').reply(200, userTestData)
    testAsync(store, stateHydrateStart, stateLoginSuccess, done)
    store.dispatch(hydrateApp())
  })
  it('handles loginUser with an unsuccessful response', (done) => {
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/login').reply(401)
    testAsync(store, stateLoginStart, stateLoginFailed, done)
    store.dispatch(loginUser('TestUser', 'testing'))
  })
  it('handles editUser successfully', () => {
    let resultState = stateLoginSuccess.setIn(['user', 'current'],
                      setDirty(stateLoginSuccess.getIn(['user', 'current']).set('username', 'Edited'), true))
    expect(isd(testUserState(stateLoginSuccess, editUserField('username', 'Edited')), resultState)).toEqual(true)
  })
  it('handles registerUser with a successful response and next path', (done) => {
    let store = createStore(testUserState, stateRegisterInit, applyMiddleware(thunkMiddleware))
    const receivedData = {}
    receivedData[userRO.USER_ID] = userTestData[userRO.USER_ID]
    nock(process.env.TEST_URL).post('/users').reply(200, receivedData)
    testAsync(store, stateRegisterStart, stateRegisterSuccess, done)
    store.dispatch(registerUser(
      'recaptchaResponse',
      '/cover'
    ))
  })
  it('handles registerUser with an unsuccessful response', (done) => {
    let store = createStore(testUserState, stateRegisterInit, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/users').reply(400)
    testAsync(store, stateRegisterStart, stateRegisterFailed, done)
    store.dispatch(registerUser('testing2', '', 'email'))
  })
  it('handles listUsers with a successful response', (done) => {
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(200, userList)
    testAsync(store, stateListUsersStart, stateUsersListed, done)
    store.dispatch(listUsers())
  })
  it('handles listUsers with an unsuccessful response', (done) => {
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(401)
    testAsync(store, stateListUsersStart, stateListUsersFailed, done)
    store.dispatch(listUsers())
  })
  it('handles logoutUser', (done) => {
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/logout').reply(200, {})
    testAsync(store, stateLogoutStart, stateLogoutSuccess, done)
    store.dispatch(logoutUser())
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
