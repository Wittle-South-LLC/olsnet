/* fetchStatusReducer.js - reducer for fetch status */
import { Map } from 'immutable'
import { SET_MESSAGE, FETCH_START, FETCH_SUCCESS, FETCH_ERROR,
         TRANSITION_TO, VERB_HYDRATE } from './fetchStatusActions'

export function fetchStatus (state = Map({ fetching: false, message: undefined }), action) {
  if (action.type === SET_MESSAGE) {
    return state.delete('transitionTo')
                .set('message', action.message)
                .set('messageType', action.messageType)
  } else if (action.type === TRANSITION_TO) {
    return state.set('transitionTo', action.newPath)
  } else {
    switch (action.status) {
      case FETCH_START:
        return state.set('fetching', true).delete('transitionTo')
      case FETCH_SUCCESS:
        let newState = state.set('fetching', false)
        if (action.nextPath) {
          newState = newState.set('transitionTo', action.nextPath)
        }
        if (action.successMsg) {
          newState = newState.set('message', action.successMsg)
                             .set('messageType', 'status')
        }
        return newState
      case FETCH_ERROR:
        if (process.env.MESSAGE_LEVEL === 'debug') {
          console.log('FETCH_ERROR being handled with message: ', action.message)
        }
        let errState = state.set('fetching', false)
        if (action.verb !== VERB_HYDRATE) {
          errState = errState.set('message', action.message)
                             .set('messageType', 'error')
        }
        return errState
                    
      default: return state.delete('transitionTo')
    }
  }
}
