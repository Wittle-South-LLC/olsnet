"""Module to handle /login API endpoint"""
from connexion import NoContent
import uuid
from flask_httpauth import HTTPBasicAuth
from flask import g, current_app
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from dm.User import User

# This will be a global constant imported by other APIs
AUTH = HTTPBasicAuth()

@AUTH.login_required
def search():
    """Method to do something, but I don't know what"""
    token = g.user.generate_auth_token(current_app.config['SECRET_KEY'], 600)
    # Dump the attributes of the current logged in user as a dict
    ret = g.user.dump()
    # Add the token just created to the user dict and return it
    ret['token'] = token.decode('ascii')
    return ret, 200

# Helper method to verify tokens
def verify_auth_token(token, secret_key):
    """Method to verify authorizing tokens from incoming requests"""
    ser = Serializer(secret_key)
    try:
        data = ser.loads(token)
    except SignatureExpired:
        return None    # valid token, but expired
    except BadSignature:
        return None    # invalid token
    user = g.db_session.query(User).get(uuid.UUID(data['user_id']).bytes)
    return user

# Helper method to verify password
@AUTH.verify_password
def verify_password(username_or_token, password):
    """Method to verify passwords provided as part of API calls"""
    # first try to authenticate by token
    user = verify_auth_token(username_or_token, current_app.config['SECRET_KEY'])
    if not user:
        # try to authenticate with username/password
        user = g.db_session.query(User).filter(User.username == username_or_token).one_or_none()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    return True
