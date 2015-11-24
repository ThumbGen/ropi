#!flask/bin/python

import time, os, emailer
from pi2go import pi2go
import backthread, carLeds

def button_logic():
	if pi2go.getSwitch():
		print "Send IP"
		inform_ip()
		carLeds.alert()
	time.sleep(0.5)

def init(app):
	backthread.start(app, button_logic)

def cleanup(app):
	backthread.stop(app)
	
		
def inform_ip():
	f = os.popen('ifconfig wlan0 | grep "inet\ addr" | cut -d: -f2 | cut -d" " -f1')
	ip=f.read()
	print ip
	emailer.send_email("raspig8@gmail.com", "G4T3C0NTR0L", "rvacaru@gmail.com", "Robot IP", "RoPiRemote: http://" + ip + "\r\n\r\n" + ip)
