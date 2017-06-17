"""Module to handle /login API endpoint"""
import uuid
# from connexion import NoContent
from flask import g
from dm.User import User
from api.login import AUTH

def post(user):
    """Method to handle POST verb for /user enpoint"""

    # Check if the username is already in use, and if so return an error
    check_user = g.db_session.query(User).filter(User.username == user['username']).one_or_none()
    if check_user is not None:
        return 'User already exists', 400
    new_user = User(
        user_id=uuid.uuid4().bytes,
        username=user['username'],
        email=user['email'],
        phone=user['phone'])
    if 'preferences' in user:
        new_user.preferences = user['preferences']
    new_user.hash_password(user['password'])
    g.db_session.add(new_user)
    g.db_session.commit()
    return {'user_id': uuid.UUID(bytes=new_user.user_id)}, 201

@AUTH.login_required
def search():
    """Method to handle GET verb with no URL parameters"""
    user_list = g.db_session.query(User)\
                 .order_by(User.username)\
                 .all()
    ret = []
    for user in user_list:
        ret.append(user.dump())
    return ret, 200

# Removed 6/17/17 - no use case for a get, user details are returned by login
# We'll need a get, but I wonder what kind of object I need to pass to
# a get method. Hopefully a SQLAchemy object will suffice
#
#@AUTH.login_required
#def get(username):
#    """Method to handle GET verb for /users/{username} endpoint"""
#    find_user = g.db_session.query(User).filter(User.username == username).one_or_none()
#    return find_user.dump() or ('Not found', 404)

@AUTH.login_required
def delete(username):
    """Method to handle DELETE verb for /users/{username} endpoing"""
    delete_user = g.db_session.query(User).filter(User.username == username).one_or_none()
    if not delete_user:
        return ('Not found', 404)
    g.db_session.delete(delete_user)
    g.db_session.commit()
    return 'User deleted', 204
