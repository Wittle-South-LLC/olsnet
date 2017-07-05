"""login.py - Module to handle /login API endpoint"""
from flask_jwt_extended import create_access_token, \
     jwt_required, \
     create_refresh_token, set_access_cookies, \
     set_refresh_cookies
from flask import g, abort, jsonify
from dm.User import User

# Post method for login added 6/27/17 as part of moving from original
# custom token generation scheme using HTTPAuth and basic authentication
# to a JWT authentication method using flask_jwt_extended.
def post(login_data):
    """handles POST verb for /login endpoint"""

    # Get the username and password from the data posted to the endpoint
    username = login_data['username']
    password = login_data['password']

    # Look up the user and verify that the password is correct
    user = g.db_session.query(User).filter(User.username == username).one_or_none()
    if not user or not user.verify_password(password):
        abort(404, 'Invalid Username/Password Combination')

    # Ensure the user data model object is available in the Flask global object
    g.user = user

    # Create access and refresh tokens for the user. See the documentation for
    # flask-jwt-extended for details on these two different kinds of tokens
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    # Build the response data by dumping the user data
    resp = jsonify(g.user.dump())

    # Set the tokens we created as cookies in the response
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)

    # TODO: Figure out what the server needs to do, if anything, to enable
    # the CSRF cookie to be accessible to via fetch() headers in browser apps.
    # Some documentation implies that the ability to allow this must be granted
    # from the server via headers, but this may be specific to CORS situations,
    # which does not currently apply to this app. The below 3rd parameter to
    # return adds a custom header which is one component of CORS security to
    # allow access to the cookie
    return resp, 200, {'Access-Control-Expose-Headers': 'Set-Cookie, Content-Type'}

# The /login enpoint with the GET verb is intended to be used by client apps
# to reload the user's application data when needed (e.g. after an application
# refresh, or browser restart)
@jwt_required
def search():
    """Handles GET verb for /login endpoint"""
    return jsonify(g.user.dump()), 200
