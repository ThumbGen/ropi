#!flask/bin/python
import time, atexit, threading, subprocess, os, sys, signal
from flask import Flask, jsonify, request
from pi2go import pi2go
import carLeds, leds, ultrasonic, lights, backthread, pantilt, button, motor, camera, emailer
import RPi.GPIO as GPIO

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__)
app.debug = False
vsn = 1 # robot version

def init():
	global switchStatus
	switchStatus = False
	GPIO.setwarnings(False)
	pi2go.init()
	vsn = pi2go.version()
	carLeds.init(app)
	button.init(app)
	pantilt.init()
	#inform_ip()
	print "app Init done - Initialized"
	
@app.route('/')
def index():
	return "Hello"

@app.route(baseApi+ 'quit', methods=['PUT'])
def quit_prog():
	#sys.exit("User closed the server...")
	#quit()
	#myPid = os.getpid()
	#os.kill(myPid, signal.SIGINT)
	#sys.exit("done")
	func = request.environ.get('werkzeug.server.shutdown')
	if func is None:
		raise RuntimeError('Not running with the Werkzeug Server')
	func()
		
@app.route(baseApi + 'camera/<string:cam_cmd>', methods=['PUT'])
def put_camera(cam_cmd):
	res = camera.execute(cam_cmd)
	return res
	
@app.route(baseApi + 'servos/tilt/<int:value>', methods=['PUT'])
def set_servos_tilt_value(value):
	pantilt.setTiltValue(value)
	return value

@app.route(baseApi + 'servos/pan/<int:value>', methods=['PUT'])
def set_servos_pan_value(value):
	pantilt.setPanValue(value)
	return value

@app.route(baseApi + 'servos/center', methods=['PUT'])
def set_servos_center():
	pantilt.center()
	return "ok" 
	
@app.route(baseApi + 'lights', methods=['GET'])
def get_lights():
	return jsonify(lights.get_lights_status())
	
@app.route(baseApi + 'leds/<string:cmd_str>', methods=['PUT'])	
def put_leds(cmd_str):
	if vsn == 1:
		print 'received'
		json = None
		try:
			json = request.get_json(force=True)
		except:
			pass
		print json
		carLeds.execute(cmd_str, json)
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
	
def inform_ip():
	f = os.popen('ifconfig wlan0 | grep "inet\ addr" | cut -d: -f2 | cut -d" " -f1')
	ip=f.read()
	print ip
	emailer.send_email("raspig8@gmail.com", "G4T3C0NTR0L", "rvacaru@gmail.com", "Robot IP", ip)
	
def perform_cleanup():
	print "Cleanup"
	pi2go.cleanup()
	backthread.stop(app)
	
#Register the function to be called on exit
atexit.register(perform_cleanup)
#start...	
init()
if __name__ == '__main__':
	app.run(host='0.0.0.0', port=80)