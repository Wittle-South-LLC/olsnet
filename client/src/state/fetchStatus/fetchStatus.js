/* fetchStatus.js - Helper methods for fetchStatus part of state */
import { fromJS } from 'immutable'

export const setFetchStart = (state, path) => state.setIn(['fetchStatus', 'fetching'], true)
                                                   .setIn(path, state.getIn(path).setFetching())
export const setFetchStop = (state, path) => state.setIn(['fetchStatus', 'fetching'], false)
                                                  .setIn(path, state.getIn(path).clearFetching())
export const setStatusMessage = (state, message) => state.setIn(['fetchStatus', 'message'], fromJS(message))
                                                         .setIn(['fetchStatus', 'messageType'], 'status')
export const setErrorMessage = (state, message) => state.setIn(['fetchStatus', 'message'], fromJS(message))
                                                        .setIn(['fetchStatus', 'messageType'], 'error')
export const setStateTransition = (state, path) => state.setIn(['fetchStatus', 'transitionTo'], path)
