/* fetchStatusReducer.js - reducer for fetch status */
import { Map } from 'immutable'
import { SET_MESSAGE, FETCH_START, FETCH_SUCCESS, FETCH_ERROR, TRANSITION_TO } from './fetchStatusActions'
import { LOGIN_USER, LOGOUT_USER, REGISTER_USER, HYDRATE_APP } from '../user/userActions'
import { userMessage } from '../user/userReducer'

export function fetchStatus (state = Map({ fetching: false, message: undefined }), action) {
  if (action.type === SET_MESSAGE) {
    return state.delete('transitionTo').set('message', action.message).set('messageType', action.messageType)
  } else if (action.type === TRANSITION_TO) {
    return state.set('transitionTo', action.newPath)
  } else {
    switch (action.status) {
      case FETCH_START:
        return state.set('fetching', true).delete('transitionTo')
      case FETCH_SUCCESS:
        let newState = state.set('fetching', false)
        if (action.type === LOGIN_USER || action.type === REGISTER_USER || action.type === HYDRATE_APP) {
          newState = newState.set('message', userMessage(action)).set('messageType', 'status')
        } else if (action.type === LOGOUT_USER) {
          newState = newState.set('message', userMessage(action))
                             .set('messageType', 'status')
        } else if (process.env.MESSAGE_LEVEL === 'debug') {
          console.log('No success message for action: %s', action.type)
        }
        if (action.nextPath) {
          newState = newState.set('transitionTo', action.nextPath)
        }
        return newState
      case FETCH_ERROR:
        if (process.env.MESSAGE_LEVEL === 'debug') {
          console.log('FETCH_ERROR being handled with message: ', action.message)
        }
        return state.set('fetching', false)
                    .set('message', action.message)
                    .set('messageType', 'error')
      default: return state.delete('transitionTo')
    }
  }
}
