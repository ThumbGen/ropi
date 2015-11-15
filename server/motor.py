#!flask/bin/python

from pi2go import pi2go

currentSpeed = 30
currentCommand = None

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
	global currentSpeed, currentCommand
	pi2go.forward(currentSpeed)
	print "Forward ", currentSpeed
	
def reverse():
	global currentSpeed, currentCommand
	pi2go.reverse(currentSpeed)
	print "Reverse ", currentSpeed
	
def left():
	global currentSpeed, currentCommand
	pi2go.spinLeft(currentSpeed)
	print "Left ", currentSpeed
	
def right():
	global currentSpeed, currentCommand
	pi2go.spinRight(currentSpeed)
	print "Right ", currentSpeed
	
def stop():
	global currentCommand
	pi2go.stop()
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