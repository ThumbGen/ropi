#!flask/bin/python
import time
import robot
import leds, backthread

LEDon = 2095
LEDoff = 0
LEDonDimmed = 150
LEDonDimmed2 = 550
LEDonGO = 1000 # green for orange
LEDonLow = 10

Left = 0
Back = 1
Right = 2
Front = 3

Off = 0
Dimmed = 1
Full = 2
Custom = 3

BackStatus = Off
FrontStatus = Off

light_threshold = 50

def init(app):
	global BackStatus, FrontStatus
	BackStatus = Off
	FrontStatus = Off
	standby()
		
def cleanup(app):
	backthread.stop(app)	

def standby():
	robot.setLED(Left, LEDoff, LEDonLow, LEDoff)
	robot.setLED(Right, LEDoff, LEDonLow, LEDoff)

def alert():
	robot.setLED(Left, LEDoff, LEDon, LEDoff)
	robot.setLED(Right, LEDoff, LEDon, LEDoff)
	time.sleep(2)
	standby()

def allOff():
	global BackStatus, FrontStatus
	BackStatus = Off
	FrontStatus = Off
	robot.setAllLEDs(LEDoff, LEDoff, LEDoff)
		
def back():
	global BackStatus
	if BackStatus == Off:
		robot.setLED(Back, LEDoff, LEDoff, LEDoff)
	if BackStatus == Dimmed:
		robot.setLED(Back, LEDonDimmed, LEDoff, LEDoff)
	if BackStatus == Full:
		robot.setLED(Back, LEDon, LEDoff, LEDoff)

def front():
	global FrontStatus
	if FrontStatus == Off:
		robot.setLED(Front, LEDoff, LEDoff, LEDoff)
	if FrontStatus == Dimmed:
		robot.setLED(Front, LEDonDimmed2, LEDonDimmed2, LEDonDimmed2)
	if FrontStatus == Full:
		robot.setLED(Front, LEDon, LEDon, LEDon)

def execute(cmd_str, LEDData = None, source = None):
	global BackStatus, FrontStatus
	
	if cmd_str == "set":
		BackStatus = Custom
		FrontStatus = Custom
		leds.set(LEDData)
	
	if cmd_str == "off":
		if BackStatus == Off and FrontStatus == Off:
			return
		allOff()
		
	if cmd_str == "brake":
		FrontStatus = Off
		front()
		tmp = BackStatus
		BackStatus = Full
		back()
		time.sleep(1)
		if tmp == Full:
			tmp = Off
		BackStatus = tmp
		back()
						
	if cmd_str == "dimmed":
		if BackStatus == Dimmed or FrontStatus == Dimmed:
			return
		BackStatus = Dimmed
		FrontStatus = Dimmed
		front()
		back()
		
	if cmd_str == "flash":
		tmp = FrontStatus
		FrontStatus = Full
		front()
		time.sleep(1)
		FrontStatus = tmp
		front()

	if cmd_str == "forward":
		FrontStatus = Full
		front()