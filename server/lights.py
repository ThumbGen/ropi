#!flask/bin/python

import robot

def get_lights_status():
	light0 = robot.getLight(0)
	light1 = robot.getLight(1)
	light2 = robot.getLight(2)
	light3 = robot.getLight(3)
	return { "0": light0, "1": light1, "2": light2, "3": light3 }