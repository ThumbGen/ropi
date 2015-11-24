#!flask/bin/python

import time
from pi2go.Adafruit_PWM_Servo_Driver import PWM

# Define pins for Pan/Tilt
PAN = 15
TILT = 14

PANOFFSET = 40
TILTOFFSET = 40
PANMAX = 130
PANMIN = 40
TILTMAX = 180
TILTMIN = 0

PANCENTER = 90
TILTCENTER = 95

servo = None

def init():
	global servo
	servo = PWM(0x40)
	servo.setPWMFreq(50)
	
def center():
	setPanValue(PANCENTER)
	time.sleep(1)
	setTiltValue(TILTCENTER)
	return { "tilt": TILTCENTER, "pan": PANCENTER }
		
def setPanValue(deg):
	if deg < PANMIN or deg > PANMAX:
		return { "pan": -1 }
	turn(PAN, PANOFFSET + deg)
	return { "pan": deg }
	#print "pan:", deg

def setTiltValue(deg):
	if deg < TILTMIN or deg > TILTMAX:
		return { "tilt": -1 }
	turn(TILT, TILTOFFSET + deg)
	return { "tilt": deg }
	#print "tilt:", deg
	
def turn(pin,deg):
	pwm = 570.0 + ((deg/180.0) * 1700.0)

	pwm = (4096.0/20000.0) * pwm
	pwm = int(pwm)

	servo.setPWM(pin, 0, pwm)
