"""Module to handle /login API endpoint"""
import uuid
from flask import g
from dm.User import User
from flask_jwt_extended import jwt_required

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

@jwt_required
def search():
    """Method to handle GET verb with no URL parameters"""
    user_list = g.db_session.query(User)\
                 .order_by(User.username)\
                 .all()
    ret = []
    for user in user_list:
        ret.append(user.dump())
    return ret, 200

@jwt_required
def delete(username):
    """Method to handle DELETE verb for /users/{username} endpoing"""
    delete_user = g.db_session.query(User).filter(User.username == username).one_or_none()
    if not delete_user:
        return ('Not found', 404)
    g.db_session.delete(delete_user)
    g.db_session.commit()
    return 'User deleted', 204
