/* fetchStatusActions.js - fetch status actions */
import fetch from 'isomorphic-fetch'
import { defineMessages } from 'react-intl'

export const PRE_FETCH = 'PRE_FETCH'
export const FETCH_START = 'FETCH_START'
export const FETCH_SUCCESS = 'FETCH_SUCCESS'
export const FETCH_ERROR = 'FETCH_ERROR'
export const SET_MESSAGE = 'SET_MESSAGE'
export const TRANSITION_TO = 'TRANSITION_TO'

export const componentText = defineMessages({
  invalidCredentials: { id: 'fetchStatus.InvalidCredentials', defaultMessage: 'Invalid Credentials - please log in with a valid username and password' },
  unknownServerError: { id: 'fetchStatus.UnknownServerError', defaultMessage: 'Unknown Server Error - please log out and refresh application' },
  invalidRequest: { id: 'fetchStatus.InvalidRequest', defaultMessage: 'Erroneous API use, server validation failed' },
  duplicateAdd: { id: 'fetchStatus.duplicateAdd', defaultMessage: 'Key values in this request that should be unique are not' },
  otherFetchError: { id: 'fetchStatus.OtherFetchError', defaultMessage: 'Error fetching information from server - please refresh application' }
})

// Function to set the status message manually where needed
export function setMessage (message, messageType = 'status') {
  return { type: SET_MESSAGE, messageType, message }
}

// Function to set a next path if needed
export function setNewPath (newPath) {
  return { type: TRANSITION_TO, newPath }
}

/* Handle the mechanics of asynchronous fetching, including error checking,
   using the contents of the payload structure. This structure must include the
   following members:
   - apiUrl        => The (relative) url path to call
   - method        => String indicating HTTP method to use (GET, POST, PUT, DELETE)
   - type          => type of action
   - sendData      => Data associated with the action to fetch, sent to server
*/

export function fetchReduxAction (payload, successPath = undefined) {
  return (dispatch, getState) => {
    dispatch(fetchStart(payload.type, payload.sendData))
    let headers
    switch (payload.method) {
      /* GET does not have payloads */
      case 'GET':
        headers = getApiHeaders(payload.method)
        break
      /* PUT, POST, and DELETE all have payloads */
      case 'DELETE':
      case 'PUT':
      case 'POST':
        headers = getApiHeaders(payload.method, JSON.stringify(payload.sendData))
        break
      default:
        throw new Error('fetchReduxAction: Invalid or mssing method in payload')
    }
    // The following is a hack so that we can use relative paths for APIs
    // fetch takes relative paths when executing in the browser (where window
    // is guaranteed to be defined), and requires absolute paths when running
    // in node.js server environments, which is where our tests run. If you
    // change how baseUrl is done for tests, you need to fix the TEST_URL
    // definition in bin/testme as well
    let baseUrl = (typeof window === 'undefined' ||
                   (typeof navigator !== 'undefined' &&
                    navigator.userAgent === 'node.js')) ? 'http://localhost:' + process.env.WEBSERVER_HOST_PORT : ''
    return fetch(baseUrl + '/api/v1' + payload.apiUrl, headers)
      .then(response => checkResponse(payload.method, response))
      .then(json => dispatch(fetchSuccess(payload.type, payload.sendData, json, successPath)))
      .catch(error => dispatch(fetchError(payload.type, payload.sendData, error)))
  }
}

/* Check the response code and throw appropriate & consistent errors that
   can be localized in the UI if desired */
function checkResponse (httpVerb, response) {
  if (response.ok) {
    // The HTTP protocol doesn't allow payload for DELETE verb, so there will be no JSON
    if (httpVerb !== 'DELETE') {
      return response.json()
    } else {
      return undefined
    }
  } else if (response.status === 400) {
    throw componentText.invalidRequest
  } else if (response.status === 401) {
    throw componentText.invalidCredentials
  } else if (response.status === 409) {
    throw componentText.duplicateAdd
  } else if (response.status === 500) {
    throw componentText.unknownServerError
  } else {
    throw componentText.otherFetchError
  }
}

/* Redux action for all fetch starts */
function fetchStart (type, sendData) {
  return { type, status: FETCH_START, sendData }
}

/* Redux action for all fetch errors */
function fetchError (type, sendData, message) {
  return { type, status: FETCH_ERROR, sendData, message }
}

/* Redux action for all fetch successes */
function fetchSuccess (type, sendData, receivedData, nextPath) {
  return { type, status: FETCH_SUCCESS, sendData, receivedData, nextPath }
}

/* Construct the payload argument to fetch given the HTTP method,
   authentication information, and optional body */
function getApiHeaders (httpMethod, body = undefined) {
  const result = {
    'method': httpMethod,
    'headers': {
      'Content-Type': 'application/json'
    },
    'credentials': 'same-origin'
  }
  if (body !== undefined) {
    result['body'] = body
  }
  // The following code looks in the document for cookies to see if the
  // server's CSRF token is available. If so, it adds it as a header
  // to the request, which is required for most operations
  if (typeof document !== 'undefined' && document.cookie) {
    let csrfToken = getCookie('csrf_access_token')
    if (csrfToken) {
      result['headers']['X-CSRF-TOKEN'] = csrfToken
    }
  }
  return result
}

// This function came from one of the answers to a StackOverflow question:
// https://stackoverflow.com/questions/10730362/get-cookie-by-name
// Credit to John S.
// TODO: Test to see if the warnings about unnecessary escapes in
//       the regex are correct.
function getCookie (name) {
  function escape (s) {
    return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1') 
  }
  var match = document.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'))
  return match ? match[1] : null
}

export function handleDoubleClick (dispatch, nextPath) {
  if (nextPath) {
    return dispatch(setNewPath(nextPath))
  } else {
    return Promise.resolve()
  }
}
