#!flask/bin/python

from flask import Flask, jsonify
from pi2go import pi2go

def checkIndex(idx):
	if idx < 0 or idx > 3:
		print "Invalid LED index: " + str(idx)
		return False
	print "Led: " + str(idx)
	return True

def checkColor(value):
	if value < 0 or value > 4095:
		print "Invalid value: " + str(value)
		return False
	return True
	
def set(config):
	print config
	for led in config['leds']:
		idx = led['led']
		if not checkIndex(idx):
			continue
		red = led['red']
		if not checkColor(red):
			continue
		green = led['green']
		if not checkColor(green):
			continue
		blue = led['blue']
		if not checkColor(blue):
			continue
		pi2go.setLED(idx, red, green, blue)
	
#[
#            {
#                "led": 0,
#                "red": 1000,
#                "green": 1000,
#                "blue": 1000,
#            },
#            {
#                "led": 1,
#                "red": 1000,
#                "green": 1000,
#                "blue": 1000,
#            },
#            {
#                "led": 2,
#                "red": 1000,
#                "green": 1000,
#                "blue": 1000,
#            },
#            {
#                "led": 3,
#                "red": 1000,
#                "green": 1000,
#                "blue": 1000,
#            }
#]	