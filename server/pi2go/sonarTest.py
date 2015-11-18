import time
import pi2go

pi2go.init()

fast=50
slow=30

try:
    while True:
        dist = pi2go.getDistance()
        print "Distance: ", (int(dist * 10)) / 10.0
        time.sleep(1)

except:
    print

finally:
    pi2go.cleanup()
