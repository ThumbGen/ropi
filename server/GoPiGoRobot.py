from gopigo import *

# publics
PANOFFSET = 40
TILTOFFSET = 40
PANMAX = 130
PANMIN = 40
TILTMAX = 180
TILTMIN = 0

PANCENTER = 90
TILTCENTER = 95

PIN_ULTRASONIC = 15

def init():
	pass
	
def cleanup():
	pass
	
def isInstalled():
	try:
		version = fw_ver()
		print "GoPiGo robot detected; version ", version
		return True
	except:
		print "GoPiGo robot NOT detected"
		return False
	
def setLED(led, red, green, blue):
	pass

def setAllLEDs(red, green, blue):
	pass
	
def irLeft():
	return False
	
def irRight():
	return False
	
def irCentre():
	return False
	
def irLeftLine():
	return False
	
def irRightLine():
	return False
	
def getSwitch():
	return False
	
def getLight(index):
	return 0
	
def forward(speed):
	pass
	
def reverse(speed):
	pass
	
def spinLeft(speed):
	pass

def spinRight(speed):
	pass
	
def stop():
	pass
	
def turnForward(leftSpeed, rightSpeed): 
	pass

def turnreverse(leftSpeed, rightSpeed): 
	pass
	
def getDistance():
	try:
		return us_dist(PIN_ULTRASONIC)
	except Exception,e:
		print str(e)
		return 0
	
def moveServo(isPan,angle):
	pass