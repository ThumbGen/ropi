#!flask/bin/python

from pi2go import pi2go
import carLeds

currentSpeed = 30
currentCommand = None


def execute(cmd, arg = None):
	global currentCommand
	# if cmd is "speed" just execute adjustSpeed
	if cmd != "move":
		adjustSpeed(arg) # for 'move' the arg is the angle not the speed
	if cmd == "speed":
		if currentCommand != None and currentCommand != "stop":
			execute(currentCommand)
		return
	currentCommand = None
	if cmd == "stop":
		stop()
	if cmd == "forward":
		forward()
	if cmd == "reverse":
		reverse()
	if cmd == "left":
		left()
	if cmd == "right":
		right()
	if cmd == "move":
		# if no arg specified for move then use by default 90 (straight forward)
		if arg == None:
			arg = 90
		move(arg)
	currentCommand = cmd

def forward():
	global currentSpeed, currentCommand
	pi2go.forward(currentSpeed)
	carLeds.execute("forward")
	#print "Forward ", currentSpeed
	
def reverse():
	global currentSpeed, currentCommand
	pi2go.reverse(currentSpeed)
	#print "Reverse ", currentSpeed
	
def left():
	global currentSpeed, currentCommand
	pi2go.spinLeft(currentSpeed)
	#print "Left ", currentSpeed
	
def right():
	global currentSpeed, currentCommand
	pi2go.spinRight(currentSpeed)
	#print "Right ", currentSpeed
	
def stop():
	global currentCommand
	pi2go.stop()
	carLeds.execute("brake")
	#print "Stopped"
	
#	 90
#  	  |
#180 --- 0
#     |
#    270
# give 20deg space for going straight in each direction
# between 0 and 180 we move forward (+)
# between 181 and 360 we move backward (-)
# between 80 and 110 we go straight forward
def move(angle):
	global currentSpeed, currentCommand
	if angle >= 10 or angle >= 350:
		right()
		#print "full right"
	
	if angle > 10 and angle < 80:
		pi2go.turnForward(1.2*currentSpeed, currentSpeed * angle2SpeedPercent(angle))
		#print "forward right"

	if angle >= 80 and angle <= 100:
		forward()
		#print "full forward"

	if angle > 100 and angle < 170:
		pi2go.turnForward(currentSpeed * angle2SpeedPercent(angle), 1.2*currentSpeed)
		#print "forward left"

	if angle >= 170 and angle <= 190:
		left()
		#print "full left"

	if angle > 190 and angle < 260:
		pi2go.turnReverse(currentSpeed * angle2SpeedPercent(angle), 1.2*currentSpeed)
		#print "backward left"

	if angle >= 260 and angle <= 280:
		reverse()
		#print "full backward"

	if angle > 280 and angle < 350:
		pi2go.turnReverse(1.2*currentSpeed, currentSpeed * angle2SpeedPercent(angle))
		#print "backward right"
	
# convert a deg angle to percent of currentSpeed depending on the current quadrant
def angle2SpeedPercent(angle):
	p = 1.0 *(angle % 90) / 70
	print p
	return p
	
def adjustSpeed(speed):
	global currentSpeed, currentCommand
	if speed == None:
		return
	if speed > 0:
		currentSpeed = min(100, speed)
	if speed < 0 :
		currentSpeed = max (0, speed)
	if speed == 0:
		currentSpeed = 0
	print "Current speed:", currentSpeed
