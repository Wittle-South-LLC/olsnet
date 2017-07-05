"""Module to handle /login API endpoint"""
import uuid
import os.path
import requests
from flask import g, current_app, request
from dm.User import User
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import jwt_required

# API constants for Google ReCaptcha APIs
RECAPTCHA_URL = 'https://www.google.com/recaptcha/api/siteverify'
RECAPTCHA_KEY = '6LcUlxgUAAAAAK5wC6dv6XEcJFvtIbmJsFwyE3Hb'
API_RECAPTCHA_FAILS = 'ReCaptcha check failed'

# We need to be able to mock the recaptcha check if we're running
# in unit test mode (NODE_ENV='test').
if 'NODE_ENV' in os.environ and os.environ['NODE_ENV'] == 'test':
    print('We are running in test mode, ReCaptcha checks will be mocked')
    import requests_mock

def post(user):
    """Method to handle POST verb for /user enpoint"""

    # Check if the username is already in use, and if so return an error
    check_user = g.db_session.query(User).filter(User.username == user['username']).one_or_none()
    if check_user is not None:
        return 'User already exists', 409
    # Confirm ReCaptcha is valid
    if 'NODE_ENV' in os.environ and os.environ['NODE_ENV'] == 'test':
        with requests_mock.Mocker(real_http=True) as mock:
            mock.post(RECAPTCHA_URL, json={'success': True})
            resp = requests.post(RECAPTCHA_URL, data={
                'secret': RECAPTCHA_KEY,
                'response': user['reCaptchaResponse'],
                'remoteip': request.remote_addr})
    else:
        resp = requests.post(RECAPTCHA_URL, data={
            'secret': RECAPTCHA_KEY,
            'response': user['reCaptchaResponse'],
            'remoteip': request.remote_addr})
    current_app.logger.debug('Google Post Response Status: ' + str(resp.status_code))
    current_app.logger.debug('Google Post Response JSON: ' + str(resp.json()))
    if resp.status_code >= 400 or not resp.json()['success']:
        return API_RECAPTCHA_FAILS, 401
    new_user = User(
        user_id=uuid.uuid4().bytes,
        username=user['username'],
        email=user['email'],
        phone=user['phone'])
    if 'preferences' in user:
        new_user.preferences = user['preferences']
    new_user.hash_password(user['password'])
    try:
        g.db_session.add(new_user)
        g.db_session.commit()
    except IntegrityError:
        return 'User already exists', 409
    return {'user_id': uuid.UUID(bytes=new_user.user_id)}, 201

@jwt_required
def search():
    """Method to handle GET verb with no URL parameters"""
    user_list = g.db_session.query(User)\
                 .order_by(User.username)\
                 .all()
    ret = []
    for user in user_list:
        ret.append(user.dump())
    return ret, 200

@jwt_required
def delete(username):
    """Method to handle DELETE verb for /users/{username} endpoing"""
    delete_user = g.db_session.query(User).filter(User.username == username).one_or_none()
    if not delete_user:
        return ('Not found', 404)
    g.db_session.delete(delete_user)
    g.db_session.commit()
    return 'User deleted', 204
