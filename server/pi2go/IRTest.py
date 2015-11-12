#!/usr/bin/env python
#Simply prints the state of the obstacle sensors

# Must be run as root - sudo python .py 

import time, pi2go

pi2go.init()

vsn = pi2go.version()
if vsn == 1:
  print "Running on Pi2Go"
else:
  print "Running on Pi2Go-Lite"
count = 1

try:
    while True:
        print 'Count: ', count
        print 'Left:', pi2go.irLeft()
        if vsn == 1:
            print 'Centre:', pi2go.irCentre()
        print 'Right:', pi2go.irRight()
        print 'Line left', pi2go.irLeftLine()
        print 'Line right', pi2go.irRightLine()
        print
        count += 1
        time.sleep(1)
                          
except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
