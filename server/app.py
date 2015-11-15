#!flask/bin/python
import time, atexit, threading, subprocess
from flask import Flask, jsonify, request
from pi2go import pi2go
import carLeds, leds, ultrasonic, lights, backthread, servo, button, motor, camera

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__)
app.debug = True
vsn = 1 # robot version

def init():
	global switchStatus
	switchStatus = False
	pi2go.init()
	vsn = pi2go.version()
	carLeds.init(app)
	button.init(app)
	print "Initialized"
	
@app.route('/')
def index():
	return "Hello"

@app.route(baseApi + 'camera/<string:cam_cmd>', methods=['PUT'])
def put_camera(cam_cmd):
	res = camera.execute(cam_cmd)
	return res
	
@app.route(baseApi + 'servos/pan/<int:pan_offset>', methods=['POST'])
def set_servos_pan_offset(pan_offset):
	servo.setPanOffset(pan_offset)
	return "ok"

@app.route(baseApi + 'servos/pan/<int:pan_value>', methods=['PUT'])
def set_servos_pan_value(pan_value):
	servo.setPanValue(pan_value)
	return "ok"
	
@app.route(baseApi + 'lights', methods=['GET'])
def get_lights():
	return jsonify(lights.get_lights_status())
	
@app.route(baseApi + 'leds/<string:cmd_str>', methods=['PUT'])	
def put_leds(cmd_str):
	if vsn == 1:
		carLeds.execute(cmd_str, request.json)
	return "OK"

@app.route(baseApi + 'motor/<string:cmd_motor>', methods=['PUT'], defaults={'cmd_speed': None})	
@app.route(baseApi + 'motor/<string:cmd_motor>/<int:cmd_speed>', methods=['PUT'])	
def put_motor(cmd_motor, cmd_speed):
	if vsn == 1:
		motor.execute(cmd_motor, cmd_speed)
	return "OK"
	
@app.route(baseApi + 'system/<string:cmd_system>', methods=['PUT'])
def put_system(cmd_system):
	if cmd_system == "reboot":
		command = "/usr/bin/sudo /sbin/shutdown -r now"
		process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
		output = process.communicate()[0]
		print output
	if cmd_system == "shutdown":
		command = "/usr/bin/sudo /sbin/shutdown now"
		process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
		output = process.communicate()[0]
		print output
	return "ok"

	
@app.route(baseApi + 'ultrasonic', methods=['GET'])
def get_ultrasonic():
	dist = ultrasonic.getDistance()
	return jsonify({ 'dist':dist})
	
def perform_cleanup():
	print "Cleanup"
	pi2go.cleanup()
	backthread.stop(app)
	
#Register the function to be called on exit
atexit.register(perform_cleanup)
#start...	
init()
if __name__ == '__main__':
	app.run(host='0.0.0.0')

	