# RoPi Remote Controlled Robot

### Under Construction! This documentation will be updated during the next days. 

### Table of Contents

- [How To Use It](#how-to-use-it)
    - [Prerequisites](#prerequisites)
	- [Introduction](#introduction)
		- [Screen Layout](#screen-layout)
		- [Indicators](#indicators)
		- [Controlling the Robot and the Camera](#controlling-the-robot-and-the-camera)
		- [Settings Menu](#settings-menu)
	- [Installation](#installation)
		- [Finding the Robot in Your Network](#finding-the-Robot-in-Your-Network)
		- [Setup the Server](#setup-the-server)
		- [Setup the Camera](#setup-the-camera)
- [Technical Details](#technical-details)
	- [Robot API](#robot-api)
	- [Server](#server)
	- [Server API](#server-api)
	- [Remote Control Web Interface](#remote-control-web-interface)
	- [Pending ToDos](#peding-todos)
	- [References](#references)

*RoPi* is a software solution for controlling a Raspberry Pi based robot:

  - Python based backend and webserver
  - Web interface for remote controlling it from any browser
  - Support for using the Raspberry Pi Camera module

<p align="center">
<img src="https://github.com/ThumbGen/ropi/blob/master/Pi2GoRobot.jpg?raw=true" width="400"/>
</p>

The reason behind implementing RoPi was offering the end user an easy to use solution for controlling the Raspberry Pi robot. It was implemented with the Pi2Go robot in mind but can be easily extended to support any other Raspberry Pi based robot.

## How To Use It

### Prerequisites
* A Raspberry Pi 2 based Robot
  * Pi2Go - Supported
  * GoPiGo - Planned
* WiFi connection
* Remote Access to the Raspberry Pi (eg. TightVNC) for installing RoPi
* A device running a web-browser for remote controlling the robot
  * Known issue: by default the RoPi configuration pulls a MJPEG stream from the camera (does not work in Internet Explorer)

### Introduction

After installing the RoPi software on the robot and rebooting the Raspberry Pi the robot should be ready to play (on the Pi2Go the *ready* state is signaled by the side-LEDs turning on green).
Typing the robot's address in a web browser will start the RoPi dashboard:

![alt text](https://github.com/ThumbGen/ropi/blob/master/RoPi_moving.jpg?raw=true "RoPi Remote in action")

NOTE: By default the web interface is available on port 80.

Clicking the toggle button labeled "Off" will turn on the robot:
* it is ready to receive commands
* it starts pushing informations to the dashboard (distance to obstacles, temperature, CPU load, etc.)
* if there is a Camera configured it starts streaming ("Cam On" toggle will be automatically activated)

It is possible for more than one person to watch the camera stream. In this scenario the one who controls the robot will start both the robot (green toggle shows "On") and the camera (blue toggle shows "Cam On"; the others will switch only the camera on (blue toggle "Cam On"). 

A demo video will be uploaded soon...

#### Screen Layout

The screen is split in 3 main areas:
  - the left gauge: it is a speedometer displaying the current speed (in percent), indicating the "cruising control" speed with a red triangle and showing a dummy (for now) odometer
  - the right gauge: it combines a temperature indicator with a "parking sensor"-like indicator below
  - between both gauges there is either an analog clock (when the camera is off) or the video stream of the PI's camera displayed

On the bottom right corner there are two buttons ( - and + ) used to decrease/increase the "cruising speed" of the robot.

#### Indicators

All available indicators are visible in the screenshot below:

![alt text](https://github.com/ThumbGen/ropi/blob/master/RoPi_indicators.jpg?raw=true "Startup test sequence RoPi Remote")

| Indicator     | Description   |
| ------------- |:-------------|
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Engine.svg "Engine")      | Indicates a broken socket.io link with the server |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Frontassist.svg "Frontassist")      | Indicates that the Front-assist feature is activated (less than 10cm to detected obstacle). The robot can be moved only to the left, right or backwards      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Headlights.svg "Headlights")      | Indicates that the car is moving forward and the front-lights are on      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Parkingbrake.svg "Parkingbrake")      | Indicates that the car is stopped (handbrake)      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Parkingsensors.svg "Parkingsensors")      | Indicates that the ultrasonic sensor is activated (front parking sensors)      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Seatbelt.svg "Seatbelt")      | Dummy seat belt indicator      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Temperature.svg "Temperature")      | Indicates that the Raspberry Pi's temperature is too high (overheating)      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Tempomat.svg "Tempomat")      | Indicates that the cruise control is activated and a certain speed is set      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Turnsignal.svg "Turnsignal")      | Indicates that the robot is moving either to the left or to the right      |

The **Parking Control** indicator informs about the distance to the next obstacle (in cm) and indicates visually the proximity to that object. It also displays information about the 2 sensors used for following a line.

Above the parking control there is a temperature indicator for the **current Raspberry Pi temperature**.

The **Odometer** displayed inside the speed gauge is not working for now. It is planned to display there the distance traveled by the robot :)

Above the camera there is a **working digital clock** and a dummy outside temperature display.
Under the camera there are two progress bars indicating the **current CPU and memory load**.

#### Controlling the Robot and the Camera

The screen is split into two logical areas. The left area is for controlling the robot's movement and the right area is for controlling the pan & tilt of the camera (if installed and activated).

By tapping on the left area (or on mouse down) **a green virtual joystick** will appear (see image above) and the robot will start moving accordingly to the joystick movements. By removing the finger from the screen (or mouse up) the robot will stop moving.

By tapping on the right area (or on mouse down) **a blue virtual joystick** will appear and the camera will pan and tilt accordingly to the joystick movements. By removing the finger from the screen (or mouse up) the camera will center (if the "Follow me" mode is currently selected).

#### Settings Menu

![alt text](https://github.com/ThumbGen/ropi/blob/master/RoPi_settings.jpg?raw=true "Settings")

The Robot IP or Host entry is automatically populated with the address of the robot where the web interface is currently connected. This address is used for pushing robot data to the remote (socket.io) and for the camera stream. By modifying this address is possible to connect to the camera stream of a different robot (if needed).

 - The *Shutdown Robot* button will trigger a graceful shutdown of the Raspberry Pi's operating system. NOTE: You still need to manually switch off the robot itself.

 - The *Reboot Robot* button will trigger a restart of the Raspberry Pi's operating system.

 - The *Stop Server* button is usually used to stop the RoPi server running on the Raspberry (useful when debugging).

### Installation

#### Finding the Robot in Your Network

If the robot has a user-customizable push button (like the Pi2Go for example) this could be used to ask the robot to send its IP address via email. This is useful when the robot is configured to use a dynamically assigned IP address.

Currently the button is configured to search for a file called "email_config.txt" in the *ropi* folder.
The file must contain 3 rows each separated by a CRLF:
* first row contains the Gmail address from which to send the IP
* second row contains the password for the above email
* third row contains the destination email address

Example *email_config.txt* file:

```
myrobot@gmail.com
mypassword
destination@xyz.com
```
NOTE: The robot sends the email using the Gmail service therefore the sender email address must be a Google email one.

#### Setup the Server

##### Interactive installation
An interactive installation script will be available soon.

##### Manual installation

* **Install the RoPi files**

Fetch the RoPi repository to a *ropi* folder on your Raspberry Pi:
```sh
$ cd /home/pi
$ git clone https://github.com/ThumbGen/ropi.git
$ cd ropi
$ sudo ./app.py
```
* **Configure RoPi to autostart during boot**

1. Create a *ropi* file for the startup script:
```
$ sudo nano /etc/init.d/ropi
```
2. Write the content below in that file:
```
#!/bin/sh

cd /home/pi/ropi/server
sudo ./api.py

esac

exit 0
```
3. Save and exit: Ctrl+X, Y, Enter

4. Make the script executable:
```
$ sudo chmod 755 /etc/init.d/ropi
```
5. Register script to be run at startup:
```
$ sudo update-rc.d ropi defaults
```

#### Setup the Camera
Under construction...

## Technical Details

Conceptual diagram..coming soon.

The RoPi "architecture" is very simple and straightforward:
* the **robot** layer contains the robot specific Python code and it is responsible for interfacing the robot's hardware with the next layer
* the **server** layer contains logical modules implementing robot's "features" and a Python (Flask) web server offering a simple API for remote control
* the **remote control** layer is a web-based interface designed around a car dashboard-concept; implementing it as a web application offers a great degree of portability: almost all browsers are supported and there is no "deployment" needed for the client


### Robot API

In order to be able to use the server with various robots a facade file named "robot.py" is used.
All RoPi code references the robot.py and calls its functions. The provided robot.py file works with the *Pi2Go* robot. If you need to interface a different robot type all you have to do is to make a backup copy of the provided file and then implement each of the required methods by calling your robots specific functions.


* **init()** - called once during the server's startup (used for initialising GPIO pins, switching motors and LEDs off, etc)
* **cleanup()** - called once during the server's shutdown (used to set all motors and LEDs off and set GPIO to standard values)
* **setLED(led, red, green, blue)** - set the LED specified to required RGB value (0 >= LED <= 4; 0 <= R,G,B <= 4095)
* **setAllLEDs(red, green, blue)** - set all LEDs to required RGB (0 <= R,G,B <= 4095)
* **irLeft()** - return the state of the left IR obstacle sensor
* **irRight()** - return the state of the right IR obstacle sensor
* **irCentre()** - return the state of the middle IR obstacle sensor
* **irLeftLine()** - return state of the left IR line sensor
* **irRightLine()** - return state of the right IR line sensor
* **getSwitch()** - return the value of the switch (pressed == true)
* **getLight(index)** - returns the value 0..1023 for the selected light sensor (0 <= index <= 3)
* **forward(speed)** - set all motors to move forward at speed (0 <= speed <= 100)
* **reverse(speed)** - set all motors to reverse at speed (0 <= speed <= 100)
* **spinLeft(speed)** - sets motors to turn opposite directions at speed (0 <= speed <= 100)
* **spinRight(speed)** - sets motors to turn opposite directions at speed (0 <= speed <= 100)
* **stop()** - stop motors
* **turnForward(leftSpeed, rightSpeed)** - move forwards in an arc by setting different speeds(0 <= leftSpeed,rightSpeed <= 100)
* **turnreverse(leftSpeed, rightSpeed)** - move backwards in an arc by setting different speeds(0 <= leftSpeed,rightSpeed <= 100)
* **getDistance()** - return the distance (in cm) to the nearest reflecting object (0 == no object)

### Server

Coming soon...

### Server API

The RoPi server can be used with a different web interface (or even native mobile apps) by accessing its API. 

[Click here for the server API documentation](http://docs.ropi.apiary.io/)

### Remote Control Web Interface

Coming soon...

### Pending ToDos
* make it work with the GoPiGo robot
* refactor the web interface to work without Visual Studio (ideally with Visual Studio Code or Atom)
* refactor the Python backend to allow easier integration of various robots


### References

RoPi uses a number of open source projects to work properly:

* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [jQuery] - fast, small, and feature-rich JavaScript library
* [js-cookie] - a simple, lightweight JavaScript API for handling cookies
* [fabric.js] - powerful and simple Javascript HTML5 canvas library
* [bootstrap-toggle] - highly flexible Bootstrap plugin that converts checkboxes into toggles
* [nippleJS] - a virtual joystick for touch capable interfaces
* [socket.io] - enables real-time bidirectional event-based communication
* [SteelSeries-Canvas] - the HTML5 Canvas port of the SteelSeries component library (gauges)

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [fabric.js]: <http://fabricjs.com>
   [bootstrap-toggle]: <http://www.bootstraptoggle.com/>
   [nippleJS]: <http://yoannmoinet.github.io/nipplejs/>
   [socket.io]: <http://http://socket.io/>
   [SteelSeries-Canvas]: <https://github.com/HanSolo/SteelSeries-Canvas/>
   [js-cookie]: <https://github.com/js-cookie/js-cookie/>
   
   
   
   


