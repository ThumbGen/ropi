#!/usr/bin/python
#
# Pi2Go Demo Code using the Pi2Go library
#
# Created by Gareth Davies, May 2014
# Copyright 4tronix
#
# This code is in the public domain and may be freely copied and used
# No warranty is provided or implied
#
#======================================================================

import pi2go, time
LEDon = 4095
LEDoff = 0

pi2go.init()

vsn = pi2go.version()
try:
  if vsn != 1:
    print "This program only runs on the full Pi2Go"
  else:
    pi2go.setAllLEDs(LEDoff, LEDoff, LEDoff)

    while True:
        pi2go.setAllLEDs(LEDon, LEDoff, LEDoff)
        print "Red"
        time.sleep(2)
        pi2go.setAllLEDs(LEDoff, LEDon, LEDoff)
        print "Green"
        time.sleep(2)
        pi2go.setAllLEDs(LEDoff, LEDoff, LEDon)
        print "Blue"
        time.sleep(2)
        pi2go.setAllLEDs(LEDon, LEDon, LEDon)
        print "White"
        time.sleep(2)
        pi2go.setAllLEDs(LEDoff, LEDoff, LEDoff)
        for i in range (4):
            pi2go.setLED(i, LEDon, LEDoff, LEDoff)
            time.sleep(0.5)
            pi2go.setLED(i, LEDoff, LEDon, LEDoff)
            time.sleep(0.5)
            pi2go.setLED(i, LEDoff, LEDoff, LEDon)
            time.sleep(0.5)
            pi2go.setLED(i, LEDoff, LEDoff, LEDoff)
            time.sleep(0.5)
except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
