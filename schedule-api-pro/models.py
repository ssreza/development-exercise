from app import db
from app import app
import datetime
from app import bcrypt
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship, validates
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.exc import IntegrityError
from marshmallow import Schema, fields, ValidationError, pre_load, post_dump
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

#psql -h ec2-54-163-226-30.compute-1.amazonaws.com -p 5432 -U vqmypeszzvymyu -W d8jjsh9ds65jle
class Base(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    modified_at = db.Column(db.DateTime, default=db.func.current_timestamp(),
                            onupdate=db.func.current_timestamp())


class User(Base):

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'))
    name = db.Column(db.String)
    cell_number = db.Column(db.String, nullable=False)
    email = db.Column(db.String(60), nullable=False, unique=True)
    password = db.Column(db.Binary(60), nullable=False)
    user_type = db.Column(db.String)
    dob= db.Column(db.DateTime)
    token = db.Column(db.String)
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    last_login_at = db.Column(db.DateTime())
    current_login_at = db.Column(db.DateTime())
    appointments = db.relationship('Appointment', backref='user', lazy='dynamic', cascade="all,delete") 
    facility_name= db.Column(db.String())
    image_url= db.Column(db.String())
    # Why 45 characters for IP Address ?
    # See http://stackoverflow.com/questions/166132/maximum-length-of-the-textual-representation-of-an-ipv6-address/166157#166157
    last_login_ip = db.Column(db.String(45))
    current_login_ip = db.Column(db.String(45))
    login_count = db.Column(db.Integer)


    def generate_auth_token(self, expiration = 6000):
        s = Serializer(app.config['SECURITY_PASSWORD_SALT'], expires_in = expiration)
        return s.dumps({ 'id': self.id })

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECURITY_PASSWORD_SALT'])
        try:
            data = s.loads(token)
            print(data)
        except SignatureExpired:
            print('expired')
            return None # valid token, but expired
        except BadSignature:
            print('bad')
            return None # invalid token
        user = User.query.get(data['id'])
        return user


    def check_password(self, password):
        return  bcrypt.check_password_hash(self.password, password)

    @validates('email')
    def validate_email(self, key, users):
        assert '@' in users
        return users

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.email

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False


class Facility(Base):

    __tablename__ = "facilities"

    id = db.Column(db.Integer, primary_key=True)
    facility_name = db.Column(db.String)
    address = db.Column(db.Text)
    phone_number = db.Column(db.String)
    twilio_number = db.Column(db.String)
    facility_type = db.Column(db.String)
    image_url = db.Column(db.String)
    users = db.relationship('User', backref='facilities', lazy='dynamic') 
    stations = db.relationship('Station', backref='facilities', lazy='dynamic') 

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_name(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.facility_name





class Station(Base):

    __tablename__ = "stations"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'))
    name = db.Column(db.String)
    number = db.Column(db.String)
    time_slots = db.relationship('TimeSlot', backref='facilities', lazy='dynamic')
    appointments = db.relationship('Appointment', backref='facilities', lazy='dynamic')
    def is_available(self):
        """True, as all users are active."""
        return True

    def get_facility(self):
        """Return the facilities id"""
        return self.facility_id

class TimeSlot(Base):

    __tablename__ = "time_slots"

    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'))
    day=db.Column(db.String)
    start_time= db.Column(db.String)
    end_time = db.Column(db.String)
    start_hour= db.Column(db.Float)
    end_hour= db.Column(db.Float)
    start_str= db.Column(db.String)
    end_str= db.Column(db.String)
    booked = db.Column(db.Boolean)
    user_id= db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    def is_booked(self):
        return self.booked

class Appointment(Base):

    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    time_slot_id = db.Column(db.Integer, db.ForeignKey('time_slots.id'),nullable=True)
    station_number = db.Column(db.Integer,nullable=True)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'),nullable=True)
    start_time= db.Column(db.DateTime)
    end_time= db.Column(db.DateTime)
    booked = db.Column(db.Boolean)
    arrived=db.Column(db.Boolean)
    arrived_at= db.Column(db.DateTime)
    facility_name = db.Column(db.String)
    facility_id = db.Column(db.Integer, db.ForeignKey('facilities.id'))
    user_name = db.Column(db.String)
    recurring = db.Column(db.Boolean)
    reminded= db.Column(db.Boolean)
    def booked(self):
        return self.booked



##### SCHEMAS #####

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    email = fields.Str(required=True)
    password = fields.Str(required=True,load_only=True)
    dob = fields.DateTime()
    cell_number = fields.Str()
    user_type  = fields.Str()
    image_url = fields.Str()
    facility_id = fields.Int()
    facility_name= fields.Str()
    last_login_at = fields.DateTime()
    # Clean up data
    @pre_load
    def process_input(self, data):
        data['email'] = data['email'].lower().strip()
        return data

    # We add a post_dump hook to add an envelope to responses
    @post_dump(pass_many=True)
    def wrap(self, data, many):
        key = 'users' if many else 'user'
        return {
            key: data
        }

# Custom validator
def must_not_be_blank(data):
    if not data:
        raise ValidationError('Data not provided.')

class FacilitySchema(Schema):
    id = fields.Int(dump_only=True)
    facility_name = fields.Str(required=True, validate=must_not_be_blank)
    facility_type = fields.Str(required=True, validate=must_not_be_blank)
    address = fields.Str()
    phone_number = fields.Str()
    twilio_number = fields.Str()
    image_url = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class AppointmentSchema(Schema):
    id = fields.Int(dump_only=True)
    start_time = fields.DateTime(required=True, validate=must_not_be_blank)
    end_time = fields.DateTime(required=True, validate=must_not_be_blank)
    time_slot_id = fields.Int()
    station_id = fields.Int()
    station_number = fields.Int()
    facility_id=fields.Int()
    user_id = fields.Int()
    booked = fields.Boolean()
    facility_name = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    arrived_at = fields.DateTime()
    user_name = fields.Str()
    arrived = fields.Boolean()
    reminded = fields.Boolean()
    recurring = fields.Boolean()

class TimeSlotSchema(Schema):
    id = fields.Int(dump_only=True)
    start_time = fields.String(required=True, validate=must_not_be_blank)
    end_time = fields.String(required=True, validate=must_not_be_blank)
    user_id = fields.Int()
    station_id = fields.Int()
    start_hour= fields.Float()
    end_hour= fields.Float()
    start_str= fields.Str()
    end_str= fields.Str()
    booked = fields.Boolean()
    day= fields.Str()
    recurring = fields.Boolean()
    appointment_id= fields.Int()
    facility_id=fields.Int()
    created_at = fields.DateTime(dump_only=True)

class StationSchema(Schema):
    id = fields.Int(dump_only=True)
    facility_id = fields.Int()
    name = fields.Str()
    number = fields.Str()
    is_available = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)



