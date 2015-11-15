#!flask/bin/python

from pi2go import pi2go

def get_lights_status():
	light0 = pi2go.getLight(0)
	light1 = pi2go.getLight(1)
	light2 = pi2go.getLight(2)
	light3 = pi2go.getLight(3)
	return { "0": light0, "1": light1, "2": light2, "3": light3 }