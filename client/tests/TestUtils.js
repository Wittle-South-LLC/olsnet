/* TestUtils.js - Utilities to make testing less of a pain in the ass */
import { is } from 'immutable'
var diff = require('immutablediff')

// Goal here is to check to see if two given immutable objects are identical
// using stock is function, and if not automatically log the differences
export function isd (from, to) {
  let result = is(from, to)
  if (!result) {
    try {
      let d = diff(from, to)
      console.log(d.toJS())
    } catch (e) {
      console.log('TestUtils NOTE: Caught exception in diff', e, result)
      console.log('from = ', from.toJS())
      console.log('to   = ', to.toJS())
    }
  }
  return result
}

export function testAsync (store, firstState, secondState, done) {
  let firstUpdate = true
  let unsubscribe = store.subscribe(() => {
    if (firstUpdate) {
      if (!isd(store.getState(), firstState)) {
        done(new Error('Difference in FETCH_START - check inline'))
      }
      firstUpdate = false
    } else {
      unsubscribe()
      if (!isd(store.getState(), secondState)) {
        done(new Error('Difference in completed fetch - check inline'))
      } else {
        done()
      }
    }
  })
}
