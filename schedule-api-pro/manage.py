import os
from flask_script import Manager, Command
from flask_migrate import Migrate, MigrateCommand

from app import app, db
from models import *
import datetime

app.config.from_object(os.environ['APP_SETTINGS'])

migrate = Migrate(app, db)
manager = Manager(app)
class Update(Command):
	"updates databases"
	def run(self):
		hourFromNow=datetime.datetime.now()+  datetime.timedelta(minutes = 60)
		now  = datetime.datetime.now()
		halfHourFromNow = datetime.datetime.now()+  datetime.timedelta(minutes = 30)
		appointments = Appointment.query.all()
		for slot in appointments:
			if slot.start_time >= halfHourFromNow  and slot.start_time <= hourFromNow and slot.reminded != True and slot.arrived==False:
				user = User.query.get(slot.user_id)
				slot.reminded = True
				db.session.commit()
				msg = "Hey " + user.name + " your appointment at " + slot.start_time.strftime("%A %-I:%M %p %d/%m") + " is approaching"
				send_message(user.cell_number,msg)
			# if slot.start_time >= now  and slot.recurring==True :
			# 	next_start_time =  slot.start_time+  datetime.timedelta(days = 7)
			# 	next_end_time = slot.end_time + datetime.timedelta()
			# 	appointment = Appointment(
			# 			    user_id=slot.user_id,
			# 			    user_name=slot.user_name,
			# 			    facility_name =slot.facility_name,
			# 			    start_time= start_time,
			# 			    end_time=end_time,
			# 			    facility_id = slot.facility_id,
			# 			    booked=True,					
			# 			    time_slot_id=time_slot.id,
			# 			    station_id=time_slot.id,
			# 			    station_number=time_slot.number,
			# 			    arrived=False,
			# 			    recurring=True
			# 			    )
		

manager.add_command('db', MigrateCommand)
manager.add_command('update',Update())

	   	
if __name__ == '__main__':
    manager.run()

