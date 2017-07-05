/* user.js - state object for a single user
 * Includes data validation methods to use for form validation
 * Also includes update method that returns a new object, as
 * this is intended to be used in place of an immutable Map
 * in Redux state.
*/

import { Map, fromJS } from 'immutable'
import { addMeta, setDirty, setNew } from '../ReduxObject'

// define constant dictionary keys for user object
export const USER_NAME = 'username'
export const USER_ID = 'user_id'
export const USER_PHONE = 'phone'
export const USER_EMAIL = 'email'
export const USER_PREFERENCES = 'preferences'
export const USER_ROLES = 'roles'
export const USER_PASSWORD = 'password'

// Will return a new User object with Redux object metadata
export function makeUser (dataObj) {
  return addMeta(Map({}).set(USER_NAME, dataObj.hasOwnProperty(USER_NAME) ? dataObj[USER_NAME] : undefined)
                        .set(USER_ID, dataObj.hasOwnProperty(USER_ID) ? dataObj[USER_ID] : undefined)
                        .set(USER_PHONE, dataObj.hasOwnProperty(USER_PHONE) ? dataObj[USER_PHONE] : undefined)
                        .set(USER_EMAIL, dataObj.hasOwnProperty(USER_EMAIL) ? dataObj[USER_EMAIL] : undefined)
                        .set(USER_PREFERENCES, dataObj.hasOwnProperty(USER_PREFERENCES) ? fromJS(dataObj[USER_PREFERENCES]) : Map({}))
                        .set(USER_ROLES, dataObj.hasOwnProperty(USER_ROLES) ? dataObj[USER_ROLES] : undefined)
                        .set(USER_PASSWORD, dataObj.hasOwnProperty(USER_PASSWORD) ? dataObj[USER_PASSWORD] : undefined))
}

// Will create a new user
export function newUser () {
  return setNew(addMeta(Map({}).set(USER_NAME, undefined)
                               .set(USER_ID, undefined)
                               .set(USER_PHONE, undefined)
                               .set(USER_EMAIL, undefined)
                               .set(USER_PREFERENCES, Map({}))
                               .set(USER_ROLES, undefined))
                               .set(USER_PASSWORD, undefined))
}

// Updates a field with a value if it exists and sets the objec to dirty
export function updateUserField (userObj, field, value) {
  return userObj.has(field) ? setDirty(userObj.set(field, value), true) : userObj
}

// Getter methods for user object fields
export const getUserName = (userObj) => userObj.get(USER_NAME)
export const getUserEmail = (userObj) => userObj.get(USER_EMAIL)
export const getUserId = (userObj) => userObj.get(USER_ID)
export const getUserPhone = (userObj) => userObj.get(USER_PHONE)
export const getUserPreferences = (userObj) => userObj.get(USER_PREFERENCES)
export const getUserRoles = (userObj) => userObj.get(USER_ROLES)
export const getUserPassword = (userObj) => userObj.get(USER_PASSWORD)

// Validation checks for user fields
const emailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const phoneTest = /^[0-9]{10}$/
const passwordTest = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/

// Note that checks here should match checks defined in the API specification
export const isUserNameValid = (userObj) => getUserName(userObj) && getUserName(userObj).length >= 4 && getUserName(userObj).length <= 32
export const isEmailValid = (userObj) => emailTest.test(getUserEmail(userObj))
export const isPhoneValid = (userObj) => phoneTest.test(getUserPhone(userObj))
export const isPasswordValid = (userObj) => getUserPassword(userObj) && passwordTest.test(getUserPassword(userObj))
export const isUserValid = (userObj) => isUserNameValid(userObj) &&
                                        isEmailValid(userObj) &&
                                        isPhoneValid(userObj) &&
                                        isPasswordValid(userObj)
