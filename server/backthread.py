#!flask/bin/python

import threading, time
from pi2go import pi2go

thr = None
stop_event = threading.Event()
ident = 0

def execute(arg, logic_to_execute):
	t = threading.currentThread()
	print "Thread started:", t.ident, "\r\n"
	while(t.isAlive() and not stop_event.is_set()):
		logic_to_execute()
		stop_event.wait(0.5)
		pass

def start(app, logic_to_execute):
	with app.app_context():
		#stop_event = threading.Event()
		thr = threading.Thread(target=execute, args=(1, logic_to_execute))
		thr.daemon = True
		thr.start()
		
def stop(app):
	with app.app_context():
		print "Stopping thread"
		stop_event.set()
