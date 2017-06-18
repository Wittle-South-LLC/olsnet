/* test-fetchStatus-state.js - Tests user state */
import { fromJS } from 'immutable'
import { describe, it } from 'mocha'
import { combineReducers } from 'redux-immutable'
import expect from 'expect'
import { isd } from './TestUtils'
import { setMessage, setNewPath, SET_MESSAGE, TRANSITION_TO } from '../src/state/fetchStatus/fetchStatusActions'
import { fetchStatus } from '../src/state/fetchStatus/fetchStatusReducer'

describe('fetchStatus sync actions', () => {
  const statusMessage = 'Status Message'
  const newPath = 'newPath'
  it('should create an action to set a message to a known value', () => {
    const expectedAction = { type: SET_MESSAGE, message: statusMessage, messageType: 'status' }
    expect(setMessage(statusMessage)).toEqual(expectedAction)
  })
  it('should create an action to set new path to a known value', () => {
    const expectedAction = { type: TRANSITION_TO, newPath }
    expect(setNewPath(newPath)).toEqual(expectedAction)
  })
})

// Here's the application (for this test anyway) reducer
const testFetchStatusState = combineReducers({ fetchStatus })

// Set up the various state constants I'm going to use for testing, which
// are a potential walkthrough of a create/edit/lookup/delete sequence
// I assert I'm still following test independence, because these are
// all set up in advance and not side effects of other tests
const initialState = fromJS({
  fetchStatus: { fetching: false, message: undefined }
})
const transtionToState = initialState.setIn(['fetchStatus', 'transitionTo'], '/test')
const setMessageState = initialState.setIn(['fetchStatus', 'message'], 'Message')
                                    .setIn(['fetchStatus', 'messageType'], 'Error')

// Reducer tests - first create test combined reducer, then test this component of its state
describe('fetchStatus: testing reducing of synchronous actions', () => {
  it('returns initial state', () => {
    expect(isd(testFetchStatusState(undefined, {}), initialState)).toEqual(true)
  })
  it('returns initital state for action with no status', () => {
    expect(isd(testFetchStatusState(undefined, { type: 'ANY_ACTION' }), initialState)).toEqual(true)
  })
  it('returns state with a transition to for TRANSITION_TO', () => {
    expect(isd(testFetchStatusState(undefined, setNewPath('/test')), transtionToState)).toEqual(true)
  })
  it('returns state with a message set for SET_MESSAGE', () => {
    expect(isd(testFetchStatusState(undefined, setMessage('Message', 'Error')), setMessageState)).toEqual(true)
  })
})
