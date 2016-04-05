import imp, os, json, sys

# robot is the global module which encapsulates the specific robot implementation (Pi2Go, GoPiGo, etc)
robot = None

title = ""
robotType = None

def load():
	# TODO: define a list of configs in some external file
	
	if tryLoad("robotConfig_Pi2Go.json"):
		return
	if tryLoad("robotConfig_GoPiGo.json"):
		return
		
def save():
	return
	
def getTitle():
	return title

def getRobotType():
	return robotType

def tryLoad(configFile):
	global robot, title, robotType

	#read the robotconfig.json file and see what type of robot is configured
	try:
		with open(configFile) as data_file:
			data = json.load(data_file)
		
		title = data["title"]
		robotType = data["robotType"]
		robotFile = data["robotFile"]
						
		robot = imp.load_source("robot", robotFile)
		print "Checking if " + configFile + " is applicable..."
		if robot.isInstalled():
			# from this moment the robot import is available globally
			print "==========================================================================="
			print "Loaded " + title + " for " + robotType + " from " + robotFile
			print "==========================================================================="
			return True
		else:
			return False
	
	except: #Exception,e:
		print "Unexpected error:", sys.exc_info()[0]
		#print str(e)
		return False
	return False