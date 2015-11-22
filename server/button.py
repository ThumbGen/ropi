#!flask/bin/python

import time
from pi2go import pi2go
import backthread

def button_logic():
	if pi2go.getSwitch():
		print "Button ON"
	time.sleep(1)

def init(app):
	backthread.start(app, button_logic)

def cleanup(app):
	backthread.stop(app)