"""pw_reset.py - Module to handle /pw_reset endpoint"""
import uuid
import datetime
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app, g, make_response
from flask_jwt_extended import jwt_refresh_token_required, get_jwt_identity,\
                               create_refresh_token, set_refresh_cookies
from dm.User import User
from util.api_util import api_error

# Error response constants
EMAIL_NOT_FOUND = 'Email not found'
RESET_CODE_CURRENT = 'There is already a valid reset code for this user'
RESET_CODE_INVALID_OR_EXIRED = 'The reset code provided is invalid or expired'
RESET_EMAIL_MISMATCH = 'The email provided for reset does not match the email of the user'

def post(reset_start):
    """Method to handle POST verb for /pw_reset enpoint"""
    # Look up the user by user ID
    reset_user = g.db_session.query(User).filter(User.email == reset_start['email']).one_or_none()
    # If not found, respond with a 404
    if not reset_user:
        return api_error(404, 'EMAIL_NOT_FOUND', reset_start['email'])
    # If found, check if the user already has a reset code that has not expired, and if so
    # return an error 400
    if reset_user.reset_code != None and reset_user.reset_expires > datetime.datetime.now():
        return api_error(400, 'RESET_CODE_CURRENT')
    # Assign a reset code and expiration timestamp
    reset_user.reset_code = str(random.randint(100000, 999999))
    reset_user.reset_expires = datetime.datetime.now() + datetime.timedelta(minutes=15)
    current_app.logger.debug('pw_reset POST - the reset code for ' + \
                              reset_user.username + ' is ' + reset_user.reset_code)
    g.db_session.add(reset_user)
    g.db_session.commit()
    # Need to put the email sending here
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'OurLifeStories.net Password Reset Code'
    msg['From'] = 'service@ourlifestories.net'
    msg['To'] = reset_start['email']
    msg.attach(MIMEText("Here is your reset code: " + reset_user.reset_code, 'plain'))
    msg.attach(MIMEText("<html><head></head><body>Here is your reset code: <strong>" +
                        reset_user.reset_code + "</strong></body></html>", 'html'))
    server = smtplib.SMTP('mail.ourlifestories.net')
    server.sendmail(msg['From'], msg['To'], msg.as_string())

    # Add a refresh token (not an access_token) so that we confirm that the identity we generated
    # the reset code for is the same as the one using the reset code. Possibly redundant, but may
    # prevent database lookup DOS attacks with the actual reset endpoint (?)
    resp = make_response('Reset code sent!', 200)
    refresh_token = create_refresh_token(identity=reset_user.get_uuid())
    set_refresh_cookies(resp, refresh_token)
    return resp

@jwt_refresh_token_required
def put(reset_finish):
    """Method to handle PUT verb for /pw_reset endpoint"""
    user_id = get_jwt_identity()
    current_app.logger.debug('pw_reset PUT - Have identity = ' + str(user_id))
    reset_user = g.db_session.query(User)\
                  .filter(User.user_id == uuid.UUID(user_id).bytes).one_or_none()
    # Do not need to check if the user exists here, because the refresh token required should
    # ensure that this is a valid identity
    #
    # Check to confirm the reset code provided matches the stored one, and that it has not
    # expired
    if reset_user.reset_code != reset_finish['reset_code'] or\
       reset_user.reset_expires < datetime.datetime.now():
        current_app.logger.debug('reset_user.reset_code = ' + reset_user.reset_code)
        current_app.logger.debug('reset_finish[reset_code] = ' + reset_finish['reset_code'])
        current_app.logger.debug('reset_user.reset_expires = ' + str(reset_user.reset_expires))
        current_app.logger.debug('datetime.datetime.now() = ' + str(datetime.datetime.now()))
        return api_error(400, 'RESET_CODE_INVALID_OR_EXIRED')
    # Confirm the provided email matches the user that we're updating
    if reset_user.email != reset_finish['email']:
        return api_error(400, 'RESET_EMAIL_MISMATCH')
    # Now reset the user's password
    reset_user.hash_password(reset_finish['password'])
    reset_user.reset_code = None
    reset_user.reset_expires = None
    g.db_session.add(reset_user)
    g.db_session.commit()
    return 'Password reset!', 200
