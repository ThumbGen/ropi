#!/usr/bin/python
# servoTest.py

import pi2go

# Define pins for Pan/Tilt
pan = 15
tilt = 14
tVal = 0 # 0 degrees is centre
pVal = 0 # 0 degrees is centre

#======================================================================
# Reading single character by forcing stdin to raw mode
import sys
import tty
import termios

def readchar():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    if ch == '0x03':
        raise KeyboardInterrupt
    return ch

def readkey(getchar_fn=None):
    getchar = getchar_fn or readchar
    c1 = getchar()
    if ord(c1) != 0x1b:
        return c1
    c2 = getchar()
    if ord(c2) != 0x5b:
        return c1
    c3 = getchar()
    return chr(0x10 + ord(c3) - 65)  # 16=Up, 17=Down, 18=Right, 19=Left arrows

# End of single character reading
#======================================================================


pi2go.init()
if pi2go.version() == 1:
    print "Pi2Go Version: FULL"
else:
    print "Pi2Go Version: LITE"

def doServos():
    pi2go.setServo(pan, pVal)
    pi2go.setServo(tilt, tVal)

print "Use Arrows or W-Up, Z-Down, A-Left, S-Right Space=Centre, ^C=Exit:"

try:
    while True:
        key = readkey()
        if key == ' ':
            tVal = 0
            pVal = 0
            doServos()
            print "Centre"

        if key ==' x' or key == '.':
            pi2go.stopServos()
            print "Stop"

        elif key == 'w' or ord(key) == 16:
            pVal += 10
            doServos()
            print "Up"

        elif key == 'a' or ord(key) == 19:
            tVal -= 10
            doServos()
            print "Left"

        elif key == 's' or ord(key) == 18:
            tVal += 10
            doServos()
            print "Right"

        elif key == 'z' or ord(key) == 17:
            pVal -= 10
            doServos()
            print "Down"

        elif key == 'g':
            pi2go.startServos()
            print "Down"
        elif ord(key) == 3:
            break

except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
