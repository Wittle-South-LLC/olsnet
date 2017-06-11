# pylint: disable-msg=C0103
"""test-users-api.py - Tests of users APIs"""
import os.path
import logging
#import requests_mock
from TestUtil import get_response_with_auth

# Set up logger
LOGGER = logging.getLogger()

# Set base URL, which will should only vary by port number
BASE_URL = 'http://localhost:' + os.environ['WEBSERVER_HOST_PORT'] + '/api/v1'

# Have a variable to retain the ID of records added via the API
added_id = -1

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
    assert len(json['user_id']) > 0
    added_id = json['user_id']
