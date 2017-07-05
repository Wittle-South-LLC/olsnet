# pylint: disable-msg=C0103
"""test-users-api.py - Tests of users APIs"""
import logging
import requests
#import requests_mock
from TestUtil import get_response_with_jwt, set_csrf_token, \
                     log_response_error

# Set up logger
LOGGER = logging.getLogger()

# Have a variable to retain the ID of records added via the API
added_id = -1

# Ensure we can run tests against a session where needed
TEST_SESSION = requests.session()

def test_user_add_no_json():
    """--> Test add API failure due to no json"""
    resp = get_response_with_jwt(None, 'POST', '/users')
    assert resp.status_code == 400

def test_user_add_no_username():
    """--> Test add API failure due to json with missing username"""
    user_json = {'preferences': {'color': 'red'}}
    resp = get_response_with_jwt(None, 'POST', '/users', user_json)
    assert resp.status_code == 400

def test_user_add_api_success():
    """--> Test add API success"""
    #pylint: disable=W0603
    global added_id
    user_json = {
        'username': "talw",
        'password': "testing1",
        'email': "tal@wittle.net",
        'phone': '9194753337',
        'reCaptchaResponse': 'Dummy',
        'preferences': {'color': 'red'}
    }
    resp = get_response_with_jwt(None, 'POST', '/users', user_json)
    log_response_error(resp)
    assert resp.status_code == 201
    json = resp.json()
    assert json['user_id']
    added_id = json['user_id']

def test_login_fail_jwt():
    """--> Test login returns 404 for invalid username/password"""
    bad_login = {'username': 'badboy', 'password': 'loginfail0'}
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/login', bad_login)
    log_response_error(resp)
    assert resp.status_code == 404

def test_initial_login_jwt():
    """--> Test initial user login with JWT"""
    login_data = {
        'username': 'testing',
        'password': 'testing0'
    }
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/login', login_data)
    log_response_error(resp)
    json = resp.json()
    assert 'csrf_access_token' in resp.cookies
    set_csrf_token(resp.cookies['csrf_access_token'])
    assert json['email'] == 'test@wittle.net'
    assert json['phone'] == '9199999999'
    assert json['user_id']
    assert json['username'] == 'testing'
    assert 'preferences' in json

def test_rehydrate():
    """--> Test application rehydrate for authenticated user"""
    # Note that this assumes that test_initial_login_jwt() succeeds
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/login')
    log_response_error(resp)
    json = resp.json()
    assert json['email'] == 'test@wittle.net'
    assert json['phone'] == '9199999999'
    assert json['user_id']
    assert json['username'] == 'testing'
    assert 'preferences' in json

def test_user_list_with_token():
    """--> Test list users"""
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/users')
    log_response_error(resp)
    assert resp.status_code == 200
    LOGGER.debug('Response text = %s', resp.text)
    json = resp.json()
    LOGGER.debug('Response json = %s', str(json))
    assert len(json) > 1
    assert json[0]['username'] == 'talw'
    assert json[1]['username'] == 'testing'

def test_shutdown_bad_key():
    """--> Test shutdown with bad key for code coverage"""
    resp = get_response_with_jwt(None, 'POST', '/shutdown', {'key': 'Junk'})
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
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/users', user_json)
    assert resp.status_code == 409

def test_delete_user():
    """--> Test deleting a user"""
    resp = get_response_with_jwt(TEST_SESSION, 'DELETE', '/users/talw')
    log_response_error(resp)
    assert resp.status_code == 204

def test_logout():
    """--> Test logging out of session"""
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/logout', {})
    log_response_error(resp)
    LOGGER.debug('TEST_SESSION.cookies = ' + str(TEST_SESSION.cookies))
    assert resp.status_code == 200
    assert 'csrf_access_token' not in TEST_SESSION.cookies
    assert 'access_token_cookie' not in TEST_SESSION.cookies
    assert 'refresh_token_cookie' not in TEST_SESSION.cookies
