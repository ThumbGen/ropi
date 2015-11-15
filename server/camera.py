#!flask/bin/python

import subprocess

def start():
	cmd = ["sudo","service","uv4l_raspicam", "restart"]
	p = subprocess.Popen(cmd, stdout = subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
	out,err = p.communicate()
	return out
	
def stop():
	cmd = ["sudo","service","uv4l_raspicam", "stop"]
	p = subprocess.Popen(cmd, stdout = subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
	out,err = p.communicate()
	return out
	
def execute(cmd):
	if cmd == "stop":
		stop()
		return "camera stopped"
	else:
		start()
		return "camera started"
