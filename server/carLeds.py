#!flask/bin/python
import time
from pi2go import pi2go
import leds

LEDon = 2095
LEDoff = 0
LEDonDimmed = 150
LEDonGO = 1000 # green for orange

Left = 0
Back = 1
Right = 2
Front = 3

Off = 0
Dimmed = 1
Full = 2

BlinkNone = 0
BlinkLeft = 1
BlinkRight = 2

BackStatus = Off
FrontStatus = Off
BlinkerStatus = BlinkNone

def init():
	global BackStatus
	BackStatus = Off
	global FrontStatus
	FrontStatus = Off
	global LeftStatus
	BlinkerStatus = BlinkNone
	
def allOff():
	pi2go.setAllLEDs(LEDoff, LEDoff, LEDoff)
	
def back():
	if BackStatus == Off:
		pi2go.setLED(Back, LEDoff, LEDoff, LEDoff)
	if BackStatus == Dimmed:
		pi2go.setLED(Back, LEDonDimmed, LEDoff, LEDoff)
	if BackStatus == Full:
		pi2go.setLED(Back, LEDon, LEDoff, LEDoff)

def front():
	if FrontStatus == Off:
		pi2go.setLED(Front, LEDoff, LEDoff, LEDoff)
	if FrontStatus == Dimmed:
		pi2go.setLED(Front, LEDonDimmed, LEDonDimmed, LEDonDimmed)
	if FrontStatus == Full:
		pi2go.setLED(Front, LEDon, LEDon, LEDon)

def toggleblink(direction):
	if direction == "left":
		global BlinkerStatus
		if BlinkerStatus == BlinkNone:
			pi2go.setLED(Left, LEDon, LEDonGO, LEDoff)
			BlinkerStatus = BlinkLeft
		elif BlinkerStatus == BlinkLeft:
			pi2go.setLED(Left, LEDoff, LEDoff, LEDoff)
			BlinkerStatus = BlinkNone
		elif BlinkerStatus == BlinkRight:
			pi2go.setLED(Right, LEDoff, LEDoff, LEDoff)
			pi2go.setLED(Left, LEDon, LEDonGO, LEDoff)
			BlinkerStatus = BlinkLeft
	if direction == "right":
		global BlinkerStatus
		if BlinkerStatus == BlinkNone:
			pi2go.setLED(Right, LEDon, LEDonGO, LEDoff)
			BlinkerStatus = BlinkRight
		elif BlinkerStatus == BlinkRight:
			pi2go.setLED(Right, LEDoff, LEDoff, LEDoff)
			BlinkerStatus = BlinkNone
		elif BlinkerStatus == BlinkLeft:
			pi2go.setLED(Left, LEDoff, LEDoff, LEDoff)
			pi2go.setLED(Right, LEDon, LEDonGO, LEDoff)
			BlinkerStatus = BlinkRight
		
def execute(cmd_str):
	if cmd_str == "off":
		allOff()
		
	if cmd_str == "brake":
		global BackStatus
		tmp = BackStatus
		BackStatus = Full
		back()
		time.sleep(1)
		BackStatus = tmp
		back()
		
	if cmd_str == "dimmed":
		global BackStatus
		BackStatus = Dimmed
		FrontStatus = Dimmed
		front()
		back()
		
	if cmd_str == "flash":
		global FrontStatus
		tmp = FrontStatus
		FrontStatus = Full
		front()
		time.sleep(1)
		FrontStatus = tmp
		front()
		
	if cmd_str == "left" or cmd_str == "right":
		toggleblink(cmd_str)
			
		