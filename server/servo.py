#!flask/bin/python

from pi2go import pi2go

# Define pins for Pan/Tilt
pan = 15
tilt = 14
tVal = 0 # 0 degrees is centre
pVal = 0 # 0 degrees is centre


def setPanValue(value):
	global pVal
	#value = int(svalue)
	if value < -90 or value > 90:
		return
	pVal = value
	pi2go.setServo(pan, pVal)
	print "pan:", pVal
	
def setPanOffset(offset):
	print "offset"
	#value = pVal + int(offset)
	value = pVal + offset
	setPanValue(value)
	
