"""TestUtil.py - Utility methods for test cases"""
import requests
from requests.auth import HTTPBasicAuth

def get_response_with_auth(method, url, payload=None):
    """Returns response for desired method with optional payload, adding auth"""
    if method == 'GET':
        return requests.get(url, auth=HTTPBasicAuth('testing', 'testing0'))
    if method == 'PUT':
        return requests.put(url, auth=HTTPBasicAuth('testing', 'testing0'), json=payload)
    if method == 'POST':
        return requests.post(url, auth=HTTPBasicAuth('testing', 'testing0'), json=payload)
    if method == 'DELETE':
        return requests.delete(url, auth=HTTPBasicAuth('testing', 'testing0'))
