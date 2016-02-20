#!flask/bin/python

import robot

def getDistance():
	dist = robot.getDistance()
	dist = (int(dist * 10)) / 10.0
    #print "Distance: ", dist
	return dist
	