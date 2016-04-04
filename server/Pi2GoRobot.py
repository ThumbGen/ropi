from pi2go import pi2go
from pi2go.Adafruit_PWM_Servo_Driver import PWM

# publics
PANOFFSET = 40
TILTOFFSET = 40
PANMAX = 130
PANMIN = 40
TILTMAX = 180
TILTMIN = 0

PANCENTER = 90
TILTCENTER = 95

servo = None

# Define pins for Pan/Tilt
PIN_PAN = 15
PIN_TILT = 14

def init():
	global servo
	pi2go.init()
	servo = PWM(0x40)
	servo.setPWMFreq(50)
	
def cleanup():
	pi2go.cleanup()
	
def setLED(led, red, green, blue):
	pi2go.setLED(led, red, green, blue)	

def setAllLEDs(red, green, blue):
	pi2go.setAllLEDs(red, green, blue)
	
def irLeft():
	return pi2go.irLeft()
	
def irRight():
	return pi2go.irRight()
	
def irCentre():
	return pi2go.irCentre()
	
# line follower
def irLeftLine():
	return pi2go.irLeftLine()
	
def irRightLine():
	return pi2go.irRightLine()
	
# switch
def getSwitch():
	return pi2go.getSwitch()
	
# light
def getLight(index):
	return pi2go.getLight(index)
	
# motors
def forward(speed):
	pi2go.forward(speed)
	
def reverse(speed):
	pi2go.reverse(speed)
	
def spinLeft(speed):
	pi2go.spinLeft(speed)

def spinRight(speed):
	pi2go.spinRight(speed)
	
def stop():
	pi2go.stop()
	
def turnForward(leftSpeed, rightSpeed): 
	pi2go.turnForward(leftSpeed, rightSpeed)

def turnreverse(leftSpeed, rightSpeed): 
	pi2go.turnReverse(leftSpeed, rightSpeed)
	
#ultrasonic	
def getDistance():
	return pi2go.getDistance()

# servo
def turn(isPan,angle):
	pin = PIN_TILT
	if isPan:
		pin = PIN_PAN

	pwm = 570.0 + ((angle/180.0) * 1700.0)

	pwm = (4096.0/20000.0) * pwm
	pwm = int(pwm)

	servo.setPWM(pin, 0, pwm)