# Pi2Go Wheel Sensor Test (only if addon is fitted)
# Moves: Forward, Reverse, spin Right, spin Left, Stop using arrow keys and space bare
# moves one wheel revolution for each step
# Press , . or < > to speed up slow down
# Press Ctrl-C to stop
#
# To check wiring is correct ensure the order of movement as above is correct
# Run using: sudo python beebot.py


import time
import pi2go

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

speed = 30

pi2go.init()

# main loop
try:
    while True:
        keyp = readkey()
        if keyp == 'w' or ord(keyp) == 16:
            pi2go.stepForward(speed, 16)
            print 'Forward', speed
        elif keyp == 'z' or ord(keyp) == 17:
            pi2go.stepReverse(speed, 16)
            print 'Reverse', speed
        elif keyp == 's' or ord(keyp) == 18:
            pi2go.stepSpinR(speed, 7)
            print 'Spin Right', speed
        elif keyp == 'a' or ord(keyp) == 19:
            pi2go.stepSpinL(speed, 7)
            print 'Spin Left', speed
        elif keyp == 'n':
            pi2go.turnForward(0, speed)
            print 'Stop Left wheel', speed
        elif keyp == 'm':
            pi2go.turnForward(speed, 0)
            print 'Stop Right wheel', speed
        elif keyp == 'p':
            pi2go.stepForward(speed, 16, 16)
            print 'Step Forward', speed, 16, 16
        elif keyp == '.' or keyp == '>':
            speed = min(100, speed+10)
            print 'Speed+', speed
        elif keyp == ',' or keyp == '<':
            speed = max (0, speed-10)
            print 'Speed-', speed
        elif keyp == ' ':
            pi2go.stop()
            print 'Stop'
        elif keyp == '0':
            leftCount = 0
            rightCount = 0
        elif ord(keyp) == 3:
            break
        time.sleep(0.1)
        print "Left, Right:", pi2go.countL, pi2go.countR

except KeyboardInterrupt:
    print

finally:
    pi2go.cleanup()
    
