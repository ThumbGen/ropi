import imp, os, json, sys

# robot is the global module which encapsulates the specific robot implementation (Pi2Go, GoPiGo, etc)
robot = None

robotType = None
robotLogo = None

def load():
	# TODO: define a list of configs in some external file
	
	if tryLoad("Pi2GoConfig.json"):
		return
	if tryLoad("GoPiGoConfig.json"):
		return	
	
def save():
	return
	
def getRobotType():
	return robotType
	
def getRobotLogo():
	return robotLogo

def tryLoad(configFile):
	global robot, robotType, robotLogo

	#read the robotconfig.json file and see what type of robot is configured
	try:
		with open(configFile) as data_file:
			data = json.load(data_file)
		
		robotType = data["robotType"]
		robotFile = data["robotFile"]
		robotLogo = data["robotLogo"]
						
		robot = imp.load_source("robot", robotFile)
		print "Checking if " + configFile + " is applicable..."
		if robot.isInstalled():
			# from this moment the robot import is available globally
			print "==========================================================================="
			print "Loaded " + robotType + " from " + robotFile
			print "==========================================================================="
			return True
		else:
			return False
	
	except: #Exception,e:
		print "Unexpected error:", sys.exc_info()[0]
		#print str(e)
		return False
	return False