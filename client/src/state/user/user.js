/* user.js - state object for a single user
 * Includes data validation methods to use for form validation
 * Also includes update method that returns a new object, as
 * this is intended to be used in place of an immutable Map
 * in Redux state.
*/

import { fromJS, is, Map } from 'immutable'
import { ReduxObject, RO_COPY_FROM, RO_INIT_DATA } from '../ReduxObject'
import baseReducer from '../baseReducer'

// Action constants specific to user objects
export const USER = 'USER'

// define constant dictionary keys for user object
export const USER_NAME = 'username'
export const USER_ID = 'user_id'
export const USER_PHONE = 'phone'
export const USER_EMAIL = 'email'
export const USER_PREFERENCES = 'preferences'
export const USER_ROLES = 'roles'
export const USER_PASSWORD = 'password'
export const USER_NEW_PASSWORD = 'newPassword'
export const USER_RECAPTCHA_RESPONSE = 'reCaptchaResponse'

// Define default state path
export const USER_STATE_PATH = ['user', 'current']

// Validation checks for user fields
const emailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const phoneTest = /^[0-9]{10}$/
const passwordTest = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/

export class User extends ReduxObject {
  constructor (paramObj) {
    super(paramObj)
    // If we're copying from something, start with the new
    // instance having the same data as the old one
    if (paramObj && paramObj.hasOwnProperty(RO_COPY_FROM)) {
      this.data = paramObj.copyFrom.data
    } else {
      this.data = undefined
    }
    // If we're copying from something and applying new data,
    // replace the data from the copied instance with the new data
    if (paramObj && paramObj.hasOwnProperty(RO_INIT_DATA)) {
      this.data = fromJS(paramObj.initData)
    } else if (this.data === undefined) {
      // In this case, create a new empty user
      this.data = Map({}).set(USER_NAME, '')
                         .set(USER_ID, undefined)
                         .set(USER_PHONE, '')
                         .set(USER_EMAIL, '')
                         .set(USER_PREFERENCES, Map({}))
                         .set(USER_ROLES, '')
                         .set(USER_PASSWORD, undefined)
                         .set(USER_NEW_PASSWORD, undefined)
                         .set(USER_RECAPTCHA_RESPONSE, undefined)
    }
  }
  equals (obj) {
    // Get whether the base ReduxObjects are the same
    let ret = ReduxObject.prototype.equals.call(this, obj)
    // If not, we can return false now
    if (!ret) { return ret }
    // If so, then check to see if our data object is identical to the comparison one
    if (this.data === obj.data) { return true }
    // So they are not exactly the same, use is to see if they are functionally the same
    return is(this.data, obj.data)
  }
  // Return a new object copied from this, updated with the provided
  // object
  updateFrom (data) {
    return new User({[RO_COPY_FROM]: this, [RO_INIT_DATA]: data})
  }
  // Return a new object copied from this, with the specified field set to the
  // specified value
  updateField (fieldname, value) {
    return new User({[RO_COPY_FROM]: this, [RO_INIT_DATA]: this.data.set(fieldname, value)})
  }
  // Return a new object after an update succeeds. In this case, we are clearing the
  // password field. During an edit session in the UI, the user must enter a password
  // to ensure they are authorized to change the fields of the user object. Once the edit
  // is complete, we want to clear the password so that when a new edit session starts,
  // the password must be re-entered.
  afterUpdateSuccess () {
    return new User({[RO_COPY_FROM]: this, [RO_INIT_DATA]: this.data.set(USER_PASSWORD, undefined)})
  }
  afterCreateSuccess () {
    return new User({[RO_COPY_FROM]: this, [RO_INIT_DATA]: this.data.set(USER_ROLES, '')})
  }
  // Accessor methods
  getUserName () { return this.data.get(USER_NAME) }
  getUserId () { return this.data.get(USER_ID) }
  getUserPhone () { return this.data.get(USER_PHONE) }
  getUserEmail () { return this.data.get(USER_EMAIL) }
  getUserPreferences () { return this.data.get(USER_PREFERENCES) }
  getUserRoles () { return this.data.get(USER_ROLES) }
  getUserPassword () { return this.data.get(USER_PASSWORD) }
  getNewPassword () { return this.data.get(USER_NEW_PASSWORD) }
  getReCaptchaResponse () { return this.data.get(USER_RECAPTCHA_RESPONSE) }
  // Convenience methods
  hasRole (role) {
    return this.getUserRoles() && this.getUserRoles().indexOf(role) >= 0
  }
  // Validation methods
  isUserNameValid () {
    return this.getUserName() &&
           this.getUserName().length >= 4 &&
           this.getUserName().length <= 32
  }
  isEmailValid () { return this.getUserEmail() && emailTest.test(this.getUserEmail()) }
  isPasswordValid () { return this.getUserPassword() && passwordTest.test(this.getUserPassword()) }
  isNewPasswordValid () { return !this.getNewPassword() || passwordTest.test(this.getNewPassword()) }
  isPhoneValid () { return this.getUserPhone() && phoneTest.test(this.getUserPhone()) }
  isReCaptchaResponseValid () {
    if (this.data.has(USER_RECAPTCHA_RESPONSE) &&
        this.data.get(USER_RECAPTCHA_RESPONSE) !== undefined &&
        this.data.get(USER_RECAPTCHA_RESPONSE).length > 0) { return true } else { return false }
  }
  isNewUserValid () {
    return this.isEmailValid() &&
           this.isPasswordValid() &&
           this.isPhoneValid() &&
           this.isUserNameValid() &&
           this.isReCaptchaResponseValid()
  }
  isEditUserValid () {
    return this.isEmailValid() &&
           this.isPasswordValid() &&
           this.isNewPasswordValid() &&
           this.isPhoneValid() &&
           this.isUserNameValid()
  }
}

// State assistance methods for core application
export const getCurrentUser = (state) => state.getIn(USER_STATE_PATH)
export const setCurrentUser = (state, user) => state.setIn(USER_STATE_PATH, user)

// Reducer
export function user (state = Map({'current': new User()}), action) {
  return action.type === USER
    ? baseReducer(state, action, 'current', User)
    : state
}
