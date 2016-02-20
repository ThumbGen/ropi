#!flask/bin/python
import time, atexit, threading, subprocess, os, sys, signal
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import robot
import carLeds, leds, ultrasonic, lights, pantilt, button, motor, camera, assistance, systeminfo
import RPi.GPIO as GPIO

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__, static_folder='remote/RoPiRemote')
app.debug = False
socketio = SocketIO(app)

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  return response

#@socketio.on('connect', namespace='/test')
@socketio.on('connect')
def handle_connect():
	socketio.emit('connected', { 'data' : 'Welcome to RoPi!' })
	print "Got a connect request"

@socketio.on_error_default
def default_error_handler(e):
	print request.event["message"]	# "my error event"
	print request.event["args"]	# (data,)
	pass
	
def init():
	global switchStatus
	switchStatus = False
	GPIO.setwarnings(False)
	robot.init()
	carLeds.init(app)
	button.init(app)
	pantilt.init(app)
	systeminfo.init(app, socketio)
	assistance.init(app, socketio)
	print "app Init done - Initialized"
	
def perform_cleanup():
	print "Cleaning..."
	robot.cleanup()
	button.cleanup(app)
	carLeds.cleanup(app)
	assistance.cleanup(app)	
	systeminfo.cleanup(app)
	pantilt.cleanup(app)
	print "Cleaned"

	
@app.route('/', defaults={'path': 'index.html'})	
@app.route('/<path:path>')
def getFile(path):
	if path == '':
		path = 'index.html'
	return app.send_static_file(path)

	
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
	res = pantilt.setTiltValue(value)
	return jsonify(res)

@app.route(baseApi + 'servos/pan/<int:value>', methods=['PUT'])
def set_servos_pan_value(value):
	res = pantilt.setPanValue(value)
	return jsonify(res)

# parser does not support negative numbers (!!) therefore we use string
@app.route(baseApi + 'servos/percent/<string:pan>/<string:tilt>', methods=['PUT'])
def set_servos_pan_tilt_percent(pan, tilt):
	res = pantilt.setPanTiltPercent(int(pan), int(tilt))
	return jsonify(res)	
	
# cmd indicates direction: left, right, up, down, stop
@app.route(baseApi + 'servos/move/<string:cmd>', methods=['PUT'])
def set_servos_move_direction(cmd):
	res = pantilt.setMoveDirection(app, cmd)
	return jsonify(res)	
	
	
@app.route(baseApi + 'servos/center', methods=['PUT'])
def set_servos_center():
	res = pantilt.center()
	return jsonify(res)
	
@app.route(baseApi + 'lights', methods=['GET'])
def get_lights():
	return jsonify(lights.get_lights_status())
	
@app.route(baseApi + 'leds/<string:cmd_str>', methods=['PUT'])	
def put_leds(cmd_str):
	print 'received leds request'
	socketio.emit('ultrasonic', {'dist': '123'})
	json = None
	try:
		json = request.get_json(force=True)
	except:
		pass
	print 'data:', json
	carLeds.execute(cmd_str, json)
	return "OK"

#speed argument can be either speed or angle (for 'move' is angle)
@app.route(baseApi + 'motor/<string:cmd_motor>', methods=['PUT'], defaults={'cmd_speed': None})	
@app.route(baseApi + 'motor/<string:cmd_motor>/<int:cmd_speed>', methods=['PUT'])	
def put_motor(cmd_motor, cmd_speed):
	res = motor.execute(cmd_motor, cmd_speed)
	return jsonify(res)

@app.route(baseApi + 'system/<string:cmd_system>', methods=['PUT'])
def put_system(cmd_system):
	if cmd_system == "reboot":
		perform_cleanup()
		command = "/usr/bin/sudo /sbin/shutdown -r now"
		process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
		output = process.communicate()[0]
		print output
	if cmd_system == "shutdown":
		perform_cleanup()
		command = "/usr/bin/sudo /sbin/shutdown now"
		process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
		output = process.communicate()[0]
		print output
	return "ok"

	
@app.route(baseApi + 'ultrasonic', methods=['GET'])
def get_ultrasonic():
	dist = ultrasonic.getDistance()
	return jsonify({ 'dist':dist})

#Register the function to be called on exit
atexit.register(perform_cleanup)
#start...	
init()
if __name__ == '__main__':
	#app.run(host='0.0.0.0', port=80)
	socketio.run(app, host='0.0.0.0', port=80)