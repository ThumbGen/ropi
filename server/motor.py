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
	if currentBlinker == BLeft:
		carLeds.execute("left") #toggle left off
	if currentBlinker == BRight:
		carLeds.execute("right") #toggle right off
	currentBlinker = BNone
	print "Forward ", currentSpeed
	
def reverse():
	global currentSpeed, currentCommand
	pi2go.reverse(currentSpeed)
	print "Reverse ", currentSpeed
	
def left():
	global currentSpeed, currentCommand, currentBlinker
	pi2go.spinLeft(currentSpeed)
	if currentBlinker != BLeft:
		carLeds.execute("left")
	currentBlinker = BLeft
	print "Left ", currentSpeed
	
def right():
	global currentSpeed, currentCommand, currentBlinker
	pi2go.spinRight(currentSpeed)
	if currentBlinker != BRight:
		carLeds.execute("right")
	currentBlinker = BRight
	print "Right ", currentSpeed
	
def stop():
	global currentCommand
	pi2go.stop()
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