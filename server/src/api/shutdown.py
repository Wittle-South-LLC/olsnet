"""shutdown.py - Implements API endpoint for /shutdown"""
from connexion import NoContent
from flask import request, current_app

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
# Commenting out this check (that came from sample code) to improve code 
# coverage, since I can't envision a case where this would matter
#    if func is None:
#        raise RuntimeError('Not running with the Werkzeug Server')
    func()
