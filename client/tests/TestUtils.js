/* TestUtils.js - Utilities to make testing less of a pain in the ass */
import { is } from 'immutable'
import React from 'react'
import PropTypes from 'prop-types'
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

// This function combines the fetch start and fetch end testing for
// a given async call. The first state is the expected state of the
// store once fetch starts, and the second is the expected state when
// the fetch ends. This utility function dramatically reduces the
// size of files for testing state.
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

// This function simplifies the automated unit tests for UI components
// that expect to get the redux store via context, and also need the
// various context functions of react-intl.
export function makeTestContext (state, dispatchFunc = undefined, childContextTypes = undefined) {
  let opts = {
    context: {
      dispatch: dispatchFunc,
      reduxState: state,
      intl: {
        formatMessage: (message) => { return undefined },
        formatDate: (date) => { return undefined },
        formatTime: (time) => { return undefined },
        formatNumber: (num) => { return undefined },
        formatRelative: (x) => { return undefined },
        formatPlural: (plural) => { return undefined },
        formatHTMLMessage: (msg) => { return undefined },
        now: () => { return undefined }
      },
      router: {
        route: {
          location: {
            pathname: '/home'
          }
        }
      }
    }
  }
  if (childContextTypes) {
    opts['childContextTypes'] = childContextTypes
  }
  console.log('opts = ', opts)
  return opts
}

// This class creates a simple wrapper that will provide the
// same context members as the main Container class for the
// app. This was added in an attempt to get the render() test
// method to work in test-navigation-Home, since I was unable
// to find a way to get shallow() to work with react-router-4
export class TestContainer extends React.Component {
  // Put the Redux state and dispatch method into context
  getChildContext () {
    return {
      reduxState: undefined,
      dispatch: undefined
    }
  }
  render () {
    return (
      <div>
        { this.props.children }
      </div>
    )
  }
}

TestContainer.childContextTypes = {
  dispatch: PropTypes.func,
  reduxState: PropTypes.object
}
