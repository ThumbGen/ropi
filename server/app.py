#!flask/bin/python
import time, atexit
from flask import Flask, jsonify
from pi2go import pi2go

baseApi = '/ropi/api/v1.0/';

app = Flask(__name__)
app.debug = True

vsn = 1
LEDon = 4095
LEDoff = 0

def init():
	pi2go.init()
	vsn = pi2go.version()
	
@app.route('/')
def index():
	return "Hello"

@app.route(baseApi + 'leds', methods=['GET'])	
def get_leds():
	return jsonify({'leds':2})

@app.route(baseApi + 'leds', methods=['PUT'])	
def put_leds():
	try:
		if vsn == 1:
			pi2go.setAllLEDs(LEDoff, LEDoff, LEDon)
			time.sleep(2)
			pi2go.setAllLEDs(LEDoff, LEDoff, LEDoff)
    
	except KeyboardInterrupt:
		print

#	finally:
#		pi2go.cleanup()
	return jsonify({'leds':2})

def perform_cleanup():
	pi2go.cleanup()
	
#Register the function to be called on exit
atexit.register(perform_cleanup)
#start...	
init()
if __name__ == '__main__':
	app.run(host='0.0.0.0')

	