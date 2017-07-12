/* test-user-state.js - Tests user state */
import { fromJS, List } from 'immutable'
import { describe, it, afterEach } from 'mocha'
import { combineReducers } from 'redux-immutable'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import nock from 'nock'
import expect from 'expect'
import { isd, testAsync } from './TestUtils'
import { listUsers, loginUser, logoutUser, createUser, editUserField,
         updateUser, registerUser, hydrateApp,
         componentText as userComponentText } from '../src/state/user/userActions'
import { RO_INIT_DATA } from '../src/state/ReduxObject'
import { fetchStatus } from '../src/state/fetchStatus/fetchStatusReducer'
import { componentText } from '../src/state/fetchStatus/fetchStatusActions'
import * as userRO from '../src/state/user/user'
import { setFetchStart, setFetchStop, setStatusMessage,
         setErrorMessage, setStateTransition } from '../src/state/fetchStatus/fetchStatus'

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
userTestData[userRO.USER_NEW_PASSWORD] = 'New Password'
userTestData[userRO.USER_RECAPTCHA_RESPONSE] = 'ReCaptcha Response'

describe('user: testing ReduxObject actions', () => {
  // Now test it
  it('newUser() returns an empty user object', () => {
    let myUser = new userRO.User()
    expect(myUser.fetching && (myUser.getUserName() !== undefined)).toEqual(false)
  })

  // Create a new empty user object that matches what we expect from createUser()
  let createUserTest = new userRO.User({ [RO_INIT_DATA]: userTestData }).setNew()
  it('getUserName() returns user name', () => {
    expect(createUserTest.getUserName()).toEqual(userTestData[userRO.USER_NAME])
  })
  it('getUserId() returns user id', () => {
    expect(createUserTest.getUserId()).toEqual(userTestData[userRO.USER_ID])
  })
  it('getUserEmail() returns user email', () => {
    expect(createUserTest.getUserEmail()).toEqual(userTestData[userRO.USER_EMAIL])
  })
  it('getUserPhone() returns user phone', () => {
    expect(createUserTest.getUserPhone()).toEqual(userTestData[userRO.USER_PHONE])
  })
  it('getUserPreferences() returns user preferences', () => {
    expect(createUserTest.getUserPreferences().toJS()).toEqual(userTestData[userRO.USER_PREFERENCES])
  })
  it('getUserRoles() returns user roles', () => {
    expect(createUserTest.getUserRoles()).toEqual(userTestData[userRO.USER_ROLES])
  })
  it('getNewPassword() returns new password', () => {
    expect(createUserTest.getNewPassword()).toEqual(userTestData[userRO.USER_NEW_PASSWORD])
  })
  it('getReCaptchaResponse() returns new password', () => {
    expect(createUserTest.getReCaptchaResponse()).toEqual(userTestData[userRO.USER_RECAPTCHA_RESPONSE])
  })
  // Update the user object, and test that the update returns what is expected
  let updateUserTest = createUserTest.updateField(userRO.USER_EMAIL, 'testuser2@wittle.net').setDirty()
  it('updateUserField() updates a field and sets object to dirty', () => {
    expect(updateUserTest.getUserEmail()).toEqual('testuser2@wittle.net')
  })
  // Test email validation
  it('isEmailValid() returns true for valid email', () => {
    expect(createUserTest.isEmailValid()).toEqual(true)
  })
  it('isEmailValid() returns fale for invalid email', () => {
    let userInvalidEmail = createUserTest.updateField(userRO.USER_EMAIL, 'junk')
    expect(userInvalidEmail.isEmailValid()).toEqual(false)
  })
  // Test phone validation
  it('isPhoneValid() returns true for valid phone number', () => {
    expect(createUserTest.isPhoneValid()).toEqual(true)
  })
  it('isPhoneValid() returns false for invalid phone number', () => {
    let userInvalidPhone = createUserTest.updateField(userRO.USER_PHONE, 'junk')
    expect(userInvalidPhone.isPhoneValid()).toEqual(false)
  })
  // Test username validation
  it('isUserNameValid() returns true for valid user name', () => {
    expect(createUserTest.isUserNameValid()).toEqual(true)
  })
  it('isUserNameValid() returns false for invalid user name', () => {
    let invalidUserName = createUserTest.updateField(userRO.USER_NAME, 't')
    expect(invalidUserName.isUserNameValid()).toEqual(false)
  })
  // Test password validation
  it('isPasswordValid() returns true for a valid password', () => {
    let validPassword = createUserTest.updateField(userRO.USER_PASSWORD, 'testing0%')
    expect(validPassword.isPasswordValid()).toEqual(true)
  })
  it('isPasswordValid() returns false for invalid passwords', () => {
    expect(createUserTest.isPasswordValid()).toEqual(false)
  })
  // Test new password validation
  it('isNewPasswordValid() returns true for a valid password', () => {
    let validNewPassword = createUserTest.updateField(userRO.USER_NEW_PASSWORD, 'testing0%')
    expect(validNewPassword.isNewPasswordValid()).toEqual(true)
  })
  it('isNewPasswordValid() returns true for a missing password', () => {
    let validMissingPassword = createUserTest.updateField(userRO.USER_NEW_PASSWORD, undefined)
    expect(validMissingPassword.isNewPasswordValid()).toEqual(true)
  })
  it('isNewPasswordValid() returns false for invalid passwords', () => {
    expect(createUserTest.isNewPasswordValid()).toEqual(false)
  })
  // Test ReCaptcha Reponse validation
  it('isReCaptchaResponse() returns true for a valid reCaptcha response', () => {
    console.log('EricCheck: ', createUserTest.isReCaptchaResponseValid())
    expect(createUserTest.isReCaptchaResponseValid()).toEqual(true)
  })
  it('isReCaptchaResponse() returns false for missing reCaptcha response', () => {
    let invalidRecaptcha = createUserTest.updateField(userRO.USER_RECAPTCHA_RESPONSE, undefined)
    console.log('EricCheck: ', invalidRecaptcha.isReCaptchaResponseValid())
    expect(invalidRecaptcha.isReCaptchaResponseValid()).toNotExist()
  })
})

// Here's the application (for this test anyway) reducer
const testUserState = combineReducers({ fetchStatus, user: userRO.user })

// Set up the various state constants I'm going to use for testing, which
// are a potential walkthrough of a create/edit/lookup/delete sequence
// I assert I'm still following test independence, because these are
// all set up in advance and not side effects of other tests
const initialState = fromJS({
  fetchStatus: { fetching: false, message: undefined },
  user: {
    current: undefined
  }
}).setIn(userRO.USER_STATE_PATH, new userRO.User())

// State assistance methods for testing - should move to test code
const setUserFetching = (state) => setFetchStart(state, userRO.USER_STATE_PATH)
const clearUserFetching = (state) => setFetchStop(state, userRO.USER_STATE_PATH)

describe('user: testing reducing of asynchronous actions', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  it('returns initial state', () => {
    expect(isd(testUserState(undefined, {}), initialState)).toEqual(true)
  })
  // Create user start state
  const createUserState = userRO.setCurrentUser(initialState, new userRO.User().setNew())
  it('handles createUser successfully', () => {
    expect(isd(testUserState(initialState, createUser()), createUserState)).toEqual(true)
  })
// Login states, starting fetch, success, and failed
  const stateLoginInit = userRO.setCurrentUser(initialState, new userRO.User({ [RO_INIT_DATA]: {username: 'TestUser', password: 'testing'} }))
  const stateLoginStart = setUserFetching(stateLoginInit)
  const stateLoginSuccess = setStatusMessage(userRO.setCurrentUser(initialState, new userRO.User({ [RO_INIT_DATA]: userTestData })), userComponentText.userLogin)
  it('handles loginUser with a successful response', (done) => {
    let store = createStore(testUserState, stateLoginInit, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/login').reply(200, userTestData)
    testAsync(store, stateLoginStart, stateLoginSuccess, done)
    store.dispatch(loginUser())
  })
  it('handles loginUser with an unsuccessful response', (done) => {
    const stateLoginFailed = setErrorMessage(clearUserFetching(stateLoginStart), componentText.invalidCredentials)
    let store = createStore(testUserState, stateLoginInit, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/login').reply(401)
    testAsync(store, stateLoginStart, stateLoginFailed, done)
    store.dispatch(loginUser())
  })
  it('handles updateUser successfully', (done) => {
    const statePreUpdate = userRO.setCurrentUser(initialState,
                           userRO.getCurrentUser(stateLoginSuccess).updateField(userRO.USER_ROLES, 'Admin').setDirty())
    const stateUpdateStart = setUserFetching(statePreUpdate)
    const stateUpdateSuccess = setStatusMessage(clearUserFetching(userRO.setCurrentUser(statePreUpdate,
                               userRO.getCurrentUser(statePreUpdate).clearDirty().updateField(userRO.USER_PASSWORD, undefined))), userComponentText.userUpdated)
    let store = createStore(testUserState, statePreUpdate, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).put('/users/TestUser').reply(200, {})
    testAsync(store, stateUpdateStart, stateUpdateSuccess, done)
    store.dispatch(updateUser())
  })
  it('handles hydrateApp with a successful response', (done) => {
    const stateHydrateStart = setUserFetching(initialState)
    const stateHydrateSuccess = userRO.setCurrentUser(initialState, new userRO.User({ [RO_INIT_DATA]: userTestData }))
    let store = createStore(testUserState, initialState, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/login').reply(200, userTestData)
    testAsync(store, stateHydrateStart, stateHydrateSuccess, done)
    store.dispatch(hydrateApp())
  })
  it('handles editUser successfully', () => {
    let resultState = userRO.setCurrentUser(stateLoginSuccess,
                      userRO.getCurrentUser(stateLoginSuccess).updateField(userRO.USER_NAME, 'Edited').setDirty())
    expect(isd(testUserState(stateLoginSuccess, editUserField('username', 'Edited')), resultState)).toEqual(true)
  })
  let stateRegisterInit = userRO.setCurrentUser(stateLoginSuccess,
                          userRO.getCurrentUser(stateLoginSuccess).updateField(userRO.USER_ID, undefined).setDirty().setNew())
  it('handles registerUser with a successful response and next path', (done) => {
    let resultState = setStatusMessage(setStateTransition(userRO.setCurrentUser(stateRegisterInit,
                      userRO.getCurrentUser(stateRegisterInit).clearDirty().clearNew().updateField(userRO.USER_ROLES, '')), '/cover'), userComponentText.userCreated)
    let store = createStore(testUserState, stateRegisterInit, applyMiddleware(thunkMiddleware))
    const receivedData = { [userRO.user_ID]: userTestData[userRO.USER_ID] }
    nock(process.env.TEST_URL).post('/users').reply(200, receivedData)
    testAsync(store, undefined, resultState, done)
    store.dispatch(registerUser('/cover'))
  })
  it('handles registerUser with an unsuccessful response', (done) => {
    const stateRegisterFailed = setErrorMessage(stateRegisterInit, componentText.invalidRequest)
    let store = createStore(testUserState, stateRegisterInit, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/users').reply(400)
    testAsync(store, undefined, stateRegisterFailed, done)
    store.dispatch(registerUser('email'))
  })
// List user states starting from successful login state
  const stateListUsersStart = stateLoginSuccess.setIn(['user', 'list'], undefined)
                                               .setIn(['fetchStatus', 'fetching'], true)
  it('handles listUsers with a successful response', (done) => {
    const userList = [ { username: 'testing', preferences: {}, user_id: 1 } ]
    const stateUsersListed = stateLoginSuccess.setIn(['user', 'list'],
                             List([]).push(new userRO.User({ [RO_INIT_DATA]: userList[0] })))
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(200, userList)
    testAsync(store, stateListUsersStart, stateUsersListed, done)
    store.dispatch(listUsers())
  })
  it('handles listUsers with an unsuccessful response', (done) => {
    const stateListUsersFailed = setErrorMessage(stateLoginSuccess, componentText.invalidCredentials)
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).get('/users').reply(401)
    testAsync(store, stateListUsersStart, stateListUsersFailed, done)
    store.dispatch(listUsers())
  })
  it('handles logoutUser', (done) => {
    const stateLogoutStart = setUserFetching(stateLoginSuccess)
    const stateLogoutSuccess = setStatusMessage(setStateTransition(initialState, '/home'), userComponentText.userLogout)
    let store = createStore(testUserState, stateLoginSuccess, applyMiddleware(thunkMiddleware))
    nock(process.env.TEST_URL).post('/logout').reply(200, {})
    testAsync(store, stateLogoutStart, stateLogoutSuccess, done)
    store.dispatch(logoutUser())
  })
})

/*
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
*/
