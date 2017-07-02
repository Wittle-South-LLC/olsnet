"""logout.py - Module to handle /login API endpoint"""
from flask_jwt_extended import jwt_required, \
     unset_jwt_cookies
from flask import jsonify

@jwt_required
def post():
    """Handles POST verb for /logout endpoint. Should clear auth cookies"""
    resp = jsonify({})
    unset_jwt_cookies(resp)
    return resp, 200
