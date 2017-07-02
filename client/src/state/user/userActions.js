/* userActions.js - User actions */
import { fetchReduxAction, handleDoubleClick } from '../fetchStatus/fetchStatusActions'

export const LOGIN_USER = 'LOGIN_USER'
export const HYDRATE_APP = 'HYDRATE_APP'
export const REGISTER_USER = 'REGISTER_USER'
export const LOOKUP_USER = 'LOOKUP_USER'
export const LOGOUT_USER = 'LOGOUT_USER'
export const LIST_USERS = 'LIST_USERS'

// Should login in a user and populate the user section of state
export function loginUser (username, password, nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/login',
        method: 'POST',
        type: LOGIN_USER,
        sendData: { username, password }
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// Should populate the user section of state for a user that is already
// logged in (has an access token cookie)
export function hydrateApp (nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/login',
        method: 'GET',
        type: HYDRATE_APP,
        sendData: {}
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

export function registerUser (username, password, email, phone, reCaptchaResponse, nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/users',
        method: 'POST',
        type: REGISTER_USER,
        sendData: { username, password, email, phone, reCaptchaResponse }
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// Eric 7/2/17 - Modified to do a post rather than be a synchronous
// action to clear session cookies
export function logoutUser (nextPath = '/home') {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/logout',
        method: 'POST',
        type: LOGOUT_USER,
        sendData: {}
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else {
      return handleDoubleClick(dispatch, nextPath)
    }
  }
}

// Make an asynchronous call to get the list of users if it has not already been fetched
export function listUsers (nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'list'])) {
      let payload = {
        apiUrl: '/users',
        method: 'GET',
        type: LIST_USERS
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}
