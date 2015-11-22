#!flask/bin/python

from pi2go import pi2go
import backthread, time, ultrasonic, json, hashlib

socketio = None
lastAroundChecksum = None

def poll_around():
	global lastAroundChecksum
	if socketio != None:
		dist = int(ultrasonic.getDistance())
		l = pi2go.irLeft()
		r = pi2go.irRight()
		c = pi2go.irCentre()
		ll = pi2go.irLeftLine()
		rl = pi2go.irRightLine()
		data = {'d': dist, 'l': l, 'c': c,'r': r, 'll': ll, 'rl': rl}
		checksum = hashlib.sha224(json.dumps(data)).hexdigest()
		if lastAroundChecksum != checksum:
			socketio.emit('parking', data)
			lastAroundChecksum = checksum
	time.sleep(0.25)

def init(app, sio):
	global socketio
	socketio = sio
	backthread.start(app, poll_around)
	
def cleanup(app):
	backthread.stop(app)
