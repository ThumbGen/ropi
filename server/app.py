#!flask/bin/python
import time, atexit, threading
from flask import Flask, jsonify, request
from pi2go import pi2go
import carLeds, leds, ultrasonic, backthread

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__)
app.debug = True
vsn = 1 # robot version

switchStatus = False

def button_logic():
	if pi2go.getSwitch():
		global switchStatus
		if switchStatus == False:
			print "Lights ON"
			carLeds.execute("dimmed")
		else:
			print "Lights OFF"
			carLeds.execute("off")
		switchStatus = not switchStatus

def init():
	global switchStatus
	switchStatus = False
	pi2go.init()
	vsn = pi2go.version()
	carLeds.init()
	backthread.start(app, button_logic)
	print "Initialized"
	
@app.route('/')
def index():
	return "Hello"

@app.route(baseApi + 'lights', methods=['GET'])
def get_lights():
	light0 = pi2go.getLight(0)
	light1 = pi2go.getLight(1)
	light2 = pi2go.getLight(2)
	light3 = pi2go.getLight(3)
	return jsonify({ "0": light0, "1": light1, "2": light2, "3": light3 })
	
@app.route(baseApi + 'leds/<string:cmd_str>', methods=['PUT'])	
def put_leds(cmd_str):
	if vsn == 1:
		if cmd_str == "set":
			leds.set(request.json)
		else:
			carLeds.execute(cmd_str)
	
	return jsonify({'leds':2})

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

	