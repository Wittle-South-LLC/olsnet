"""Module to handle /login API endpoint"""
import os.path
from connexion import NoContent
from flask_httpauth import HTTPBasicAuth
from flask import g, current_app
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from dm.User import User

# This will be a global constant imported by other APIs
AUTH = HTTPBasicAuth()

@AUTH.login_required
def get():
    """Method to handle GET verb for /login enpoint"""
    token = g.user.generate_auth_token(current_app.config['SECRET_KEY'], 600)
#   token = g.user.generate_auth_token(os.environ['BASE_SECRET_KEY'], 600)
    return {
        'token':token.decode('ascii')
    }, 200

@AUTH.login_required
def search():
    """Method to do something, but I don't know what"""
    token = g.user.generate_auth_token(current_app.config['SECRET_KEY'], 600)
    return {
        'token':token.decode('ascii')
    }, 200

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
    user = g.db_session.query(User).get(data['user_id'])
    return user

# Helper method to verify password
@AUTH.verify_password
def verify_password(username_or_token, password):
    """Method to verify passwords provided as part of API calls"""
    # first try to authenticate by token
    user = verify_auth_token(username_or_token, current_app.config['SECRET_KEY'])
#    user = verify_auth_token(username_or_token, os.environ['SECRET_KEY'])
    if not user:
        # try to authenticate with username/password
        user = g.db_session.query(User).filter(User.username == username_or_token).one_or_none()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    return True
