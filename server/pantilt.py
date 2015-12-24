#!flask/bin/python

import time, backthread
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

step = 5

currentCommand = None
currentPan = PANCENTER
currentTilt = TILTCENTER

def init(app):
	global servo
	servo = PWM(0x40)
	servo.setPWMFreq(50)
	backthread.start(app, stepPanOrTilt, 0.25)
	
def center():
	setPanValue(PANCENTER)
	time.sleep(1)
	setTiltValue(TILTCENTER)
	return { "tilt": TILTCENTER, "pan": PANCENTER }
		
def setPanValue(deg):
	global currentPan
	if deg < PANMIN or deg > PANMAX:
		return { "pan": -1 }
	turn(PAN, PANOFFSET + deg)
	currentPan = deg
	return { "pan": deg }
	#print "pan:", deg

def setTiltValue(deg):
	global currentTilt
	if deg < TILTMIN or deg > TILTMAX:
		return { "tilt": -1 }
	turn(TILT, TILTOFFSET + deg)
	currentTilt = deg
	return { "tilt": deg }
	#print "tilt:", deg
	
def setPanTiltPercent(percentPan, percentTilt):
	panToSet = -1
	tiltToSet = -1
	if percentPan == 0:
		panToSet = PANCENTER
	if percentTilt == 0:
		tiltToSet = TILTCENTER
		
	if percentPan > 0 and percentPan <= 100:
		panToSet = PANCENTER + int((PANMAX-PANCENTER)*percentPan/100)
	if percentPan < 0 and percentPan >= -100:
		panToSet = PANCENTER + int((PANCENTER-PANMIN)*percentPan/100)
		
	if percentTilt > 0 and percentTilt <= 100:
		tiltToSet = TILTCENTER + int((TILTMAX-TILTCENTER)*percentTilt/100)
	if percentTilt < 0 and percentTilt >= -100:
		tiltToSet = TILTCENTER + int((TILTCENTER-TILTMIN)*percentTilt/100)
		
	if panToSet != -1:
		print "setting pan: ", panToSet
		setPanValue(panToSet)
	if tiltToSet != -1:
		print "setting tilt: ", tiltToSet
		setTiltValue(tiltToSet)
		
	return { "pan": panToSet, "tilt": tiltToSet }

def setMoveDirection(app, cmd):
	global currentCommand, currentPan, currentTilt
	
	if cmd == currentCommand:
		return { "pan": -1, "tilt": -1 }

	print "Setting command to", cmd
	currentCommand = cmd
	
	return { "pan": -1, "tilt": -1 }

def stepPanOrTilt():
	global step, currentCommand, currentPan, currentTilt
	
	#print "StepPanOrTilt currentPan", currentPan
	#print "StepPanOrTilt currentTilt", currentTilt
	res = None
	if currentCommand == "up":
		res = setTiltValue(currentTilt - step)
	if currentCommand == "down":
		res = setTiltValue(currentTilt + step)
	if currentCommand == "left":
		res = setPanValue(currentPan + step)
	if currentCommand == "right":
		res = setPanValue(currentPan - step)
	
	try:
		if res != None:
			if res["pan"] != -1:
				currentPan = res["pan"]
			if res["tilt"] != -1:
				currentTilt = res["tilt"]
	except:
		print "ex"
	#print "Done"
	return
	
def turn(pin,deg):
	pwm = 570.0 + ((deg/180.0) * 1700.0)

	pwm = (4096.0/20000.0) * pwm
	pwm = int(pwm)

	servo.setPWM(pin, 0, pwm)
	
def cleanup(app):
	backthread.stop(app)
