#!flask/bin/python

import robot
import carLeds, assistance

currentSpeed = 30
currentCommand = None


def execute(cmd, arg = None):
	global currentCommand, currentSpeed
	# if frontassist is active don't allow 'forward' and 'move' with angle between 45 and 135
	if assistance.isFrontAssistActive:
		if cmd == "forward":
			return { "speed": currentSpeed }
		if cmd == "move" and arg > 45 and arg < 135:
			return { "speed": currentSpeed }
	
	# if cmd is "speed" just execute adjustSpeed
	if cmd != "move":
		adjustSpeed(arg) # for 'move' the arg is the angle not the speed
	if cmd == "speed":
		if currentCommand != None and currentCommand != "stop" and currentCommand != "speed":
			return execute(currentCommand)
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
	return { "speed": currentSpeed }

def forward():
	global currentSpeed, currentCommand
	robot.forward(currentSpeed)
	carLeds.execute("forward")
	#print "Forward ", currentSpeed
	
def reverse():
	global currentSpeed, currentCommand
	robot.reverse(currentSpeed)
	#print "Reverse ", currentSpeed
	
def left():
	global currentSpeed, currentCommand
	robot.spinLeft(currentSpeed)
	#print "Left ", currentSpeed
	
def right():
	global currentSpeed, currentCommand
	robot.spinRight(currentSpeed)
	#print "Right ", currentSpeed
	
def stop():
	global currentCommand
	robot.stopRobot()
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
		robot.turnForward(1.2*currentSpeed, currentSpeed * angle2SpeedPercent(angle))
		#print "forward right"

	if angle >= 80 and angle <= 100:
		forward()
		#print "full forward"

	if angle > 100 and angle < 170:
		robot.turnForward(currentSpeed * angle2SpeedPercent(angle), 1.2*currentSpeed)
		#print "forward left"

	if angle >= 170 and angle <= 190:
		left()
		#print "full left"

	if angle > 190 and angle < 260:
		robot.turnReverse(currentSpeed * angle2SpeedPercent(angle), 1.2*currentSpeed)
		#print "backward left"

	if angle >= 260 and angle <= 280:
		reverse()
		#print "full backward"

	if angle > 280 and angle < 350:
		robot.turnReverse(1.2*currentSpeed, currentSpeed * angle2SpeedPercent(angle))
		#print "backward right"
	
# convert a deg angle to percent of currentSpeed depending on the current quadrant
def angle2SpeedPercent(angle):
	return 1.0 *(angle % 90) / 70
	
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
