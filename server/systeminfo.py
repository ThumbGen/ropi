import psutil
from subprocess import PIPE, Popen
import backthread, time, json, hashlib
import robot

socketio = None
lastChecksum = None
voltage = 0

def poll():
	global lastChecksum, voltage
	if socketio != None:
		
		mempercent = psutil.virtual_memory().percent
		cpupercent = psutil.cpu_percent(interval=None)
		cputemp = get_cpu_temperature()
		
		secs = int(round(time.time()))
		# every 10 seconds update voltage (or if it is zero)
		if(secs % 10 == 0 or voltage == 0):
			v = robot.getVoltage()
			# sometimes getVoltage fails and returns 0...don't show it..wait for next read
			if(v != 0):
				voltage = v
		
		data = {'mp': mempercent, 'cp': cpupercent, 'ct': cputemp, 'v': voltage}
		checksum = hashlib.sha224(json.dumps(data)).hexdigest()
		if lastChecksum != checksum:
			socketio.emit('sysinfo', data)
			lastChecksum = checksum
	time.sleep(0.5)

def init(app, sio):
	global socketio, voltage
	socketio = sio
	backthread.start(app, poll)
	
def cleanup(app):
	backthread.stop(app)
	
def get_cpu_temperature():
    process = Popen(['vcgencmd', 'measure_temp'], stdout=PIPE)
    output, _error = process.communicate()
    return float(output[output.index('=') + 1:output.rindex("'")])
