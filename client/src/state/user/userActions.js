/* userActions.js - User actions */
import { defineMessages } from 'react-intl'
import { VERB_NEW, VERB_EDIT, VERB_CREATE, VERB_UPDATE,
         VERB_DELETE, VERB_LIST, VERB_LOGIN, VERB_LOGOUT, VERB_HYDRATE,
         fetchReduxAction, handleDoubleClick } from '../fetchStatus/fetchStatusActions'
import { USER, getCurrentUser } from './user'

export const componentText = defineMessages({
  userLogout: { id: 'userActions.userLogout', defaultMessage: 'Logged out successfully' },
  userLogin: { id: 'userActions.userLogin', defaultMessage: 'Welcome!' },
  userUpdated: { id: 'userActions.userUpdated', defaultMessage: 'Your information was updated' },
  userCreated: { id: 'userReducer.userCreated', defaultMessage: 'Registration completed, please log in' }
})

export function createUser () {
  return { type: USER, verb: VERB_NEW }
}

export function editUserField (fieldName, fieldValue) {
  return { type: USER, verb: VERB_EDIT, fieldName, fieldValue }
}

// Should login in a user and populate the user section of state
export function loginUser (nextPath = undefined) {
  return (dispatch, getState) => {
    let myUser = getCurrentUser(getState())
    if (!myUser.fetching) {
      let payload = {
        apiUrl: '/login',
        method: 'POST',
        type: USER,
        verb: VERB_LOGIN,
        successMsg: componentText.userLogin,
        sendData: { username: myUser.getUserName(), password: myUser.getUserPassword() }
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// Should login in a user and populate the user section of state
export function loginFacebook (accessToken, nextPath = undefined) {
  return (dispatch, getState) => {
    let myUser = getCurrentUser(getState())
    if (!myUser.fetching) {
      let payload = {
        apiUrl: '/login',
        method: 'POST',
        type: USER,
        verb: VERB_LOGIN,
        successMsg: componentText.userLogin,
        sendData: { access_token: accessToken }
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// Should populate the user section of state for a user that is already
// logged in (has an access token cookie)
export function hydrateApp (nextPath = undefined) {
  return (dispatch, getState) => {
    if (!getCurrentUser(getState()).fetching) {
      let payload = {
        apiUrl: '/login',
        method: 'GET',
        type: USER,
        verb: VERB_HYDRATE,
        sendData: {}
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

export function registerUser (nextPath = undefined) {
  return (dispatch, getState) => {
    let myUser = getCurrentUser(getState())
    if (!myUser.fetching && myUser.new) {
      let payload = {
        apiUrl: '/users',
        method: 'POST',
        type: USER,
        verb: VERB_CREATE,
        successMsg: componentText.userCreated,
        sendData: {
          username: myUser.getUserName(),
          email: myUser.getUserEmail(),
          phone: myUser.getUserPhone(),
          preferences: myUser.getUserPreferences().toJS(),
          roles: myUser.getUserRoles(),
          password: myUser.getUserPassword(),
          reCaptchaResponse: myUser.getReCaptchaResponse()
        }
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// TODO: Determine if this function needs an isFetching check
// prior to issuing the payload. If so, it will be checking
// for a user in a list, since you cannot delete the current
// user
export function deleteUser (username, nextPath = undefined) {
  return (dispatch, getState) => {
    let payload = {
      apiUrl: '/users/' + username,
      method: 'DELETE',
      type: USER,
      verb: VERB_DELETE,
      sendData: { username }
    }
    return dispatch(fetchReduxAction(payload, nextPath))
  }
}

export function updateUser (nextPath = undefined) {
  return (dispatch, getState) => {
    let myUser = getCurrentUser(getState())
    if (!myUser.fetching && myUser.dirty) {
      let payload = {
        apiUrl: '/users/' + myUser.getUserName(),
        method: 'PUT',
        type: USER,
        verb: VERB_UPDATE,
        successMsg: componentText.userUpdated,
        sendData: {
          username: myUser.getUserName(),
          password: myUser.getUserPassword(),
          email: myUser.getUserEmail(),
          phone: myUser.getUserPhone(),
          preferences: myUser.getUserPreferences().toJS(),
          roles: myUser.getUserRoles()
        }
      }
      if (myUser.getNewPassword()) {
        payload.sendData['newPassword'] = myUser.getNewPassword()
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}

// Eric 7/2/17 - Modified to do a post rather than be a synchronous
// action to clear session cookies
export function logoutUser (nextPath = '/home') {
  return (dispatch, getState) => {
    if (!getCurrentUser(getState()).fetching) {
      let payload = {
        apiUrl: '/logout',
        method: 'POST',
        type: USER,
        verb: VERB_LOGOUT,
        successMsg: componentText.userLogout,
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
        type: USER,
        verb: VERB_LIST
      }
      return dispatch(fetchReduxAction(payload, nextPath))
    } else return handleDoubleClick(dispatch, nextPath)
  }
}
