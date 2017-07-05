// userReducer.js
// Note that no-fallthough is turned off for switch statments on action.status
// because of an obsession with code coverage metrics. The default return line
// cannot be reached without un-necessary test cases that would have to be
// written for each individual action in the state machine
import { List, Map } from 'immutable'
import { CREATE_USER, EDIT_USER, LIST_USERS, LOGIN_USER, LOGOUT_USER,
         REGISTER_USER, HYDRATE_APP } from './userActions'
import { newUser, makeUser, updateUserField, USER_ID } from './user'
import { setFetching, setNew, setDirty } from '../ReduxObject'
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
    case HYDRATE_APP:
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

export function user (state = Map({'current': Map({
  username: undefined,
  email: undefined,
  phone: undefined,
  user_id: undefined,
  preferences: Map({}),
  roles: undefined,
  password: undefined})}), action) {
  switch (action.type) {
    case CREATE_USER:
      return Map({'current': newUser()})
    case EDIT_USER:
      return state.set('current', updateUserField(state.get('current'), action.fieldName, action.fieldValue))
    case LOGIN_USER:
      switch (action.status) {
        case FETCH_START: return state.set('current', setFetching(makeUser(action.sendData), true))
        case FETCH_ERROR: return state.set('current', setFetching(state.get('current'), false))
        case FETCH_SUCCESS: return state.set('current', makeUser(action.receivedData))
      }
    case HYDRATE_APP:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state
        case FETCH_ERROR: return state
        case FETCH_SUCCESS:
          return state.set('current', makeUser(action.receivedData))
      }
    case REGISTER_USER:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state.set('current', setFetching(state.get('current'), true))
        case FETCH_ERROR: return state.set('current', setFetching(state.get('current'), false))
        case FETCH_SUCCESS:
          // 7/4/17 - Consciously avoiding saving the user ID returned in success, because the UI
          //          assumes that existance of a user_id implies authentication. At this point, I
          //          don't have a use case for retaining the API of the newly added user in state.
//          return state.set('current', setFetching(setDirty(setNew(updateUserField(state.get('current'), USER_ID, action.receivedData.user_id), false), false), false))
          return state.set('current', setFetching(setDirty(setNew(state.get('current'), false), false), false))
      }
    case LIST_USERS:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state.set('list', undefined)
        case FETCH_ERROR: return state.delete('list')
        case FETCH_SUCCESS:
          let ret = List([])
          for (let u of action.receivedData) { ret = ret.push(makeUser(u)) }
          return state.set('list', ret)
      }
    case LOGOUT_USER:  // eslint-disable-line no-fallthrough
      switch (action.status) {
        case FETCH_START: return state.set('current', setFetching(state.get('current'), true))
        case FETCH_ERROR: return state.set('current', setFetching(state.get('current'), true))
        case FETCH_SUCCESS:
          return state.set('current', setNew(newUser(), false))
      }
    default: return state // eslint-disable-line no-fallthrough
  }
}
