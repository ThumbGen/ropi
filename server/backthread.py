#!flask/bin/python

import threading, time

thr = None
stop_event = threading.Event()
ident = 0

def execute(interval, logic_to_execute):
	t = threading.currentThread()
	print "Thread started:", t.ident, "\r\n"
	while(t.isAlive() and not stop_event.is_set()):
		logic_to_execute()
		stop_event.wait(interval)
		pass

def start(app, logic_to_execute, interval = 0.5):
	with app.app_context():
		#stop_event = threading.Event()
		thr = threading.Thread(target=execute, args=(interval, logic_to_execute))
		thr.daemon = True
		thr.start()
		
def stop(app):
	with app.app_context():
		print "Stopping thread"
		stop_event.set()
