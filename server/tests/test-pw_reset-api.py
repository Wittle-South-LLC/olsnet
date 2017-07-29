#pylint: disable=W0603,C0103,C0121
"""test-pw_reset-api.py - Tests of password reset APIs"""
import datetime
import os.path
import logging
from sqlalchemy import create_engine, exc
from sqlalchemy.orm import sessionmaker
from src.dm.User import User
from TestUtil import get_response_with_jwt, get_new_session,\
                     log_response_error

# Set up logger
LOGGER = logging.getLogger()

# We need a setup session to login in so we have privilege to delete
# the user as part of cleanup. We need a separate test session that
# does not have an access_token or refresh_token to test the lost
# password reset use case
SETUP_SESSION = get_new_session()
TEST_SESSION = get_new_session()

# Need a database connection to get the generated reset code between
# tests, since it is not returned via the API
CONNECT_STRING = os.environ['TEST_CONNECT_STRING']
try:
    ENGINE = create_engine(CONNECT_STRING, pool_recycle=3600)
except exc.SQLAlchemyError: # pragma: no cover
    LOGGER.debug('Caught exception in create_engine: ' + exc.SQLAlchemyError)
try:
    DBSESSION = sessionmaker(bind=ENGINE)
except exc.SQLAlchemyError: # pragma: no cover
    LOGGER.debug('Caught an exception in sessionmaker' + exc.SQLAlchemyError)
LOGGER.debug('We have created a session')

# Need to save the user ID so we can delete it when done
added_user_id = None

def setUp():
    """Set up for tests by creating a new user"""
    global added_user_id
    new_user_json = {
        'username': "reset",
        'password': "reset000",
        'email': "reset@wittle.net",
        'first_name': "Reset",
        'last_name': "User",
        'phone': '9195746655',
        'reCaptchaResponse': 'Dummy',
        'preferences': {'color': 'red'},
        'roles': 'User'
    }
    resp = get_response_with_jwt(None, 'POST', '/users', new_user_json)
    log_response_error(resp)
    assert resp.status_code == 201
    # Save the user ID so we can delete it later
    json = resp.json()
    assert json['user_id']
    added_user_id = json['user_id']

def tearDown():
    """Clean up from tests by deleting the user for this test"""
    global added_user_id
    # Log in with this user with SETUP_SESSION so we have authentication
    # to delete later
    login_json = {
        'username': 'testing',
        'password': 'testing0'
    }
    resp = get_response_with_jwt(SETUP_SESSION, 'POST', '/login', login_json)
    log_response_error(resp)
    assert resp.status_code == 200
    resp = get_response_with_jwt(SETUP_SESSION, 'DELETE', '/users/' + added_user_id)
    log_response_error(resp)
    assert resp.status_code == 204

def test_reset_invalid_email():
    """--> Test add API failure due to invalid email"""
    resp = get_response_with_jwt(None, 'POST', '/pw_reset', {'email': 'john.doe@nowhere.org'})
    assert resp.status_code == 404

def test_reset_start_valid():
    """--> Test getting a reset code that should work"""
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/pw_reset', {'email': 'reset@wittle.net'})
    assert resp.status_code == 200
    LOGGER.debug('refresh_token = ' + TEST_SESSION['session'].cookies['refresh_token_cookie'])
    assert 'refresh_token_cookie' in TEST_SESSION['session'].cookies
    assert 'csrf_refresh_token' in TEST_SESSION['session'].cookies

def test_rest_start_fails_existing_code():
    """--> Test getting a second reset code when existing one has not expired fails"""
    resp = get_response_with_jwt(TEST_SESSION, 'POST', '/pw_reset', {'email': 'reset@wittle.net'})
    assert resp.status_code == 400

def test_reset_fails_email():
    """--> Test that reset fails due to email difference"""
    # Look up reset code and reset expires to the future
    # (We set it to the past in the last test)
    session = DBSESSION()
    user = session.query(User).filter(User.email == 'reset@wittle.net').one_or_none()
    assert user
    reset_json = {
        'email': 'junk@nowhere.com',
        'password': 'reset111',
        'reset_code': user.reset_code
    }
    session.close()
    # Add optional fourth parameter to ensure we send the CSRF refresh token
    resp = get_response_with_jwt(TEST_SESSION, 'PUT', '/pw_reset', reset_json, True)
    assert resp.status_code == 400

def test_refresh_finish_expired_code():
    """--> Test reset API failure due to expired code"""
    # Look up the user in the database and set the reset_expires to now
    session = DBSESSION()
    user = session.query(User).filter(User.email == 'reset@wittle.net').one_or_none()
    assert user
    user.reset_expires = datetime.datetime.now()
    session.add(user)
    session.commit()
    reset_json = {
        'email': 'reset@wittle.net',
        'password': 'reset111',
        'reset_code': user.reset_code
    }
    session.close()
    resp = get_response_with_jwt(TEST_SESSION, 'PUT', '/pw_reset', reset_json, True)
    assert resp.status_code == 400

def test_reset_finish_valid():
    """--> Test reset API success"""
    # Look up reset code and reset expires to the future
    # (We set it to the past in the last test)
    session = DBSESSION()
    user = session.query(User).filter(User.email == 'reset@wittle.net').one_or_none()
    assert user
    LOGGER.debug('1: user.reset_expires = ' + str(user.reset_expires))
    # The below minutes value is a hack because while I set the time zone for the
    # server to America/New York, it is still off by 4 hours from MacOS
    # This should not result in a real issue, because in normal use casese all
    # reading / updating of the reset_expires value will be in the server time zone
    user.reset_expires = datetime.datetime.now() + datetime.timedelta(minutes=315)
    LOGGER.debug('2: user.reset_expires = ' + str(user.reset_expires))
    session.add(user)
    session.commit()
    reset_json = {
        'email': 'reset@wittle.net',
        'password': 'reset111',
        'reset_code': user.reset_code
    }
    session.close()
    # Add optional fourth parameter to ensure we send the CSRF refresh token
    resp = get_response_with_jwt(TEST_SESSION, 'PUT', '/pw_reset', reset_json, True)
    log_response_error(resp)
    assert resp.status_code == 200
    session = DBSESSION()
    new_password_user = session.query(User).filter(User.email == 'reset@wittle.net').one_or_none()
    assert new_password_user.reset_code == None
    assert new_password_user.reset_expires == None
    assert new_password_user.verify_password('reset111')
