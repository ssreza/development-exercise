import os
import boto
from boto.s3.key import Key
import tinys3
import requests
import operator
from flask import Flask,request, jsonify, json, g
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from contextlib import contextmanager
from functools import wraps
import datetime
from twilio.rest import TwilioRestClient 
from flask_cors import CORS, cross_origin
import random
import string
import isodate
from sendgrid.helpers.mail import *
from sendgrid import * 
from sqlalchemy.sql import func
from sqlalchemy import desc


app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)


from models import *
user_schema = UserSchema()
users_schema = UserSchema(many=True)
facility_schema = FacilitySchema()
facilities_schema = FacilitySchema(many=True)
appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)
station_schema = StationSchema()
stations_schema = StationSchema(many=True)
time_slot_schema = TimeSlotSchema()
time_slots_schema = TimeSlotSchema(many=True)


def gen_pass(size=6, chars=string.ascii_lowercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))

def send_message(to,text_body):
	try:
		client = TwilioRestClient(app.config['ACCOUNT_SID'],app.config['AUTH_TOKEN']) 
	 
		client.messages.create(
		    to=to, 
		    from_="+16464614150", 
		    body=text_body	
		    )
		return "text sent to" + to
	except:
		return "unable to send"

def build_email(to_email, subject,message, from_email="appointments@dialschedule.com"):
	try:
		from_email = Email(from_email)
		to_email = Email(to_email)
		content = Content("text/html", message)
		mail = Mail(from_email, subject, to_email, content)
		return mail.get()
	except:
		return "Unable to send"
def send_email(to_email, subject,message,from_email="appointments@dialschedule.com"):
	sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
	data = {
	  "personalizations": [
	    {
	      "to": [
	        {
	          "email": to_email	        }
	      ],
	      "subject": subject,
	      "substitutions": {
				    "-data-":message
				  },
	    }
	  ],
	  "from": {
	    "email": from_email
	  }, 
	  "template_id": "34e62c9b-26fc-4e3b-8d18-7f1fb840fff4"
	}
	response = sg.client.mail.send.post(request_body=data)
	print response.status_code
	print response.body
	print response.headers

class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response



@app.route('/api/authenticate', methods=['POST'])
def authenticate():
	data = json.loads(request.data.decode())
	user = User.query.filter_by(email=data["email"]).first()
	if user is not None and bcrypt.check_password_hash(user.password, data["password"]):
		token = user.generate_auth_token()
		user.last_login_at = datetime.datetime.now()
		db.session.commit()
		return jsonify({ 'message':'Welcome '+ user.name ,'token': token.decode('ascii') , 'user_type':user.user_type,'facility_id': user.facility_id, 'success':True}),200
	else:
		return jsonify({"msg": "user not found"}),202





def check_auth(request, user_type):
	try:
		g.token = request.headers["Authorization"].replace("Basic ","")
		if g.token:
			g.auth = User.verify_auth_token(g.token.encode('ascii'))
			if g.auth:
				if user_type == "admin":
					if g.auth.user_type == "admin" or g.auth.user_type =="super_admin":
						return True
					return False	
				elif user_type == "super_admin" or user_type == "patient":
					if g.auth.user_type == user_type:
						return True
					return False
				else:
					return True
		return False		
	except:
		return False
		

def authenticateFalse():
    """Sends a 401 response that enables basic auth"""
    raise InvalidUsage('Login Required', status_code=401)


def patient_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_auth(request, "patient"):
            return authenticateFalse()
        return f(*args, **kwargs)
    return decorated

def normal_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_auth(request, ""):
            return authenticateFalse()
        return f(*args, **kwargs)
    return decorated

def admin_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_auth(request, "admin"):
            return authenticateFalse()
        return f(*args, **kwargs)
    return decorated

def super_admin_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not check_auth(request, "super_admin"):
            return authenticateFalse()
        return f(*args, **kwargs)
    return decorated

@app.route('/api/users', methods=['POST'])
@admin_auth
def add_user():
	data = json.loads(request.data.decode())
	if g.auth.user_type == 'super_admin' and 'facility_id' in data:			
		facility = Facility.query.get(data["facility_id"])
	elif g.auth.user_type == 'admin' :
		facility = Facility.query.get(g.auth.facility_id)
	if "password" in  data:
		password = data["password"]
	else:
		password = gen_pass()
	image_url=""
	if "image_url" in data:
		image_url= data["image_url"]
	user = User(
	    name=data["name"],
	    email=data["email"],
	    password= bcrypt.generate_password_hash(password),
	    cell_number =data["cell_number"],
	    dob = data["dob"],
	    user_type = data['user_type'],
	    facility_name=facility.facility_name,
	    facility_id =facility.id,
	    image_url=image_url
	)
	facility.users.append(user)
	db.session.add(user)
	db.session.commit()
	user_result = user_schema.dump(user)
	msg="Hey "+user.name+" you have been added as a new user!\n  Email: "+user.email+ "\n Password: " + password
	send_message(user.cell_number, msg)
	
	send_email(user.email,"Welcome to DialSchedule", msg,"registration@dialschedule.com")
	print(password)
	return jsonify({'success':True, 'user': user_result.data}),200

@app.route('/api/users', methods=['GET'])
@admin_auth
def user_get_all():
	if g.auth.user_type == 'super_admin':
		users = User.query.filter(User.id!=g.auth.id).all()
	else:
		users = User.query.filter(User.user_type!='super_admin', User.id!=g.auth.id).all()
	result = users_schema.dump(users)
	return jsonify(result.data),200




@app.route('/api/users/get_by_email/<email>', methods=['GET'])
@admin_auth
def user_get_by_email(email):
	user = User.query.filter_by(email=email).first()
	result = user_schema.dump(user)
	return jsonify(result.data),200

@app.route('/api/user_get_self', methods=['GET'])
@normal_auth
def user_get_self():
	user = User.query.get(g.auth.id)
	user_data = user_schema.dump(user)
	facility = Facility.query.get(user.facility_id)
	facility_data = facility_schema.dump(facility)
	return jsonify({"user": user_data.data["user"], "facility":facility_data.data }),200

@app.route('/api/users/<id>', methods=['GET'])
@admin_auth
def user_get_one(id):
	user = User.query.get(id)
	result = user_schema.dump(user)
	return jsonify(result.data),200

@app.route('/api/users/<id>', methods=['PUT'])
@admin_auth
def user_update(id):
	user = User.query.filter_by(id=id, facility_id = g.auth.facility_id).first()
	if user:	
		user.email = data["email"]
		db.session.commit()
		result = user_schema.dump(user)
		return jsonify(result.data),200
	else:
		raise InvalidUsage('User cannot be updated', status_code=404)


@app.route('/api/users/<id>', methods=['DELETE'])
@admin_auth
def user_delete(id):
	user = User.query.get(id)
	if id == g.auth.id:
		raise('Cannot delete user', 404)
	if g.auth.user_type == 'admin' and user.user_type == 'super_admin':
		raise('Cannot delete user', 404)
	db.session.delete(user)	
	db.session.commit()
	result = user_schema.dump(user)
	result.data["message"]="User "+ user.name +" deleted!"
	return jsonify(result.data),200

@app.route('/api/user_update_self', methods=['PUT'])
@normal_auth
def user_update_self():
	data = json.loads(request.data.decode())
	user = g.auth
	user.name = data["name"]
	user.email = data["email"]
	user.cell_number = data["cell_number"]
	image_url = ""
	if "image_url" in data:
		image_url = data["image_url"]
	user.image_url = image_url
	db.session.commit()
	result = user_schema.dump(user)
	return jsonify(result.data),200

@app.route('/api/facility', methods=['POST'])
@super_admin_auth
def add_facility():
	data = json.loads(request.data.decode())
	print(data)
	try:
		facility = Facility(
		    facility_name=data["name"],
		   	facility_type='normal',
		    address= data["address"],
		   	phone_number =data["phone_number"],
		   	twilio_number ="6464614150"

		)
		db.session.add(facility)
		db.session.commit()
		facility_result = facility_schema.dump(facility)
		return jsonify({'success':True, 'facility': facility_result.data}),200
	except:
		raise InvalidUsage('This facility cannot be added', status_code=404)

@app.route('/api/facility/<id>', methods=['GET'])
@normal_auth
def facilities_get_one(id):
	if id and g.auth.user_type!='admin':
		facility = Facility.query.get(id)
	elif g.auth.user_type=='admin':
		facility = Facility.query.get(g.auth.facility_id)
	else:
		raise InvalidUsage('This facility cannot be found', status_code=404)
	result = facility_schema.dump(facility)
	return jsonify(result.data),200

@app.route('/api/facility_details', methods=['GET'])
@normal_auth
def facility_get_details():
	facility = Facility.query.get(g.auth.facility_id)
	result = facility_schema.dump(facility)
	return jsonify(result.data),200

	
@app.route('/api/facility/<id>', methods=['DELETE'])
@super_admin_auth
def facilities_delete_one(id):
	facility = Facility.query.get(id)
	db.session.delete(facility)
	db.session.commit()
	result = facility_schema.dump(facility)
	return jsonify(result.data),200
@app.route('/api/facility/<id>', methods=['PUT'])
@admin_auth
def facilities_update_one(id):
	data = json.loads(request.data.decode())

	facility = Facility.query.get(id)
	facility.facility_name = data['facility_name']
	facility.address = data['address']
	image_url = ''
	if 'image_url' in data:
		image_url= data['image_url']
	facility.image_url = data['image_url']
	db.session.commit()
	result = facility_schema.dump(facility)
	return jsonify(result.data),200
				
@app.route('/api/facilities', methods=['GET'])
@normal_auth
def facilities_get_all():
	facilities = Facility.query.all()
	result = facilities_schema.dump(facilities)
	return jsonify(result.data),200

@app.route('/api/stations', methods=['POST'])
@admin_auth
def add_station():
	data = json.loads(request.data.decode())
	facility = Facility.query.get(g.auth.facility_id)
	station = Station(
	    name=data["name"],
	    number= data["number"],
	    facility_id = g.auth.facility_id
	)
	facility.stations.append(station)
	db.session.add(station)
	db.session.commit()
	time_slots=[]
	station = Station.query.filter_by(name=data["name"], number=data["number"], facility_id=g.auth.facility_id).first()
	if data["time_slots"]:
		for t in data["time_slots"]:
			has_time_slot = TimeSlot.query.filter_by(station_id =station.id, start_time = t["start_time"], day =t["day"]).first()
			if has_time_slot:
				raise InvalidUsage("Time Slot cant be added already exists", status_code=404)
			time_slot=TimeSlot(
				start_time=t["start_time"],
				end_time=t["end_time"],
				station_id=station.id,
				booked=False,
				start_hour=t["start_hour"],
				start_str=t["start_str"],
				end_hour=t["end_hour"],
				end_str=t["end_str"],
				day=t["day"],
				facility_id=g.auth.facility_id

				)
			print(time_slot.start_time)
			station.time_slots.append(time_slot)
			time_slots.append(time_slot)
	
	db.session.commit()
	station_result = station_schema.dump(station)
	time_slots_result = time_slots_schema.dump(time_slots)
	return jsonify({'success':True, 'station': station_result, 'time_slots':time_slots_result.data}),200
	
@app.route('/api/stations/<id>', methods=['GET'])
@admin_auth
def stations_get_one(id):
	station = Station.query.filter_by(id=id, facility_id=g.auth.facility_id).first()
	if station:
		station_result = station_schema.dump(station)
		time_slots = station.time_slots;
		time_slots_result = time_slots_schema.dump(time_slots)
		return jsonify({"station":station_result.data, "time_slots":time_slots_result.data}),200
	else:
		raise InvalidUsage("Station not found", status_code=404)
@app.route('/api/stations/<id>', methods=['DELETE'])
@admin_auth
def stations_delete_one(id):
	facility = Facility.query.get(g.auth.facility_id)
	station = Station.query.get(id)
	if station and facility:
		facility.stations.remove(station)
		result = station_schema.dump(station)
		db.session.delete(station)
		db.session.commit()
	return jsonify(result.data),200
@app.route('/api/time_slots/<id>', methods=['DELETE'])
@admin_auth
def time_slots_delete_one(id):
	time_slot = TimeSlot.query.get(id)
	station = Station.query.filter_by(facility_id=g.auth.facility_id,id=time_slot.station_id).first()
	if time_slot and station:
		station.time_slots.remove(time_slot)
		result = station_schema.dump(station)
		db.session.delete(time_slot)
		db.session.commit()
		return jsonify(result.data),200
	else:
		raise InvalidUsage("Time Slot not found", status_code=404)
@app.route('/api/time_slots', methods=['GET'])
@normal_auth
def time_slots_get_all():
	if request.args.get('facility_id') :
		facility_id = request.args.get('facility_id')
	else:
		facility_id = g.auth.facility_id
	if g.auth.user_type == 'patient':
		time_slots = TimeSlot.query.filter_by(facility_id=facility_id,booked =False).all()
	else:
		time_slots = TimeSlot.query.filter_by(facility_id=facility_id).all()
	if time_slots :
		result = time_slots_schema.dump(time_slots)
		return jsonify(result.data),200
	else:
		raise InvalidUsage("Time Slots not found", status_code=404)

@app.route('/api/stations/<id>', methods=['PUT'])
@admin_auth
def stations_update_one(id):
	data=json.loads(request.data.decode())
	station = Station.query.get(id)
	station.name = data["name"]
	if data["time_slots"]:
		for t in data["time_slots"]:
			if "id" in t:
				time_slot = TimeSlot.query.get(t["id"])
				time_slot.start_time=t["start_time"]
				time_slot.end_time=t["end_time"]
				time_slot.start_hour=t["start_hour"]
				time_slot.start_str=t["start_str"]
				time_slot.end_hour=t["end_hour"]
				time_slot.end_str=t["end_str"]
			else:
				has_time_slot = TimeSlot.query.filter_by(station_id =station.id, start_time = t["start_time"], day =t["day"]).first()
				if has_time_slot:
					raise InvalidUsage("Time Slot cant be added already exists", status_code=404)
				time_slot = TimeSlot(
				start_time=t["start_time"],
				end_time=t["end_time"],
				station_id=station.id,
				booked=False,
				start_hour=t["start_hour"],
				start_str=t["start_str"],
				end_hour=t["end_hour"],
				end_str=t["end_str"],
				day=t['day'],
				facility_id=g.auth.facility_id
				)
				print(time_slot.start_time)
				station.time_slots.append(time_slot)
	db.session.commit()
	station = Station.query.get(id)
	result = station_schema.dump(station)
	return jsonify(result.data),200
	
@app.route('/api/stations', methods=['GET'])
@normal_auth
def stations_get_all():
	if g.auth.user_type == 'admin' :
		stmt = db.session.query(TimeSlot.station_id, func.count('*').label('appointment_count')).group_by(TimeSlot.station_id).filter(TimeSlot.booked != True).subquery()
		stations = db.session.query(Station).outerjoin(stmt, Station.id==stmt.c.station_id).filter(Station.facility_id == g.auth.facility_id ).order_by(desc(stmt.c.appointment_count))
	elif request.args.get('facility_id') and g.auth.user_type == 'patient' :
		stations= []
		stmt = db.session.query(TimeSlot.station_id, func.count('*').label('appointment_count')).group_by(TimeSlot.station_id).filter(TimeSlot.booked != True).subquery()
		stations = db.session.query(Station).outerjoin(stmt, Station.id==stmt.c.station_id).filter(Station.facility_id == request.args.get('facility_id') ).order_by(desc(stmt.c.appointment_count))
	else:
		raise InvalidUsage("Stations couldn't be found", status_code=404)
	result = stations_schema.dump(stations)
	return jsonify(result.data),200


@app.route('/api/stations_free_at_time', methods=['POST'])
@normal_auth
def stations_available():
	data = json.loads(request.data.decode())
	stations = Station.query.filter_by(facility_id=g.auth.facility_id).all()
	appointments = Appointment.query.filter_by(start_time=data["start_time"], facility_id=g.auth.facility_id).all()
	temp=[]
	passed=True
	for s in stations:
		for a in appointments:
			if a.station_id == s.id:
				passed=False
		if passed:
			temp.append(s)
		passed=True
	result = stations_schema.dump(temp)
	return jsonify(result.data),200		


@app.route('/api/appointments', methods=['POST'])
@normal_auth
def add_appointment():
	data = json.loads(request.data.decode())
	appointments=[]
	added = False
	message = ''
	now = datetime.datetime.now()
	count = 0	
	msg=''
	if g.auth.user_type == 'patient':
		patient = g.auth
		facility = Facility.query.get(data['facility_id'])
		if data['default'] == True:
			patient.facility_id = data['facility_id']
			db.session.commit()
	elif g.auth.user_type=='admin' or g.auth.user_type == 'super_admin':
		if 'user_id' in data:
			patient = User.query.get(data['user_id'])
			facility = Facility.query.get(g.auth.facility_id)
		else:
			raise InvalidUsage("Appointments couldn't be added user id field not found", status_code=404)
	for a in data['appointments']:
		if count<3:
			start_time = datetime.datetime.fromtimestamp(a["start_time"])
			end_time = datetime.datetime.fromtimestamp(a["end_time"])
			has_appointment = Appointment.query.filter(Appointment.start_time == start_time, Appointment.user_id==patient.id).first()		
			time_slot = TimeSlot.query.get(a["time_slot_id"])
			print(has_appointment)
			print(time_slot)
			if not has_appointment  and start_time >= now and time_slot:
					time_slot.user_id = patient.id
					print(time_slot.station_id)
					station = Station.query.get(time_slot.station_id)

					if not station:
						raise InvalidUsage("Station couldn't be found", status_code=404)
					appointment = Appointment(
						    user_id=patient.id,
						    user_name=patient.name,
						    facility_name =facility.facility_name,
						    start_time= start_time,
						    end_time=end_time,
						    facility_id = facility.id,
						    booked=True,					
						    time_slot_id=time_slot.id,
						    station_id=station.id,
						    station_number=station.number,
						    arrived=False
						    )
					if "recurring" in data:
						appointment.recurring = data["recurring"]
					station.appointments.append(appointment)
					patient.appointments.append(appointment)
					time_slot.booked=True
					time_slot.appointment_id=appointment.id
					db.session.add(appointment)				
					db.session.commit()
					msg += "<li>"+ appointment.start_time.strftime("%A %I:%M %p %d/%m")+ ' at ' + facility.facility_name +' '+ facility.address +"</l>\n"
					appointments.append(appointment)
			count+=1
	if len(appointments)>0 :
		message = "<p>Hey "+ patient.name +" !\n We're confirming your updated schedule; here are the selected dates: \n"+msg+"\n </p>"
		print(message)
		send_email(patient.email,"Your new appoinment schedule!",message)
		# admin_users = User.query.filter_by(facility_id=facility.id, user_type="admin").all()
		# for a in admin_users:
		# 	send_email(a.email, "<p> Patient" + patient.name + " has created an these appointments: \n" +msg +"\n </p>")
		appointments_result = appointments_schema.dump(appointments)
		return jsonify({'success':True, 'appointments': appointments_result.data, 'message':'Appointments added!'}),200
	else:
		raise InvalidUsage("Appointments couldn't be added", status_code=404)
@app.route('/api/appointments/<id>', methods=['GET'])
@normal_auth
def appointments_get_one(id):
	appointment = Appointment.query.get(id)
	result = appointment_schema.dump(appointment)
	return jsonify(result.data),200

@app.route('/api/appointments/confirm_arrival/<id>', methods=['PUT'])
@admin_auth
def appointments_update_arrived(id):
	appointment = Appointment.query.get(id)
	appointment.arrived = True
	time_slot = TimeSlot.query.get(appointment.time_slot_id)
	time_slot.booked = False
	db.session.commit()
	if appointment.recurring == True:		
		create_new_appointment(appointment)

	
	result = appointment_schema.dump(appointment)

	return jsonify(result.data),200


def create_new_appointment(appointment):
	next_start_time =  appointment.start_time +  datetime.timedelta(days = 7)
	next_end_time = appointment.end_time + datetime.timedelta(days = 7)
	appointment_new = Appointment(
			    user_id=appointment.user_id,
			    user_name=appointment.user_name,
			    facility_name =appointment.facility_name,
			    start_time= next_start_time,
			    end_time=next_end_time,
			    facility_id = appointment.facility_id,
			    booked=True,					
			    time_slot_id=appointment.time_slot_id,
			    station_id=appointment.station_id,
			    station_number=appointment.station_number,
			    arrived=False,
			    recurring=True
			    )
	patient = User.query.get(appointment_new.user_id)
	station = Station.query.get(appointment_new.station_id)
	station.appointments.append(appointment_new)
	patient.appointments.append(appointment_new)
	db.session.add(appointment_new)	
	db.session.commit()			

@app.route('/api/appointments/<id>', methods=['DELETE'])
@normal_auth
def appointments_delete_one(id):
	appointment = Appointment.query.get(id)
	if appointment:
		if g.auth.user_type =='patient' and appointment.user_id != g.auth.id:
			raise InvalidUsage("Appointment couldn't be deleted", status_code=404)
		result = appointment_schema.dump(appointment)
		patient = User.query.get(appointment.user_id)
		facility = Facility.query.get(appointment.facility_id)
		patient.appointments.remove(appointment)
		time_slot = TimeSlot.query.get(appointment.time_slot_id)
		time_slot.booked = False
		time_slot.appointment_id = None
		time_slot.user_id = None
		db.session.delete(appointment)
		db.session.commit()
		msg = 'Hey ' +patient.name +' your appointment on ' + appointment.start_time.strftime("%I:%M %p %A %d/%m")+ ' at ' + facility.facility_name +' '+ facility.address + ' has been cancelled!'
		send_message(patient.cell_number,msg)
		return jsonify({"appointment":result.data, "message":"Appointment deleted!"}),200
	else:
		raise InvalidUsage("Appointment couldn't be deleted", status_code=404)

			
@app.route('/api/appointments', methods=['GET'])
@normal_auth
def appointments_get_all():	
	now = datetime.datetime.now()
	if g.auth.user_type == 'patient':
		appointments = Appointment.query.filter(Appointment.user_id== g.auth.id, Appointment.start_time> now).order_by(Appointment.start_time).all()
	elif g.auth.user_type=='admin' and not request.args.get('user_id'):
		appointments= Appointment.query.filter(Appointment.facility_id == g.auth.facility_id).order_by(Appointment.start_time).all()
		if request.args.get('time'):
			
			midnight =datetime.datetime.combine(datetime.date.today(),datetime.time.max )
			morning =datetime.datetime.combine(datetime.date.today(),datetime.time.min )
			appointments= Appointment.query.filter(Appointment.facility_id == g.auth.facility_id, Appointment.start_time<=midnight, Appointment.start_time>=morning).order_by(Appointment.start_time).all()

	elif g.auth.user_type == 'admin' and request.args.get('user_id'):
		appointments= Appointment.query.filter(Appointment.facility_id == g.auth.facility_id, Appointment.user_id ==request.args.get('user_id') ).order_by(Appointment.start_time).all()
	else:
		raise InvalidUsage("Appointments couldnt be found", status_code=404)
	result = appointments_schema.dump(appointments)
	return jsonify(result.data),200
@app.route('/api/appointmentsByFacilityId/<id>', methods=['GET'])
@normal_auth
def appointments_get_by_facilityId(id):	
	now = datetime.datetime.now()
	appointments = Appointment.query.filter(Appointment.user_id== g.auth.id, Appointment.start_time> now, Appointment.facility_id == id).all()
	result = appointments_schema.dump(appointments)
	return jsonify(result.data),200


@app.route('/api/upload', methods=['POST'])
@normal_auth
def upload_file():
	filestorage = request.files['file']
	if not filestorage:
		raise InvalidUsage("File not uploaded", status_code = 404)
	mimetype = filestorage.content_type
	filename = filestorage.filename
	if upload_to_s3(filestorage, "dial-schedule-storage", filename):
		print"uploaded"
	else:
		raise InvalidUsage("File not uploaded", status_code = 404)
	return jsonify({
			'url': 'https://%s.s3.amazonaws.com/%s' % ("dial-schedule-storage", filename)
		}),200
	

	

def upload_to_s3( file, bucket, key, callback=None, md5=None, reduced_redundancy=False, content_type=None):
    """
    Uploads the given file to the AWS S3
    bucket and key specified.

    callback is a function of the form:

    def callback(complete, total)

    The callback should accept two integer parameters,
    the first representing the number of bytes that
    have been successfully transmitted to S3 and the
    second representing the size of the to be transmitted
    object.

    Returns boolean indicating success/failure of upload.
    """
    try:
        size = os.fstat(file.fileno()).st_size
    except:
        # Not all file objects implement fileno(),
        # so we fall back on this
        file.seek(0, os.SEEK_END)
        size = file.tell()
	aws_access_key_id = app.config['AWS_ACCESS_KEY_ID']
	aws_secret_access_key = app.config['AWS_SECRET_ACCESS_KEY']
	conn = boto.connect_s3(aws_access_key_id, aws_secret_access_key)
	bucket = conn.get_bucket(bucket, validate=True)
	
	k = Key(bucket)
    k.key = key
    if content_type:
        k.set_metadata('Content-Type', content_type)
    sent = k.set_contents_from_file(file, cb=callback, md5=md5, reduced_redundancy=reduced_redundancy, rewind=True)
    k.set_acl('public-read')
    # Rewind for later use
    file.seek(0)

    if sent == size:
        return True
    return False
if __name__ == '__main__':
    app.run()