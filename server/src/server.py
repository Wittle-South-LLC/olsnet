"""Server.py - Creates API server"""
import os.path
import logging
import connexion
from connexion.resolver import RestyResolver
from flask import request, g, abort
from sqlalchemy import create_engine, event, exc, select
from sqlalchemy.orm import sessionmaker
from dm.base import Base
from dm.User import User

# Define constants
API_REQUIRES_JSON = 'All PUT/POST API requests require JSON, and this request did not'
OTHER_PRECHECK_401 = 'Other 401 response'

# Get the spec file from the environment variable
OPENAPI_SPEC = os.environ['OPENAPI_SPEC']

# Create the connextion-based Flask app, and tell it where to look for API specs
APP = connexion.FlaskApp(__name__, specification_dir='swagger/', swagger_json=True)
FAPP = APP.app

# Add our specific API spec, and tell it to use the Resty resolver to find the
# specific python module to handle the API call by navigating the source tree
# according to the API structure. All API modules are in the "api" directory
APP.add_api(OPENAPI_SPEC, resolver=RestyResolver('api'))

# Get a reference to the logger for the app
LOGGER = FAPP.logger
# Set debug logging
LOGGER.setLevel(logging.DEBUG)
# Set the app into debug mode
FAPP.debug = True

# Get the database connect string from the environment
CONNECT_STRING = os.environ['CONNECT_STRING']
LOGGER.debug('Connect String = ' + CONNECT_STRING)
APPSERVER_PORT = os.environ['APPSERVER_CONTAINER_PORT']
LOGGER.debug('Running on port: ' + APPSERVER_PORT)

# Get the secret key from the environment
FAPP.config['SECRET_KEY'] = os.environ['SECRET_KEY']

# Create database connection and sessionmaker
try:
    ENGINE = create_engine(CONNECT_STRING, pool_recycle=3600)
except exc.SQLAlchemyError:
    LOGGER.debug('Caught exception in create_engine: ' + exc.SQLAlchemyError)
try:
    DBSESSION = sessionmaker(bind=ENGINE)
except exc.SQLAlchemyError:
    LOGGER.debug('Caught an exception in sessionmaker' + exc.SQLAlchemyError)
LOGGER.debug('We have created a session')
try:
    if not ENGINE.dialect.has_table(ENGINE, 'User'):
        Base.metadata.create_all(ENGINE)
except exc.SQLAlchemyError:
    LOGGER.debug('Caught an exception in schema setup' + exc.SQLAlchemyError)

# Need to make sure that the use of the database session is
# scoped to the request to avoid open orm transactions between requests
@FAPP.before_request
def before_request():
    """Method to do work before the request"""
    g.db_session = DBSESSION()
    if (request.method == 'POST' or request.method == 'PUT') and \
        not request.is_json and request.path != '/shutdown':
        if request.path != '/fb_login':
            abort(400, API_REQUIRES_JSON)
        else:
            abort(401, OTHER_PRECHECK_401)

@FAPP.after_request
def after_request(func):
    """Method to do work after the request"""
    g.db_session.close()
    g.auth = None
    return func

# Need to recover if the sql server has closed the connection
# due to a timeout or other reason
@event.listens_for(ENGINE, "engine_connect")
def ping_connection(connection, branch):
    """Method to check if database connection is active """
    if branch:
        return

    save_should_close_with_result = connection.should_close_with_result
    connection.should_close_with_result = False

    try:
        connection.scalar(select([1]))
    except exc.DBAPIError as err:
        if err.connection_invalidated:
            LOGGER.info("Recovering from connection_invalidated")
            connection.scalar(select([1]))
        else:
            raise
    finally:
        connection.should_close_with_result = save_should_close_with_result

# Start the app
APP.run(host='0.0.0.0', port=APPSERVER_PORT)
