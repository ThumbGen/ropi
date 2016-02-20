#!flask/bin/python

import time, os, emailer, sys
import robot
import backthread, carLeds

def button_logic():
	if robot.getSwitch():
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
	
	try:
		fo = open('email_config.txt', "r")
		lines = fo.readlines()
		fo.close()
		
		sourceEmail = lines[0]
		sourcePass = lines[1]
		destEmail = lines[2]
		
		emailer.send_email(sourceEmail, sourcePass, destEmail, "Robot IP", "RoPiRemote: http://" + ip + "\r\n\r\n" + ip)
	except:
		print "Unexpected error:", sys.exc_info()[0]
