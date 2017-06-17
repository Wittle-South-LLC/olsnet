/* userActions.js - User actions */
import { fetchReduxAction, handleDoubleClick } from '../fetchStatus/fetchStatusActions'

export const LOGIN_USER = 'LOGIN_USER'
export const REGISTER_USER = 'REGISTER_USER'
export const LOOKUP_USER = 'LOOKUP_USER'
export const LOGOUT_USER = 'LOUGOUT_USER'
export const LIST_USERS = 'LIST_USERS'

export function loginUser (username, password, nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/login',
        method: 'GET',
        type: LOGIN_USER,
        sendData: { username }
      }
      return dispatch(fetchReduxAction(payload, username, password, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

export function registerUser (username, password, email, reCaptchaResponse, nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'fetchingUser'])) {
      let payload = {
        apiUrl: '/users',
        method: 'POST',
        type: REGISTER_USER,
        sendData: { username, password, email, reCaptchaResponse }
      }
      return dispatch(fetchReduxAction(payload, username, password, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

export function logoutUser () {
  return { type: LOGOUT_USER }
}

// Make an asynchronous call to get the list of users if it has not already been fetched
export function listUsers (username, password, nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getState().hasIn(['user', 'list'])) {
      let payload = {
        apiUrl: '/users',
        method: 'GET',
        type: LIST_USERS
      }
      return dispatch(fetchReduxAction(payload, username, password, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}
