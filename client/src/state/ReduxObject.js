/* ReduxObject.js - Base object for Redux state
   Provides a set of helper functions for shared state of
   a Redux domain object. Intent is to add a 'meta' member
   to a domain object that holds its state relative to the
   server.
   - new      => Exists locally but not in the server
   - dirty    => Different locally than on the server
   - fetching => Server operation on this object is in process
*/

import { Map } from 'immutable'

// Define constant dictionary keys for meta object
export const RO_META = '_meta'
export const RO_DIRTY = 'dirty'
export const RO_NEW = 'new'
export const RO_FETCHING = 'fetching'

// Provide a new meta object as a component for a Redux domain object
function newMeta () {
  return Map({}).set(RO_DIRTY, false)
                .set(RO_NEW, false)
                .set(RO_FETCHING, false)
}

// Add new meta object to a provided domain object
export function addMeta (reduxObj) {
  return reduxObj.set(RO_META, newMeta())
}

// Remove a meta object from a provided domain object
export function deleteMeta (reduxObj) {
  return reduxObj.delete(RO_META)
}

// Return a new Redux object with its dirty state updated
export function setDirty (reduxObj, newState) {
  return reduxObj.setIn([RO_META, RO_DIRTY], newState)
}

// Return a new Redux object with its new state updated
export function setFetching (reduxObj, newState) {
  return reduxObj.setIn([RO_META, RO_FETCHING], newState)
}

// Return a new Redux object with its new state updated
export function setNew (reduxObj, newState) {
  return reduxObj.setIn([RO_META, RO_NEW], newState)
}

// Test if redux object is dirty
export function isDirty (reduxObj) {
  return reduxObj.getIn([RO_META, RO_DIRTY])
}

// Test if redux object is being fetched
export function isFetching (reduxObj) {
  return reduxObj.getIn([RO_META, RO_FETCHING])
}

// Test if redux object is new
export function isNew (reduxObj) {
  return reduxObj.getIn([RO_META, RO_NEW])
}
