"""User.py - Module containing the user classes for the data model"""
import uuid
from sqlalchemy import Column, DateTime, JSON, String
from sqlalchemy.dialects.mysql import BINARY
from passlib.apps import custom_app_context as pwd_context
from .base import Base

class User(Base):
    """Data model object representing application user"""
    __tablename__ = 'User'
    __table_args__ = {'mysql_charset':'utf8'}
    user_id = Column(BINARY(16), primary_key=True)
    username = Column(String(32), index=True, unique=True)
    email = Column(String(80), index=True, unique=True)
    phone = Column(String(20), index=True, unique=True)
    password_hash = Column(String(128))
    preferences = Column(JSON)
    roles = Column(String(120)) # Comma separated list of roles
    source = Column(String(32)) # One of Local, Facebook currently
    reset_code = Column(String(6)) # Code for resetting password
    reset_expires = Column(DateTime) # Expiration timestamp for refresh code
    first_name = Column(String(80)) # User first name
    last_name = Column(String(80)) # User last name

    def get_uuid(self):
        """Returns the text version of the UUID, the binary version is stored in the database"""
        return str(uuid.UUID(bytes=self.user_id))

    def dump(self):
        """Returns dictionary of fields and values"""
        ret = {}
        for key, value in vars(self).items():
            if key == 'user_id':
                ret[key] = self.get_uuid()
            elif not (key.startswith('_') or key == 'password_hash'):
                ret[key] = value
        return ret

    def hash_password(self, password):
        """Create password hash from password string"""
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        """Verify password from password string"""
        return pwd_context.verify(password, self.password_hash)
