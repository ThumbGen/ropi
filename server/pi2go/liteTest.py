#!/usr/bin/env python
# Simple demo of White LEDs on Pi2Go-Lite

# Must be run as root - sudo python .py 

import time, pi2go

front = 0
rear = 1
LEDon = 1
LEDoff = 0

pi2go.init()

vsn = pi2go.version()
try:
  if vsn != 2:
    print "This program only runs on Pi2Go-Lite"
  else:
    while True:
      pi2go.LsetLED(front, LEDon)
      time.sleep(0.5)
      pi2go.LsetLED(front, LEDoff)
      time.sleep(0.5)
      pi2go.LsetLED(rear, LEDon)
      time.sleep(0.5)
      pi2go.LsetLED(rear, LEDoff)
      time.sleep(0.5)

except:
  print

finally:
  pi2go.cleanup()
  
  
