# pylint: disable-msg=C0103
"""test-users-api.py - Tests of users APIs"""
import os.path
import logging
import requests
from requests.auth import HTTPBasicAuth
#import requests_mock
from TestUtil import get_response_with_auth

# Set up logger
LOGGER = logging.getLogger()

# Set base URL, which will should only vary by port number
BASE_URL = 'http://localhost:' + os.environ['WEBSERVER_HOST_PORT'] + '/api/v1'

# Have a variable to retain the ID of records added via the API
added_id = -1
token = None

def test_user_add_no_json():
    """--> Test add API failure due to no json"""
    resp = get_response_with_auth('POST', BASE_URL + '/users')
    if resp.status_code >= 400:
        LOGGER.debug('Response Text: %s', resp.text)
    assert resp.status_code == 400

def test_user_add_no_username():
    """--> Test add API failure due to json with missing username"""
    user_json = {'preferences': {'color': 'red'}}
    resp = get_response_with_auth('POST', BASE_URL + '/users', user_json)
    if resp.status_code >= 400:
        LOGGER.debug('Response Text: %s', resp.text)
    assert resp.status_code == 400

def test_user_add_api_success():
    """--> Test add API success"""
    #pylint: disable=W0603
    global added_id
    user_json = {
        'username': "talw",
        'password': "testing1",
        'email': "tal@wittle.net",
        'phone': '9194753336',
        'reCaptchaResponse': 'Dummy',
        'preferences': {'color': 'red'}
    }
    resp = get_response_with_auth('POST', BASE_URL + '/users', user_json)
    if resp.status_code >= 400:
        LOGGER.debug('Response text = %s', resp.text)
    assert resp.status_code == 201
    json = resp.json()
    assert json['user_id']
    added_id = json['user_id']

def test_get_token():
    """--> Test get a user token"""
    #pylint: disable=W0603
    global token
    resp = get_response_with_auth('GET', BASE_URL + '/login')
    if resp.status_code >= 400:
        LOGGER.debug('Response text = %s', resp.text)
    json = resp.json()
    assert json['token']
    token = json['token']

def test_get_user_with_token():
    """--> Test get user information by authenticating with a token"""
    url = BASE_URL + '/users/talw'
    LOGGER.debug('Attempting to authenticate with %s', token)
    resp = requests.get(url, auth=HTTPBasicAuth(token, 'x'))
    if resp.status_code >= 400:
        LOGGER.debug('Response text = %s', resp.text)
    assert resp.status_code == 200

def test_get_user_with_old_token():
    """--> Test get user information by authenticating with an old token"""
    url = BASE_URL + '/users/talw'
    resp = requests.get(url, auth=HTTPBasicAuth('c056c7d1-5366-4ee4-a27d-8c6356e9ebe2', 'x'))
    LOGGER.debug('Return code: ' + str(resp.status_code))
    assert resp.status_code == 401 or resp.status_code == 404

def test_shutdown_bad_key():
    """--> Test shutdown with bad key for code coverage"""
    resp = get_response_with_auth('POST', BASE_URL + '/shutdown', {'key': 'Junk'})
    assert resp.status_code == 400

def test_add_duplicate_user():
    """--> Test adding a duplicate user for code coverage"""
    user_json = {
        'username': "talw",
        'password': "testing1",
        'email': "tal@wittle.net",
        'phone': '9194753336',
        'reCaptchaResponse': 'Dummy',
        'preferences': {'color': 'red'}
    }
    resp = get_response_with_auth('POST', BASE_URL + '/users', user_json)
    assert resp.status_code == 400

