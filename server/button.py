#!flask/bin/python

import threading, time
from pi2go import pi2go
import carLeds

thr = None
stop_event = None
switchStatus = False

def watch_button():
	print "Button thread started"
	while(not stop_event.is_set()):
		if pi2go.getSwitch():
			if switchStatus == False:
				print "Lights ON"
				carLeds.execute("dimmed")
			else:
				print "Lights OFF"
				carLeds.execute("off")
			global switchStatus
			switchStatus = not switchStatus
		stop_event.wait(0.1)
		pass

def register_watch_button(app):
	with app.app_context():
		global stop_event
		stop_event = threading.Event()
		global thr
        thr = threading.Thread(target=watch_button)
        thr.daemon = True
        thr.start()

def unregister_watch_button(app):
	with app.app_context():
		print "Stopping thread"
		stop_event.set()
