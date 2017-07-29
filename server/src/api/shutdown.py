"""shutdown.py - Implements API endpoint for /shutdown"""
from flask import request
from util.api_util import api_error

def post(key):
    """Method to handle POST verb for /shutdown API endpoint"""
    if key['key'] == 'Eric':
        shutdown_server()
        return 'Server shutting down...\n'
    return api_error(400, 'INVALID_SHUTDOWN_KEY', key)

# Code here to ensure that the test scripts can shut down
# the server once it is launched
def shutdown_server():
    """Method to shut down the server"""
    func = request.environ.get('werkzeug.server.shutdown')
    func()
