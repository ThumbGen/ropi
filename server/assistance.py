#!flask/bin/python

from pi2go import pi2go
import backthread, time, ultrasonic

socketio = None

def poll_around():
	if socketio != None:
		dist = ultrasonic.getDistance()
		l = pi2go.irLeft()
		r = pi2go.irRight()
		c = pi2go.irCentre()
		ll = pi2go.irLeftLine()
		rl = pi2go.irRightLine()
		socketio.emit('parking', {'d': dist, 'l': l, 'c': c,'r': r, 'll': ll, 'rl': rl})
	time.sleep(0.5)

def init(app, sio):
	global socketio
	socketio = sio
	backthread.start(app, poll_around)
