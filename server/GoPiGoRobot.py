from gopigo import *
import time

# publics
PANOFFSET = 0
TILTOFFSET = 0
PANMAX = 180
PANMIN = 40
TILTMAX = 180
TILTMIN = 0

PANCENTER = 110
TILTCENTER = 90

PIN_ULTRASONIC = 15

LEDoff = 0

# start region - robot interface

def init():
	led_off(0)
	led_off(1)
		
def cleanup():
	pass
	
def getVersion():
	return str(fw_ver())
	
def isInstalled():
	try:
		version = fw_ver()
		print "GoPiGo robot detected; version ", version
		return True
	except:
		print "GoPiGo robot NOT detected"
		return False
	
def setLED(led, red, green, blue):
	setAllLEDs(red, green, blue)
	
def setAllLEDs(red, green, blue):
	if red == LEDoff and green == LEDoff and blue == LEDoff:
		led_off(0)
		led_off(1)
	else:
		led_on(0)
		led_on(1)
		
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
	#stop()
	adjustSpeed(speed)
	fwd()
	
def reverse(speed):
	#stop()
	adjustSpeed(speed)
	bwd()
	
def spinLeft(speed):
	
	#left_rot()
	pass

def spinRight(speed):
	
	#right_rot()
	pass
	
def stopRobot():
	stop()
	
def turnForward(leftSpeed, rightSpeed): 
	return
	if leftSpeed < rightSpeed:
		left()
	else:
		right()

def turnReverse(leftSpeed, rightSpeed): 
	pass

def getVoltage():
	try:
		return volt()
	except Exception,e:
		print str(e)
		return 0
	
def getDistance():
	try:
		return us_dist(PIN_ULTRASONIC)
	except Exception,e:
		print str(e)
		return 0
	
def moveServo(isPan,angle):
	if isPan:
		servo(angle)
	
# end region - robot interface

# received a speed percent between 0 and 100 and converts it to speed value  0 to 250
def adjustSpeed(speedPercent):
	speed = int((1.0 * speedPercent / 100) * 250)
	set_speed(speed)
	time.sleep(0.1)