# RoPi Remote Controlled Robot

*RoPi* is a software solution for controlling a Raspberry Pi based robot:

  - Python based backend and webserver
  - Web interface for remote controlling it from any browser
  - Support for using the Raspberry Pi Camera module

> The reason behind implementing RoPi was offering the end user
> an easy to use solution for controlling the Raspberry Pi robot.
> It was implemented with the Pi2Go robot in mind but can be easily extended to support any
> other Raspberry Pi robot.

## How To Use It

### Introduction

![alt text](https://github.com/ThumbGen/ropi/blob/master/RoPi_moving.jpg?raw=true "RoPi Remote in action")

All the user has to do in order to control the robot (after installing the software on the robot) is to type the robot's address in a web browser. By default the web interface is available on port 80.

Clicking the toggle button labeled "Off" will "turn on" the robot by establishing a duplex (socket.io) connection with the server.

#### Screen Layout

The screen is split in 3 main areas:
  - the left gauge: it is a speedometer displaying the current speed (in percent) and indicates the "cruising control" speed with a red triangle
  - the right gauge: it combines a temperature indicator (10-90 degrees Celsius) with a "parking sensor" indicator.
  - between both gauges there is either an analog clock (when the camera is off) or the video stream of the PI's camera displayed; under the camera there are two "progressbar-like" indicators for the CPU load and memory load respectively

On the bottom right corner there are two buttons ( - and + ) used to decrease/increase the "cruising speed" of the robot.

#### Indicators

All available indicators are visible in the screenshot below:

![alt text](https://github.com/ThumbGen/ropi/blob/master/RoPi_indicators.jpg?raw=true "Startup test sequence RoPi Remote")

| Indicator     | Description   |
| ------------- |:-------------|
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Engine.svg "Engine")      | Indicates a broken socket.io link with the server |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Frontassist.svg "Frontassist")      | Indicates the Front-assist feature is activated (less than 10cm to detected obstacle. The robot can be moved only to the left, right or backwards      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Headlights.svg "Headlights")      | Indicates the the car is moving forward and the front-lights are on      |
| ![alt text](https://cdn.rawgit.com/thumbgen/ropi/master/server/remote/RoPiRemote/images/Headlights.svg "Headlights")      | Indicates the the car is moving forward and the front-lights are on      |


#### Controlling the Robot and the Camera

### Installation

```sh
$ git clone [git-repo-url] ropi
$ cd ropi
$ ./app.py
```

## Technical Details

### Remote Control

### Server

### Server API

### Robot Interface

### Refs

RoPi uses a number of open source projects to work properly:

* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [jQuery] - duh

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   
   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]:  <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>


