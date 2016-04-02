import imp, os, json, sys

# robot is the global module which encapsulates the specific robot implementation (Pi2Go, GoPiGo, etc)
robot = None
# this is the json file where the configuration is loaded from
configFile = "robotConfig.json";

title = ""
robotType = None

def load():
	global robot, title, robotType
	
	#read the robotconfig.json file and see what type of robot is configured
	try:
		with open(configFile) as data_file:
			data = json.load(data_file)
		
		title = data["title"]
		robotType = data["robotType"]
		robotFile = data["robotFile"]
						
		robot = imp.load_source("robot", robotFile)
		# from this moment the robot import is available globally
		print "==========================================================================="
		print "Loaded " + title + " for " + robotType + " from " + robotFile
		print "==========================================================================="
	except Exception,e:
		print "Unexpected error:", sys.exc_info()[0]
		print str(e)
	
def save():
	return
	
def getTitle():
	return title

def getRobotType():
	return robotType

