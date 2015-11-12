#!/usr/bin/env python
#Simply prints the state of the line follower sensors

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
        print 'Left:', pi2go.irLeftLine()
        print 'Right:', pi2go.irRightLine()
        print
        time.sleep(1)
                          
except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
