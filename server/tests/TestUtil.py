"""TestUtil.py - Utility methods for test cases"""
import os.path
import logging
import requests

LOGGER = logging.getLogger()

# Set base URL, which will should only vary by port number
BASE_URL = 'http://localhost:' + os.environ['WEBSERVER_HOST_PORT'] + '/api/v1'

# Establish the CSRF token store
csrf_token = None

def set_csrf_token(token):
    """Sets a global CSRF token to enable CSRF headers for requests in the same session"""
    global csrf_token
    csrf_token = token

def clear_csrf_token():
    """Clears the current CSRF token and returns it (for safekeeping)"""
    global csrf_token
    ret = csrf_token
    csrf_token = None
    return ret

def log_response_error(resp):
    """Shared method for logging response errors"""
    if resp.status_code >= 400:
        LOGGER.debug('Response text = %s', resp.text)

def get_response_with_jwt(test_session, method, url, payload=None):
    """Returns response for desired method with optional payload, adding JWT auth"""
    # If test_session is defined, then use it, otherwise use requests
    req = test_session if test_session else requests
    args = {}
    if method == 'PUT' or method == 'POST':
        args['json'] = payload
    if test_session and csrf_token:
        LOGGER.debug('get_response_with_JWT setting session CSRF token to: ' + str(csrf_token))
        args['headers'] = {'X-CSRF-TOKEN': csrf_token}
    LOGGER.debug('args = ' + str(args))
    if method == 'GET':
        return req.get(BASE_URL + url, **args)
    elif method == 'PUT':
        return req.put(BASE_URL + url, **args)
    elif method == 'POST':
        return req.post(BASE_URL + url, **args)
    elif method == 'DELETE':
        return req.delete(BASE_URL + url, **args)
    return None
