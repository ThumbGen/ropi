#!flask/bin/python

from pi2go import pi2go

def getDistance():
	dist = pi2go.getDistance()
	dist = (int(dist * 10)) / 10.0
    #print "Distance: ", dist
	return dist
	