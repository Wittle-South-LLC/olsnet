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

export function fetchReduxAction (payload, username = undefined, password = undefined, successPath = undefined) {
  return (dispatch, getState) => {
    /* If we didn't get a username and password, it is because we're supposed to get that from state */
    if (username === undefined) {
      username = getState().getIn(['user', 'token'])
      password = 'unused'
    }
    dispatch(fetchStart(payload.type, payload.sendData))
    let headers
    switch (payload.method) {
      /* GET does not have payloads */
      case 'GET':
        headers = getApiHeaders(payload.method, username, password)
        break
      /* PUT, POST, and DELETE all have payloads */
      case 'DELETE':
      case 'PUT':
      case 'POST':
        headers = getApiHeaders(payload.method, username, password, JSON.stringify(payload.sendData))
        break
      default:
        throw new Error('fetchReduxAction: Invalid or mssing method in payload')
    }
    return fetch(process.env.API_ROOT + payload.apiUrl, headers)
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

/* Construct an HTTP basic authentication header given a username and password */
function getAuthstring (username, password) {
  return 'Basic ' +
    Buffer.alloc(unescape(encodeURIComponent(username)) + ':' +
                 unescape(encodeURIComponent(password))).toString('base64')
}

/* Construct the payload argument to fetch given the HTTP method,
   authentication information, and optional body */
function getApiHeaders (httpMethod, username, password, body = undefined) {
  const result = {
    'method': httpMethod,
    'headers': {
      'Authorization': getAuthstring(username, password),
      'Content-Type': 'application/json'
    }
  }
  if (body !== undefined) {
    result['body'] = body
  }
  return result
}

export function handleDoubleClick (dispatch, nextPath) {
  if (nextPath) {
    return dispatch(setNewPath(nextPath))
  } else {
    return Promise.resolve()
  }
}
