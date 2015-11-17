#!flask/bin/python

from pi2go import pi2go
import carLeds

BNone = 0
BLeft = 1
BRight = 2

currentSpeed = 30
currentCommand = None
currentBlinker = BNone

def execute(cmd, speed = None):
	global currentCommand
	# if cmd is "speed" just execute adjustSpeed
	adjustSpeed(speed)
	if cmd == "speed":
		if currentCommand != None:
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
	currentCommand = cmd

def forward():
	global currentSpeed, currentCommand, currentBlinker
	pi2go.forward(currentSpeed)
	resetBlinkers()
	print "Forward ", currentSpeed
	
def reverse():
	global currentSpeed, currentCommand
	pi2go.reverse(currentSpeed)
	resetBlinkers()
	print "Reverse ", currentSpeed
	
def left():
	global currentSpeed, currentCommand, currentBlinker
	#pi2go.spinLeft(currentSpeed)
	pi2go.go(currentSpeed * 60/100, currentSpeed)
	resetBlinkers()
	carLeds.execute("left")
	currentBlinker = BLeft
	print "Left ", currentSpeed
	
def right():
	global currentSpeed, currentCommand, currentBlinker
	#pi2go.spinRight(currentSpeed)
	pi2go.go(currentSpeed, currentSpeed * 60/100)
	resetBlinkers()
	carLeds.execute("right")
	currentBlinker = BRight
	print "Right ", currentSpeed
	
def stop():
	global currentCommand
	pi2go.stop()
	resetBlinkers()
	carLeds.execute("brake")
	print "Stopped"
	
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
	
def resetBlinkers():
	global currentBlinker
	if currentBlinker == BLeft:
		carLeds.execute("left")
	if currentBlinker == BRight:
		carLeds.execute("right")
	currentBlinker = BNone