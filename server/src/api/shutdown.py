"""shutdown.py - Implements API endpoint for /shutdown"""
from connexion import NoContent
from flask import request

def post(key):
    """Method to handle POST verb for /shutdown API endpoint"""
    if key['key'] == 'Eric':
        shutdown_server()
        return 'Server shutting down...\n'
    else:
        return 'Invalid shutdown key - ' + str(key), 400

# Code here to ensure that the test scripts can shut down
# the server once it is launched
def shutdown_server():
    """Method to shut down the server"""
    func = request.environ.get('werkzeug.server.shutdown')
    func()
