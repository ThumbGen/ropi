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

pi2go.init()

vsn = pi2go.version()
try:
    if vsn != 1:
        print "This program only runs on the full Pi2Go"
    else:
        pi2go.setAllLEDs(0, 0, 0)

        while True:
            light0 = pi2go.getLight(0)
            light1 = pi2go.getLight(1)
            light2 = pi2go.getLight(2)
            light3 = pi2go.getLight(3)
            print "Light sensors: ", light0, light1, light2, light3
            time.sleep(1)

except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
