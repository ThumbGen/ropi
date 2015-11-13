#!flask/bin/python
import time, atexit
from flask import Flask, jsonify, request
from pi2go import pi2go
import carLeds, leds

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__)
app.debug = True
vsn = 1 # robot version

def init():
	print "Initialized"
	pi2go.init()
	vsn = pi2go.version()
	carLeds.init()
	
@app.route('/')
def index():
	return "Hello"

@app.route(baseApi + 'leds', methods=['GET'])
def get_leds():
	return jsonify({'leds':2})

@app.route(baseApi + 'leds/<string:cmd_str>', methods=['PUT'])	
def put_leds(cmd_str):
	try:
		if vsn == 1:
			if cmd_str == "set":
				leds.set(request.json)
			else:
				carLeds.execute(cmd_str)
	except KeyboardInterrupt:
		print Stopped
	return jsonify({'leds':2})

def perform_cleanup():
	pi2go.cleanup()
	
#Register the function to be called on exit
atexit.register(perform_cleanup)
#start...	
init()
if __name__ == '__main__':
	app.run(host='0.0.0.0')

	