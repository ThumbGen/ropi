import psutil
from subprocess import PIPE, Popen
import backthread, time, json, hashlib

socketio = None
lastChecksum = None

def poll():
	global lastChecksum
	if socketio != None:
		
		mempercent = psutil.virtual_memory().percent
		cpupercent = psutil.cpu_percent(interval=None)
		cputemp = get_cpu_temperature()
		
		data = {'mp': mempercent, 'cp': cpupercent, 'ct': cputemp}
		checksum = hashlib.sha224(json.dumps(data)).hexdigest()
		if lastChecksum != checksum:
			socketio.emit('sysinfo', data)
			lastChecksum = checksum
	time.sleep(0.25)

def init(app, sio):
	global socketio
	socketio = sio
	backthread.start(app, poll)
	
def cleanup(app):
	backthread.stop(app)
	
def get_cpu_temperature():
    process = Popen(['vcgencmd', 'measure_temp'], stdout=PIPE)
    output, _error = process.communicate()
    return float(output[output.index('=') + 1:output.rindex("'")])
