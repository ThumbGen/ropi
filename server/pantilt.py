#!flask/bin/python

import time, backthread
from robot import *

IS_PAN = True
IS_TILT = False

step = 5

currentCommand = None
currentPan = None
currentTilt = None

def init(app):
	currentPan = PANCENTER
	currentTilt = TILTCENTER
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
	turn(IS_PAN, PANOFFSET + deg)
	currentPan = deg
	return { "pan": deg }
	#print "pan:", deg

def setTiltValue(deg):
	global currentTilt
	if deg < TILTMIN or deg > TILTMAX:
		return { "tilt": -1 }
	turn(IS_TILT, TILTOFFSET + deg)
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
	
def turn(isPan,angle):
	robot.turn(isPan, angle)
		
def cleanup(app):
	backthread.stop(app)
