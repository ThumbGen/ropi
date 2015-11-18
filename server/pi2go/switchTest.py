#!/usr/bin/env python
#Simply prints the state of the input button

# Must be run as root - sudo python .py 

import time, pi2go

pi2go.init()

vsn = pi2go.version()
if vsn == 1:
  print "Running on Pi2Go"
else:
  print "Running on Pi2Go-Lite"

try:
  while True:
    if pi2go.getSwitch():
      print "ON"
    else:
      print "OFF"
    time.sleep(0.5)

except KeyboardInterrupt:
  print

finally:
  pi2go.cleanup()
  
  
