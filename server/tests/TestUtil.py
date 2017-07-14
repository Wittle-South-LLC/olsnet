"""TestUtil.py - Utility methods for test cases"""
import os.path
import logging
import requests

LOGGER = logging.getLogger()

# Set base URL, which will should only vary by port number
BASE_URL = 'http://localhost:' + os.environ['WEBSERVER_HOST_PORT'] + '/api/v1'

def get_new_session():
    """Sets up a new session object that contains a requests session and a saved csrf token"""
    return {
        'session': requests.session(),
        'csrf_token': None
    }

def log_response_error(resp):
    """Shared method for logging response errors"""
    if resp.status_code >= 400:
        LOGGER.debug('Response text = %s', resp.text)

def get_response_with_jwt(test_session, method, url, payload=None):
    """Returns response for desired method with optional payload, adding JWT auth"""
    # If test_session is defined, then use it, otherwise use requests
    req = test_session['session'] if test_session else requests
    args = {}
    if method == 'PUT' or method == 'POST':
        args['json'] = payload
    if test_session and test_session['csrf_token']:
        LOGGER.debug('get_response_with_JWT setting session CSRF token to: ' +
                     str(test_session['csrf_token']))
        args['headers'] = {'X-CSRF-TOKEN': test_session['csrf_token']}
    LOGGER.debug('args = ' + str(args))
    resp = None
    if method == 'GET':
        resp = req.get(BASE_URL + url, **args)
    elif method == 'PUT':
        resp = req.put(BASE_URL + url, **args)
    elif method == 'POST':
        resp = req.post(BASE_URL + url, **args)
    elif method == 'DELETE':
        resp = req.delete(BASE_URL + url, **args)
    if resp and test_session and \
       not test_session['csrf_token'] and 'csrf_access_token' in resp.cookies:
        test_session['csrf_token'] = resp.cookies['csrf_access_token']
    return resp
