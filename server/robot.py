from pi2go import pi2go

def init():
	pi2go.init()
	
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
	
def irLeftLine():
	return pi2go.irLeftLine()
	
def irRightLine():
	return pi2go.irRightLine()
	
def getSwitch():
	return pi2go.getSwitch()
	
def getLight(index):
	return pi2go.getLight(index)
	
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
	
def getDistance():
	return pi2go.getDistance()