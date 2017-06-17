// userReducer.js
// Note that no-fallthough is turned off for switch statments on action.status
// because of an obsession with code coverage metrics. The default return line
// cannot be reached without un-necessary test cases that would have to be
// written for each individual action in the state machine
import { Map, fromJS } from 'immutable'
import { LIST_USERS, LOGIN_USER, LOGOUT_USER, REGISTER_USER } from './userActions'
import { FETCH_START, FETCH_ERROR, FETCH_SUCCESS } from '../fetchStatus/fetchStatusActions'
import { defineMessages } from 'react-intl'

export const componentText = defineMessages({
  userLogout: { id: 'container.userLogout', defaultMessage: 'Logged out successfully' },
  userLogin: { id: 'container.userLogin', defaultMessage: 'Welcome!' },
  userCreated: { id: 'userReducer.userCreated', defaultMessage: 'Registration completed, please log in' }
})

export function userMessage (action) {
  switch (action.type) {
    case LOGOUT_USER:
      return componentText.userLogout
    case LOGIN_USER:
      if (action.status === FETCH_SUCCESS) {
        return componentText.userLogin
      } else {
        break
      }
    case REGISTER_USER:
      if (action.status === FETCH_SUCCESS) {
        return componentText.userCreated
      } else {
        break
      }
  }
}

export function user (state = Map({
  username: undefined,
  email: undefined,
  phone: undefined,
  user_id: undefined,
  preferences: undefined,
  token: undefined }), action) {
  switch (action.type) {
    case LOGIN_USER:
      switch (action.status) {
        case FETCH_START: return state.set('fetchingUser', true).set('username', action.sendData.username)
        case FETCH_ERROR: return state.delete('fetchingUser').set('username', undefined)
        case FETCH_SUCCESS:
          return state.delete('fetchingUser').set('token', action.receivedData.token)
                      .set('email', action.receivedData.email)
                      .set('phone', action.receivedData.phone)
                      .set('user_id', action.receivedData.user_id)
                      .set('preferences', fromJS(action.receivedData.preferences))
      }
    case REGISTER_USER:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state.set('creatingUser', true)
        case FETCH_ERROR: return state.delete('creatingUser')
        case FETCH_SUCCESS:
          return state.delete('creatingUser')
      }
    case LIST_USERS:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state.set('list', undefined)
        case FETCH_ERROR: return state.delete('list')
        case FETCH_SUCCESS:
          return state.set('list', fromJS(action.receivedData))
      }
    case LOGOUT_USER:  // eslint-disable-line no-fallthrough
      return state.delete('list')
                  .set('username', undefined)
                  .set('token', undefined)
                  .set('phone', undefined)
                  .set('email', undefined)
                  .set('user_id', undefined)
                  .set('preferences', undefined)
    default: return state
  }
}
