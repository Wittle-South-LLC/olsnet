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
    if 'roles' in user and 'Admin' in user['roles'] and\
       ('NODE_ENV' not in os.environ or os.environ['NODE_ENV'] != 'test'):
        return 'Cannot assign Admin role during user creation', 400 # pragma: no cover
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
            'remoteip': request.remote_addr})   # pragma: no cover
    current_app.logger.debug('Google Post Response Status: ' + str(resp.status_code))
    current_app.logger.debug('Google Post Response JSON: ' + str(resp.json()))
    if resp.status_code >= 400 or not resp.json()['success']:
        return API_RECAPTCHA_FAILS, 401
    current_app.logger.debug('user = ' + str(user))
    new_user = User(
        user_id=uuid.uuid4().bytes,
        username=user['username'],
        email=user['email'],
        first_name=user['first_name'],
        last_name=user['last_name'],
        phone=user['phone'],
        roles=user['roles'],
        source='Local')
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
def search(search_text):
    """Method to handle GET verb with no URL parameters"""
    my_search = '%'
    if search_text:
        my_search = '%' + search_text + '%'
    user_list = g.db_session.query(User)\
                 .filter(User.username.like(my_search))\
                 .order_by(User.username)\
                 .all()
    ret = []
    for user in user_list:
        ret.append(user.dump())
    return ret, 200

@jwt_required
def delete(user_id):
    """Method to handle DELETE verb for /users/{user_id} endpoint"""
    current_app.logger.debug('Delete user called with user_id = ' + user_id)
    binary_uuid = uuid.UUID(user_id).bytes
    delete_user = g.db_session.query(User).filter(User.user_id == binary_uuid).one_or_none()
    if not delete_user:
        return ('Not found', 404)
    g.db_session.delete(delete_user)
    g.db_session.commit()
    return 'User deleted', 204

@jwt_required
def put(user_id, user):
    """Method to handle PUT verb for /users/{user_id} endpoint"""
    binary_uuid = uuid.UUID(user_id).bytes
    update_user = g.db_session.query(User).filter(User.user_id == binary_uuid).one_or_none()
    if not update_user:
        return ('Requested user not found', 404)
    # Allow Admin users to edit others without requiring a current password, 
    # and let Facebook users edit their information without requiring a password, 
    # but everyone else has to include their current password when making an edit
    if not 'Admin' in g.user.roles and\
       not g.user.source == 'Facebook' and\
       not g.user.verify_password(user['password']):
        current_app.logger.debug('/users PUT: rejected missing current password')
        return ('You must provide current password with a user update', 401)
    if update_user.username != g.user.username and not 'Admin' in g.user.roles:
        current_app.logger.debug('/users PUT: rejected update to %s by %s with roles %s' %\
                                 (update_user.username, g.user.username, g.user.roles))
        return ('You are not authorized to modify this user', 401)
    for key, value in user.items():
        if key != 'password' and key != 'newPassword':
            setattr(update_user, key, value)
        elif key == 'newPassword':
            update_user.hash_password(value)
    g.db_session.add(update_user)
    g.db_session.commit()
    return 'User updated', 200

@jwt_required
def get(user_id):
    """Handles GET verb for /users/{user_id} endpoint"""
    binary_uuid = uuid.UUID(user_id).bytes
    find_user = g.db_session.query(User).filter(User.user_id == binary_uuid).one_or_none()
    if not find_user:
        return ('Not found', 404)
    return find_user.dump(), 200
