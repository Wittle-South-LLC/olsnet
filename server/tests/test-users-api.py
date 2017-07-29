# pylint: disable-msg=C0103,W0603
# Note about pylint disables - pylint thinks my globals are constants,
# and they're not, so disabling C0103. It also doesn't like globals,
# which I don't care much about because I want to use them here in my
# tests.
"""test-users-api.py - Tests of users APIs"""
import logging
from TestUtil import get_response_with_jwt, get_new_session,\
                     log_response_error

# Set up logger
LOGGER = logging.getLogger()

# Have a variable to retain the ID of records added via the API
added_id = -1
testing_id = -1

# Ensure we can run tests against a session where needed
TEST_SESSION = get_new_session()

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
        'first_name': 'Tal',
        'last_name': 'Lewin Wittle',
        'phone': '9194753337',
        'reCaptchaResponse': 'Dummy',
        'preferences': {'color': 'red'},
        'roles': 'User'
    }
    resp = get_response_with_jwt(None, 'POST', '/users', user_json)
    log_response_error(resp)
    assert resp.status_code == 201
    json = resp.json()
    assert json['user_id']
    added_id = json['user_id']

def test_login_fail_jwt():
    """--> Test login returns 401 for invalid username/password"""
    bad_login = {'username': 'badboy', 'password': 'loginfail0'}
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/login', bad_login)
    log_response_error(resp)
    assert resp.status_code == 401

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
    assert json['email'] == 'test@wittle.net'
    assert json['phone'] == '9199999999'
    assert json['user_id']
    global testing_id
    testing_id = json['user_id']
    assert json['username'] == 'testing'
    assert json['roles'] == 'Admin'
    assert json['source'] == 'Local'
    assert 'preferences' in json

def test_rehydrate():
    """--> Test application rehydrate for authenticated user"""
    # Note that this assumes that test_initial_login_jwt() succeeds
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/login')
    log_response_error(resp)
    json = resp.json()
    assert json['email'] == 'test@wittle.net'
    assert json['first_name'] == 'Test'
    assert json['last_name'] == 'User'
    assert json['phone'] == '9199999999'
    assert json['user_id']
    assert json['username'] == 'testing'
    assert 'preferences' in json

def test_update_user_success():
    """--> Update a user from a different user with Admin role"""
    update_data = {
        "username": "talw",
        'password': "testing0",
        "email": "talw@wittle.net",
        "phone": "9197776666"
    }
    resp = get_response_with_jwt(TEST_SESSION, 'PUT', '/users/' + added_id, update_data)
    log_response_error(resp)
    assert resp.status_code == 200
    resp2 = get_response_with_jwt(TEST_SESSION, 'GET', '/users/' + added_id)
    log_response_error(resp2)
    assert resp2.status_code == 200
    assert resp2.json()['phone'] == '9197776666'

# Note that these tests are after the rest because they will
# clear the global CSRF token used by TEST_SESSION
def test_self_update():
    """--> Update the same user that is authenticated"""
    # Use a new session
    my_session = get_new_session()
    # Login in with talw
    login_data = {'username': 'talw', 'password': 'testing1'}
    resp1 = get_response_with_jwt(my_session, 'POST', '/login', login_data)
    log_response_error(resp1)
    assert resp1.status_code == 200
    assert 'csrf_access_token' in resp1.cookies
    update_data = {
        "username": "talw",
        "password": "testing1",
        "email": "talw@wittle.net",
        "phone": "9109999999",
        "newPassword": "testing3"
    }
    resp2 = get_response_with_jwt(my_session, 'PUT', '/users/' + added_id, update_data)
    assert resp2.status_code == 200
    log_response_error(resp2)
    resp3 = get_response_with_jwt(my_session, 'GET', '/users/' + added_id)
    log_response_error(resp3)
    assert resp3.json()['phone'] == '9109999999'

def test_unauthorized_update():
    """--> Test that a user without Admin role cannot update another user"""
    # Use a new session
    new_session = get_new_session()
    # Login with talw
    login_data = {'username': 'talw', 'password': 'testing3'}
    resp1 = get_response_with_jwt(new_session, 'POST', '/login', login_data)
    log_response_error(resp1)
    assert resp1.status_code == 200
    assert 'csrf_access_token' in resp1.cookies
    update_data = {
        'username': 'testing',
        'password': 'testing1',
        "email": "talw@wittle.net",
        'phone': 'This should not work'
    }
    resp2 = get_response_with_jwt(new_session, 'PUT', '/users/' + testing_id, update_data)
    assert resp2.status_code == 401

def test_update_invalid_password():
    """--> Test update with incorrect password for logged in user"""
    # Use a new session
    new_session = get_new_session()
    login_data = {'username': 'talw', 'password': 'testing3'}
    resp1 = get_response_with_jwt(new_session, 'POST', '/login', login_data)
    log_response_error(resp1)
    assert resp1.status_code == 200
    assert 'csrf_access_token' in resp1.cookies
    update_data = {
        'username': 'testing',
        'password': 'nowaynohow',
        'email': 'junkoland@wittle.net',
        'phone': 'it does not matter'
    }
    resp = get_response_with_jwt(new_session, 'PUT', '/users/' + testing_id, update_data)
    assert resp.status_code == 401

def test_user_list():
    """--> Test list users"""
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/users?search_text=')
    log_response_error(resp)
    assert resp.status_code == 200
    LOGGER.debug('Response text = %s', resp.text)
    json = resp.json()
    LOGGER.debug('Response json = %s', str(json))
    assert len(json) > 1
    assert json[0]['username'] == 'talw'
    assert json[1]['username'] == 'testing'

def test_user_list_with_query():
    """--> Test list users"""
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/users?search_text=tal')
    log_response_error(resp)
    assert resp.status_code == 200
    LOGGER.debug('Response text = %s', resp.text)
    json = resp.json()
    LOGGER.debug('Response json = %s', str(json))
    assert len(json) == 1
    assert json[0]['username'] == 'talw'

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
    assert resp.status_code == 400

def test_lookup_invalid_user():
    """--> Test looking up an invalid user (code coverage)"""
    resp = get_response_with_jwt(TEST_SESSION, 'GET', '/users/e1ca7ec1-c7a1-49be-b60c-90c3b7281512')
    assert resp.status_code == 404

def test_update_invalid_user():
    """--> Test updating an invalid user (code coverage)"""
    update_data = {
        'username': 'xxxx',
        'password': 'xxxxxxxx',
        'phone': '9999999999',
        'email':'zxxxx'
    }
    resp = get_response_with_jwt(TEST_SESSION, 'PUT',
                                 '/users/e1ca7ec1-c7a1-49be-b60c-90c3b7281512', update_data)
    assert resp.status_code == 404

def test_delete_invalid_user():
    """ --> Test deleting an indvalid user (code coverage)"""
    resp = get_response_with_jwt(TEST_SESSION, 'DELETE',
                                 '/users/e1ca7ec1-c7a1-49be-b60c-90c3b7281512')
    assert resp.status_code == 404

def test_delete_user():
    """--> Test deleting a user"""
    resp = get_response_with_jwt(TEST_SESSION, 'DELETE', '/users/' + added_id)
    log_response_error(resp)
    assert resp.status_code == 204

def test_logout():
    """--> Test logging out of session"""
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/logout', {})
    log_response_error(resp)
    LOGGER.debug('TEST_SESSION.cookies = ' + str(TEST_SESSION['session'].cookies))
    assert resp.status_code == 200
    assert 'csrf_access_token' not in TEST_SESSION['session'].cookies
    assert 'access_token_cookie' not in TEST_SESSION['session'].cookies
    assert 'refresh_token_cookie' not in TEST_SESSION['session'].cookies
