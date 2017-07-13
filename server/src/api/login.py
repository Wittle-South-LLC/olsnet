"""login.py - Module to handle /login API endpoint"""
import uuid
from flask import abort, current_app, g, jsonify
from flask_jwt_extended import create_access_token, \
     jwt_required, \
     create_refresh_token, set_access_cookies, \
     set_refresh_cookies
from facebook import GraphAPI
from dm.User import User

# Post method for login added 6/27/17 as part of moving from original
# custom token generation scheme using HTTPAuth and basic authentication
# to a JWT authentication method using flask_jwt_extended.
# Modified 7/13/17 to handle facebook login as well
def post(login_data):
    """handles POST verb for /login endpoint"""

    # Need to confirm that either username & password are provided, or 
    # access_token for a Facebook login.
    if ('username' not in login_data or 'password' not in login_data) and 'access_token' not in login_data:
        abort(400, 'Either username/password or access_token are required')
    
    # Get user based on username / password or access_token
    if 'username' in login_data:

        # Look up the user and verify that the password is correct
        user = g.db_session.query(User).filter(User.username == login_data['username']).one_or_none()
        if not user or not user.verify_password(login_data['password']):
            abort(401, 'Invalid Username/Password Combination')

    # This section handles facebook login, and I expect it to be tested manually,
    # so it is explicitly excluded from code coverage metrics
    elif 'access_token' in login_data: # pragma: no cover
        graph = GraphAPI(login_data['access_token'])
        if not graph:
            current_app.logger.debug('Unable to instantiate graph GraphAPI object')
            return 'Unable to instantiate GraphAPI object', 401
        profile = graph.get_object('me?fields=id,name,email,first_name,last_name')
        if not profile:
            current_app.logger.debug('Unable to get profile')
            return 'Unable to get profile for me', 401
        current_app.logger.debug('Cool - got %s', profile)
        if not 'email' in profile:
            return 'Must grant this app privilege to access your e-mail address', 401
        user = g.db_session.query(User)\
                           .filter(User.email == profile['email']).one_or_none()
    # Create the user if it does not exist
        if not user:
            user = User(
                email=profile['email'],
                username=profile['first_name'] + '.' + profile['last_name'],
                user_id=uuid.uuid4().bytes,
                roles='User')
            g.db_session.add(user)
            g.db_session.commit()

    # Now at this point, we should always have a valid user object,
    # whether it came from a Facebook authentication or a normal
    # username / password validation

    # Create access and refresh tokens for the user. See the documentation for
    # flask-jwt-extended for details on these two different kinds of tokens
    access_token = create_access_token(identity=user.username)
    refresh_token = create_refresh_token(identity=user.username)

    # Build the response data by dumping the user data
    resp = jsonify(user.dump())

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
