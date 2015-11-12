import pi2go, time

pi2go.init()

vsn = pi2go.version()
try:
  if vsn != 1:
    print "This program only runs on the full Pi2Go"
  else:
    while True:
        pi2go.setAllLEDs(0, 0, 0) # start with all OFF
        for i in range(4):
            pi2go.setLED(i, 4095, 0, 0) # set to Red
            print 'Red'
            time.sleep(0.2)
            pi2go.setLED(i, 0, 0, 0)
        for i in range(4):
            pi2go.setLED(i, 0, 4095, 0) # set to Green
            print 'Green'
            time.sleep(0.2)
            pi2go.setLED(i, 0, 0, 0)
        for i in range(4):
            pi2go.setLED(i, 0, 0, 4095) # set to Blue
            print 'Blue'
            time.sleep(0.2)
            pi2go.setLED(i, 0, 0, 0)
        for i in range(4):
            pi2go.setLED(i, 4095, 4095, 4095) # set to White
            print 'White'
            time.sleep(0.2)
            pi2go.setLED(i, 0, 0, 0)

except KeyboardInterrupt:
    pi2go.cleanup()
