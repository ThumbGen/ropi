$(document).ready(function () {
    new Application().run();
});
var Application = (function () {
    function Application() {
        var _this = this;
        this.socketio = null;
        this.robotIpEntry = null;
        this.cameraButton = null;
        this.connectButton = null;
        this.cameraControlsButton = null;
        this.cameraControlsOff = null;
        this.cameraControlsJoystick = null;
        this.cameraControlsSteppedJoystick = null;
        this.robotControls = new RobotControls();
        this.cameraControls = new CameraControls();
        this.run = function () {
            _this.robotControls.init();
            _this.cameraControls.init();
            _this.cameraButton = $("#cameraButton");
            _this.cameraButton.bootstrapToggle();
            _this.cameraButton.change(function () {
                _this.processToggleCamera();
            });
            _this.connectButton = $("#connectButton");
            _this.connectButton.bootstrapToggle();
            _this.connectButton.change(function () {
                _this.processRobotToggle();
            });
            _this.cameraControlsButton = $("#controlsButtonOptions");
            _this.cameraControlsJoystick = $("#controlsJoystick").click(function () {
                _this.cameraControls.selectMode(CameraControl.FollowMeJoystick);
            });
            _this.cameraControlsSteppedJoystick = $("#controlsSteppedJoystick").click(function () {
                _this.cameraControls.selectMode(CameraControl.SteppedJoystick);
            });
            _this.disableControlsButton();
            var settingsButton = $("#settingsButton");
            settingsButton.click(function () {
                Settings.Current.show();
            });
            Dashboard.getInstance().show();
        };
        this.getToggleStatus = function (toggle) { return (toggle != null && toggle.prop("checked")); };
        this.getIsConnected = function () { return _this.getToggleStatus(_this.connectButton); };
        this.getIsCameraActive = function () { return _this.getToggleStatus(_this.cameraButton); };
        this.getIsControlsActive = function () { return true; };
        this.disableControlsButton = function () {
            _this.cameraControls.hide();
            _this.cameraControlsButton.prop("disabled", true);
        };
        this.enableControlsButton = function () {
            _this.cameraControlsButton.prop("disabled", false);
            _this.cameraControls.show();
        };
        this.connect = function () {
            _this.socketio = io.connect(Settings.Current.getBaseServerUrl() + ":80/", { 'forceNew': true });
            _this.socketio.on("connected", function (msg) {
                //updateConnectionStatus(true, msg);
                Dashboard.getInstance().hideIcon(DashboardIcons.Engine);
            });
            _this.socketio.on("disconnected", function (msg) {
                _this.connectButton.bootstrapToggle("off");
                _this.cameraButton.bootstrapToggle("off");
            });
            _this.socketio.on("parking", function (msg) {
                Dashboard.getInstance().parkingControl.update(msg);
            });
            _this.socketio.on("sysinfo", function (msg) {
                Dashboard.getInstance().update(msg);
            });
            _this.socketio.on("error", function (msg) {
                Dashboard.getInstance().showIcon(DashboardIcons.Engine);
            });
            _this.socketio.on("reconnect_error", function (msg) {
                Dashboard.getInstance().showIcon(DashboardIcons.Engine);
            });
            _this.socketio.emit("connect");
        };
        this.disconnect = function () {
            if (_this.socketio !== null) {
                _this.socketio.disconnect();
            }
        };
        this.processToggleControls = function () {
            if (!_this.getIsCameraActive())
                return;
        };
        this.processToggleCamera = function () {
            if (_this.getIsCameraActive()) {
                Dashboard.getInstance().startCamera();
                _this.enableControlsButton();
            }
            else {
                Dashboard.getInstance().stopCamera();
                _this.cameraControls.hide();
                _this.disableControlsButton();
            }
        };
        this.processRobotToggle = function () {
            if (_this.getIsConnected()) {
                Dashboard.getInstance().startEngine(function () {
                    _this.connect();
                    _this.robotControls.show();
                    // optionally switch on camera if not already running
                    if (!_this.getIsCameraActive()) {
                        _this.cameraButton.bootstrapToggle("toggle");
                    }
                    _this.enableControlsButton();
                });
            }
            else {
                Dashboard.getInstance().stopEngine(function () {
                    _this.robotControls.hide();
                    _this.disconnect();
                    if (!_this.getIsCameraActive()) {
                        _this.disableControlsButton();
                    }
                });
            }
        };
    }
    return Application;
})();
var CameraControl;
(function (CameraControl) {
    CameraControl[CameraControl["SteppedJoystick"] = 0] = "SteppedJoystick";
    CameraControl[CameraControl["FollowMeJoystick"] = 1] = "FollowMeJoystick";
})(CameraControl || (CameraControl = {}));
var CameraControls = (function () {
    function CameraControls() {
        var _this = this;
        this.joystickRight = null;
        this.currentTilt = 95;
        this.currentPan = 90;
        this.step = 10;
        this.isBusy = false;
        this.currentCameraControls = CameraControl.SteppedJoystick;
        this.sendCameraCommand = function (command) {
            if (_this.isBusy && command !== "center") {
                console.log("Skipped request...");
                return;
            }
            _this.isBusy = true;
            RequestsHelper.Current.put("servos/" + command, _this.processResult, function () { return _this.isBusy = false; });
        };
        this.processResult = function (data) {
            var pan = data["pan"];
            var tilt = data["tilt"];
            if (pan != null && pan !== -1) {
                _this.currentPan = pan;
            }
            if (tilt != null && tilt !== -1) {
                _this.currentTilt = data["tilt"];
            }
            _this.isBusy = false;
        };
        this.adjustTilt = function (offset) { return (_this.currentTilt + offset); };
        this.adjustPan = function (offset) { return (_this.currentPan + offset); };
    }
    CameraControls.prototype.init = function () {
    };
    CameraControls.prototype.selectMode = function (cameraControl) {
        this.currentCameraControls = cameraControl;
    };
    CameraControls.prototype.show = function () {
        var _this = this;
        var currentDirection = null;
        var currentDistance = 0;
        var currentPanPercent = 0;
        var currentTiltPercent = 0;
        var joystickSize = 120;
        var distanceMax = Math.floor(joystickSize / 2);
        var centerX = 0;
        var centerY = 0;
        var currentInterval;
        var steppedStart = false;
        this.hide();
        this.currentCameraControls = CameraControl.SteppedJoystick;
        if (this.joystickRight != null)
            return;
        this.joystickRight = nipplejs.create({
            maxNumberOfNipples: 1,
            zone: document.getElementById("jRight"),
            size: joystickSize,
            mode: "dynamic",
            position: { left: "50%", top: "50%" },
            color: "blue"
        }).on("start end", function (evt, data) {
            if (_this.currentCameraControls === CameraControl.FollowMeJoystick) {
                if (evt.type === "start") {
                    centerX = data["position"]["x"];
                    centerY = data["position"]["y"];
                    console.log("centerX:" + centerX + "  centerY:" + centerY);
                }
                else {
                    centerX = 0;
                    centerY = 0;
                    _this.sendCameraCommand("center");
                }
                currentDirection = null;
                currentDistance = 0;
            }
            else if (_this.currentCameraControls === CameraControl.SteppedJoystick) {
                clearInterval(currentInterval);
                if (evt.type === "start") {
                    steppedStart = true;
                }
                else {
                    _this.sendCameraCommand("move/stop");
                    if (steppedStart) {
                        steppedStart = false;
                        _this.sendCameraCommand("center");
                    }
                }
            }
        }).on("move", function (evt, data) {
            if (_this.currentCameraControls === CameraControl.FollowMeJoystick) {
                if (data === null || data["direction"] === null || data["position"] === null)
                    return;
                var panPercent = -Math.floor(((data["position"]["x"] - centerX) / distanceMax) * 100);
                var tiltPercent = Math.floor(((data["position"]["y"] - centerY) / distanceMax) * 100);
                if (panPercent > 100 || panPercent < -100 || tiltPercent > 100 || tiltPercent < -100) {
                    return;
                }
                if (panPercent % 2 === 0 || tiltPercent % 2 === 0) {
                    if (currentPanPercent !== panPercent || currentTiltPercent !== tiltPercent) {
                        currentPanPercent = panPercent;
                        currentTiltPercent = tiltPercent;
                        _this.sendCameraCommand("percent/" + panPercent + "/" + tiltPercent);
                    }
                }
            }
        }).on("dir", function (evt, data) {
            if (_this.currentCameraControls === CameraControl.SteppedJoystick) {
                steppedStart = false;
                var direction = data["direction"]["angle"];
                console.log(direction);
                if (currentDirection === direction) {
                    return;
                }
                currentDirection = direction;
                _this.sendCameraCommand("move/" + currentDirection);
            }
        });
    };
    CameraControls.prototype.hide = function () {
        if (this.joystickRight != null) {
            this.joystickRight.destroy();
            this.joystickRight = null;
        }
        this.currentCameraControls = CameraControl.SteppedJoystick;
    };
    return CameraControls;
})();
//http://jsfiddle.net/mentosan/o3nxs401/146/
var Dashboard = (function () {
    function Dashboard() {
        var _this = this;
        this.parkingControl = new Parking();
        this.canvas = new fabric.StaticCanvas("dashboard");
        this.zoomFactor = 1;
        this.originalWidth = 1408;
        this.originalHeight = 513;
        this.isCameraVisible = false;
        this.cruiseControlSpeed = 0;
        this.isMoving = false;
        this.cameraUrl = null;
        this.show = function () {
            _this.canvas.setBackgroundColor("black", function () { });
            _this.canvas.setHeight(_this.originalHeight);
            _this.canvas.setWidth(_this.originalWidth);
            _this.clockController = new DashboardClockController(_this.canvas);
            _this.iconsController = new DashboardIconsController(_this.canvas);
            _this.drawMiddleDisplay();
            _this.drawCameraAndGauges();
            setInterval(function () {
                //leftGauge.setValueAnimated(Math.random() * 100); 
                //rightGauge.setValueAnimated(Math.random() * 100); 
                //leftGauge.setOdoValue(Math.random() * 30000.2)
                _this.clockController.updateTime();
                if (_this.cameraInterval == null) {
                    _this.canvas.renderAll();
                }
            }, 1000);
            window.onresize = _this.resizeCanvas;
            _this.tempInterval = setInterval(function () {
                clearInterval(_this.tempInterval);
                _this.resizeCanvas();
            }, 500);
        };
        this.startEngine = function (callback) {
            _this.iconsController.showAllIcons();
            _this.leftGauge.setValue(100);
            _this.rightGauge.setValue(90);
            _this.miniGaugeLeft.setValue(100);
            _this.miniGaugeRight.setValue(100);
            setTimeout(function () {
                _this.iconsController.hideAllIcons();
                _this.leftGauge.setValue(0);
                _this.rightGauge.setValue(0);
                _this.miniGaugeLeft.setValue(0);
                _this.miniGaugeRight.setValue(0);
                _this.parkingControl.turnOn();
                _this.showIcon(DashboardIcons.ParkingSensors);
                _this.showIcon(DashboardIcons.Headlights);
                _this.showIcon(DashboardIcons.ParkingBrake);
                _this.showIcon(DashboardIcons.SeatBelt);
                if (callback != null) {
                    callback();
                }
            }, 1500);
        };
        this.stopEngine = function (callback) {
            _this.iconsController.hideAllIcons();
            _this.parkingControl.turnOff();
            _this.miniGaugeLeft.setValue(0);
            _this.miniGaugeRight.setValue(0);
            _this.rightGauge.setValueAnimated(0);
            if (callback != null) {
                callback();
            }
        };
        this.setCruiseControlSpeed = function (speed) {
            if (_this.leftGauge != null) {
                var needMove = false;
                if (_this.cruiseControlSpeed !== speed && _this.isMoving) {
                    needMove = true;
                }
                _this.cruiseControlSpeed = speed;
                _this.leftGauge.setThreshold(_this.cruiseControlSpeed);
                if (needMove) {
                    _this.move();
                }
            }
            if (_this.cruiseControlSpeed === 0) {
                _this.hideIcon(DashboardIcons.Tempomat);
            }
            else {
                _this.showIcon(DashboardIcons.Tempomat);
            }
        };
        this.move = function () {
            if (_this.leftGauge != null && _this.cruiseControlSpeed != null && !_this.isMoving) {
                _this.hideIcon(DashboardIcons.ParkingBrake);
                _this.isMoving = true;
                _this.leftGauge.setValueAnimated(_this.cruiseControlSpeed);
            }
        };
        this.stop = function () {
            if (_this.leftGauge != null) {
                _this.isMoving = false;
                _this.leftGauge.setValueAnimated(0);
                _this.showIcon(DashboardIcons.ParkingBrake);
                _this.hideIcon(DashboardIcons.TurnSignals);
            }
        };
        this.showIcon = function (icon) {
            _this.iconsController.showIcon(icon);
        };
        this.hideIcon = function (icon) {
            _this.iconsController.hideIcon(icon);
        };
        this.startCamera = function () {
            //this.cameraUrl = "http://img.izismile.com/img/img5/20120809/video/definitely_not_what_youd_expect_to_see_from_a_russian_dashcam_400x300_01.jpg";
            _this.cameraUrl = Settings.Current.getBaseServerUrl() + ":8080/stream/video.mjpeg";
            var img = document.getElementById("camera");
            img.onload = function () {
                _this.clockController.hideClock();
                _this.cameraImage.setElement(img);
                _this.cameraImage.width = 500;
                _this.cameraImage.height = 375;
            };
            img.onerror = function () {
                _this.clockController.showClock();
            };
            img.src = _this.cameraUrl;
            _this.cameraInterval = setInterval(function () {
                _this.canvas.renderAll();
            }, 250);
        };
        this.stopCamera = function () {
            if (_this.cameraInterval != null) {
                clearInterval(_this.cameraInterval);
                _this.cameraInterval = null;
            }
            _this.cameraUrl = "http://";
            var img = document.getElementById("camera");
            img.onerror = function () {
                _this.clockController.showClock();
            };
            img.src = _this.cameraUrl;
        };
        this.update = function (msg) {
            if (_this.canvas != null) {
                var memPercent = msg["mp"];
                var cpuPercent = msg["cp"];
                var cpuTemp = msg["ct"];
                _this.rightGauge.setValueAnimated(cpuTemp);
                _this.miniGaugeLeft.setValue(cpuPercent);
                _this.miniGaugeRight.setValue(memPercent);
            }
        };
        this.drawCameraAndGauges = function () {
            fabric.Image.fromURL("http://", function (image) {
                _this.cameraImage = image;
                var ar = image.height / image.width;
                image.left = 455;
                image.top = 60;
                //image.width = 500;
                //image.height = 375; //image.width * ar;
                _this.canvas.add(image);
                _this.drawGauges();
            });
            _this.clockController.showClock();
        };
        this.drawLeftGauge = function () {
            _this.leftGauge = new steelseries.Radial("gLeft", {
                gaugeType: steelseries.GaugeType.TYPE3,
                minValue: 0,
                maxValue: 100,
                size: 510,
                ledVisible: false,
                foregroundType: steelseries.ForegroundType.TYPE3,
                //frameDesign: steelseries.FrameDesign.STEEL,
                frameDesign: steelseries.FrameDesign.TILTED_BLACK,
                knobStyle: steelseries.KnobStyle.SILVER,
                pointerType: steelseries.PointerType.TYPE9,
                lcdDecimals: 0,
                threshold: 0,
                tickLabelOrientation: steelseries.TickLabelOrientation.HORIZONTAL,
                section: null,
                area: null,
                titleString: "Speed",
                unitString: "%",
                lcdVisible: true,
                useOdometer: true,
                odometerParams: { digits: 5 },
                backgroundColor: steelseries.BackgroundColor.CARBON
            });
            var leftGaugeImage = new fabric.Image(document.getElementById("gLeft"), {
                left: 0,
                top: 0,
                width: 510,
                height: 510
            });
            _this.canvas.add(leftGaugeImage);
            _this.miniGaugeLeft = new steelseries.Linear("gMiniLeft", {
                gaugeType: steelseries.GaugeType.TYPE1,
                backgroundVisible: false,
                frameVisible: false,
                minValue: 0,
                maxValue: 100,
                ledVisible: false,
                thresholdVisible: false,
                lcdVisible: false,
                niceScale: false,
                foregroundVisible: false,
            });
            var miniGaugeLeftImage = new fabric.Image(document.getElementById("gMiniLeft"), {
                //left: 85,
                //top: 340,
                //width: 350,
                //height: 80
                left: 405,
                top: 400,
                width: 340,
                height: 80
            });
            _this.canvas.add(miniGaugeLeftImage);
            _this.miniGaugeRight = new steelseries.Linear("gMiniRight", {
                gaugeType: steelseries.GaugeType.TYPE1,
                backgroundVisible: false,
                frameVisible: false,
                minValue: 0,
                maxValue: 100,
                ledVisible: false,
                lcdVisible: false,
                niceScale: true,
                thresholdVisible: false,
                foregroundVisible: false,
            });
            var miniGaugeRightImage = new fabric.Image(document.getElementById("gMiniRight"), {
                //left: 85,
                //top: 360,
                //width: 350,
                //height: 80,
                left: 660,
                top: 400,
                width: 340,
                height: 80
            });
            _this.canvas.add(miniGaugeRightImage);
        };
        this.drawRightGauge = function () {
            _this.rightGauge = new steelseries.RadialBargraph("gRight", {
                gaugeType: steelseries.GaugeType.TYPE2,
                minValue: 10,
                maxValue: 90,
                size: 510,
                tickLabelOrientation: steelseries.TickLabelOrientation.HORIZONTAL,
                foregroundType: steelseries.ForegroundType.TYPE3,
                frameDesign: steelseries.FrameDesign.TILTED_BLACK,
                ledVisible: false,
                niceScale: false,
                fractionalScaleDecimals: false,
                useValueGradient: true,
                section: null,
                area: null,
                lcdVisible: false,
                backgroundColor: steelseries.BackgroundColor.CARBON
            });
            var rightGaugeImage = new fabric.Image(document.getElementById("gRight"), {
                left: 898,
                top: 0,
                width: 510,
                height: 510
            });
            _this.canvas.add(rightGaugeImage);
        };
        this.drawGauges = function () {
            _this.drawLeftGauge();
            _this.drawRightGauge();
            _this.parkingControl.init(_this.canvas);
        };
        this.drawMiddleDisplay = function () {
            _this.canvas.add(new fabric.Line([400, 59, 1000, 59], {
                stroke: "gray",
                strokeWidth: 2
            }));
            _this.canvas.add(new fabric.Line([400, 436, 1000, 436], {
                stroke: "gray",
                strokeWidth: 2
            }));
            var degreesText = new fabric.Text("22.5 °C", {
                fontSize: 28,
                textAlign: "center",
                left: 890,
                top: 25,
                fontFamily: "Arial",
                fill: "white"
            });
            _this.canvas.add(degreesText);
        };
        this.zoomIt = function (factor) {
            _this.canvas.setHeight(_this.canvas.getHeight() * factor);
            _this.canvas.setWidth(_this.canvas.getWidth() * factor);
            if (_this.canvas.backgroundImage) {
                // Need to scale background images as well
                var bi = _this.canvas.backgroundImage;
                bi.width = bi.width * factor;
                bi.height = bi.height * factor;
            }
            var objects = _this.canvas.getObjects();
            for (var i in objects) {
                var scaleX = objects[i].scaleX;
                var scaleY = objects[i].scaleY;
                var left = objects[i].left;
                var top_1 = objects[i].top;
                var tempScaleX = scaleX * factor;
                var tempScaleY = scaleY * factor;
                var tempLeft = left * factor;
                var tempTop = top_1 * factor;
                objects[i].scaleX = tempScaleX;
                objects[i].scaleY = tempScaleY;
                objects[i].left = tempLeft;
                objects[i].top = tempTop;
                objects[i].setCoords();
            }
            _this.canvas.renderAll();
            _this.canvas.calcOffset();
        };
        this.resizeCanvas = function () {
            //return;
            var clientWidth = window.innerWidth;
            //var clientHeight = window.innerHeight;
            _this.zoomFactor = clientWidth / _this.canvas.getWidth();
            //debugger;
            _this.zoomIt(_this.zoomFactor);
        };
        if (Dashboard.instance) {
            throw new Error("Error - use Dashboard.getInstance()");
        }
    }
    Dashboard.getInstance = function () {
        Dashboard.instance = Dashboard.instance || new Dashboard();
        return Dashboard.instance;
    };
    return Dashboard;
})();
var DashboardClockController = (function () {
    function DashboardClockController(canvas) {
        var _this = this;
        this.hideClock = function () {
            _this.canvas.remove(_this.clockGaugeImage);
        };
        this.showClock = function () {
            _this.hideClock();
            new steelseries.Clock("gClock", {
                gaugeType: steelseries.GaugeType.TYPE4,
                size: 170,
                secondPointerVisible: true,
                backgroundVisible: true,
                backgroundColor: steelseries.BackgroundColor.BRUSHED_STAINLESS,
                frameVisible: false,
                frameDesign: steelseries.FrameDesign.TILTED_BLACK,
                minValue: 20,
                maxValue: 80,
                value: 45,
                niceScale: true,
                pointerType: steelseries.PointerType.TYPE5,
            });
            var factor = Dashboard.getInstance().zoomFactor;
            _this.clockGaugeImage = new fabric.Image(document.getElementById("gClock"), {
                left: 579 * factor,
                top: 120 * factor,
                width: 250 * factor,
                height: 250 * factor
            });
            _this.canvas.add(_this.clockGaugeImage);
            _this.canvas.renderAll();
        };
        this.updateTime = function () {
            var today = new Date();
            var h = _this.checkTime(today.getHours());
            var m = _this.checkTime(today.getMinutes());
            _this.clockText.setText(h + ":" + m);
        };
        this.checkTime = function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            ; // add zero in front of numbers < 10
            return i;
        };
        this.canvas = canvas;
        this.clockText = new fabric.Text("21:45", {
            fontSize: 28,
            textAlign: "center",
            left: 420,
            top: 25,
            fontFamily: "Arial",
            fill: "white"
        });
        this.canvas.add(this.clockText);
        this.updateTime();
    }
    return DashboardClockController;
})();
var DashboardIcons;
(function (DashboardIcons) {
    DashboardIcons[DashboardIcons["SeatBelt"] = 0] = "SeatBelt";
    DashboardIcons[DashboardIcons["Tempomat"] = 1] = "Tempomat";
    DashboardIcons[DashboardIcons["FrontAssist"] = 2] = "FrontAssist";
    DashboardIcons[DashboardIcons["Engine"] = 3] = "Engine";
    DashboardIcons[DashboardIcons["Headlights"] = 4] = "Headlights";
    DashboardIcons[DashboardIcons["LaneAssist"] = 5] = "LaneAssist";
    DashboardIcons[DashboardIcons["ParkingBrake"] = 6] = "ParkingBrake";
    DashboardIcons[DashboardIcons["ParkingSensors"] = 7] = "ParkingSensors";
    DashboardIcons[DashboardIcons["WaterTemperature"] = 8] = "WaterTemperature";
    DashboardIcons[DashboardIcons["TurnSignals"] = 9] = "TurnSignals";
})(DashboardIcons || (DashboardIcons = {}));
var DashboardIconsController = (function () {
    function DashboardIconsController(canvas) {
        // a dictionary holding all icons
        this.icons = {};
        this.canvas = canvas;
    }
    // show the specified icon
    DashboardIconsController.prototype.showIcon = function (target) {
        var _this = this;
        var icon = this.icons[target];
        if (icon != undefined && icon.isVisible) {
            return;
        }
        else {
            // mark it visible ASAP
            this.icons[target] = { id: target, isVisible: true };
        }
        var path = null;
        var left = -1;
        var top = -1;
        switch (target) {
            case DashboardIcons.Engine:
                path = "/images/Engine.svg";
                left = 675;
                top = 445;
                break;
            case DashboardIcons.FrontAssist:
                path = "/images/Frontassist.svg";
                left = 1230;
                top = 300;
                break;
            case DashboardIcons.Headlights:
                path = "/images/Headlights.svg";
                left = 615;
                top = 10;
                break;
            case DashboardIcons.LaneAssist:
                path = "/images/Laneassist.svg";
                left = 525;
                top = 445;
                break;
            case DashboardIcons.ParkingBrake:
                path = "/images/Parkingbrake.svg";
                left = 840;
                top = 445;
                break;
            case DashboardIcons.ParkingSensors:
                path = "/images/Parkingsensors.svg";
                left = 1030;
                top = 300;
                break;
            case DashboardIcons.SeatBelt:
                path = "/images/Seatbelt.svg";
                left = 900;
                top = 445;
                break;
            case DashboardIcons.Tempomat:
                path = "/images/Tempomat.svg";
                left = 465;
                top = 445;
                break;
            case DashboardIcons.TurnSignals:
                path = "/images/Turnsignal.svg";
                left = 675;
                top = 10;
                break;
            case DashboardIcons.WaterTemperature:
                path = "/images/Temperature.svg";
                left = 960;
                top = 280;
                break;
        }
        if (path !== null && left !== -1 && top !== -1) {
            fabric.loadSVGFromURL(path, function (objects) {
                var factor = Dashboard.getInstance().zoomFactor;
                var result = new fabric.PathGroup(objects, {
                    left: left * factor,
                    top: top * factor
                });
                result.scaleX = 0.7 * factor;
                result.scaleY = 0.7 * factor;
                _this.canvas.add(result);
                _this.icons[target] = { id: target, iconPath: result, isVisible: true };
            });
        }
    };
    // hide the specified icon
    DashboardIconsController.prototype.hideIcon = function (target) {
        var icon = this.icons[target];
        if (icon != undefined && icon.isVisible) {
            icon.isVisible = false;
            this.canvas.remove(icon.iconPath);
            //this.canvas.renderAll();
            icon.iconPath = null;
        }
    };
    // test: display all icons for 3 seconds
    DashboardIconsController.prototype.showAllIcons = function () {
        this.showIcon(DashboardIcons.Engine);
        this.showIcon(DashboardIcons.FrontAssist);
        this.showIcon(DashboardIcons.Headlights);
        this.showIcon(DashboardIcons.LaneAssist);
        this.showIcon(DashboardIcons.ParkingBrake);
        this.showIcon(DashboardIcons.ParkingSensors);
        this.showIcon(DashboardIcons.SeatBelt);
        this.showIcon(DashboardIcons.Tempomat);
        this.showIcon(DashboardIcons.TurnSignals);
        this.showIcon(DashboardIcons.WaterTemperature);
    };
    DashboardIconsController.prototype.hideAllIcons = function () {
        this.hideIcon(DashboardIcons.Engine);
        this.hideIcon(DashboardIcons.FrontAssist);
        this.hideIcon(DashboardIcons.Headlights);
        this.hideIcon(DashboardIcons.LaneAssist);
        this.hideIcon(DashboardIcons.ParkingBrake);
        this.hideIcon(DashboardIcons.ParkingSensors);
        this.hideIcon(DashboardIcons.SeatBelt);
        this.hideIcon(DashboardIcons.Tempomat);
        this.hideIcon(DashboardIcons.TurnSignals);
        this.hideIcon(DashboardIcons.WaterTemperature);
    };
    return DashboardIconsController;
})();
//http://jsfiddle.net/xk6ny85d/15/
var Parking = (function () {
    function Parking() {
        var _this = this;
        this.colorOff = "lightGray";
        this.color1 = "yellow";
        this.color2 = "orange";
        this.color3 = "orangered";
        this.color4 = "red";
        this.colorLeftLine = "red";
        this.colorRightLine = "green";
        this.isOff = true;
        this.circle1 = null;
        this.circle2 = null;
        this.circle3 = null;
        this.circle4 = null;
        this.left = null;
        this.right = null;
        this.lineLeft = null;
        this.lineRight = null;
        //private distText: fabric.IText = null;
        this.update = function (msg) {
            if (_this.canvas != null) {
                _this.circle1.stroke = _this.colorOff;
                _this.circle2.stroke = _this.colorOff;
                _this.circle3.stroke = _this.colorOff;
                _this.circle4.stroke = _this.colorOff;
                _this.left.stroke = _this.colorOff;
                _this.right.stroke = _this.colorOff;
                _this.lineLeft.fill = _this.colorOff;
                _this.lineRight.fill = _this.colorOff;
                var dist = msg["d"];
                if (!_this.isOff) {
                    _this.miniDisplay.setValue(dist);
                }
                if (dist < 50 && dist >= 30) {
                    _this.circle1.stroke = _this.color1;
                }
                if (dist < 30 && dist >= 20) {
                    _this.circle2.stroke = _this.color2;
                }
                if (dist < 20 && dist >= 10) {
                    _this.circle3.stroke = _this.color3;
                }
                if (dist < 10 || msg["c"]) {
                    _this.circle4.stroke = _this.color4;
                }
                if (msg["l"]) {
                    _this.left.stroke = _this.color4;
                }
                if (msg["r"]) {
                    _this.right.stroke = _this.color4;
                }
                if (msg["ll"]) {
                    _this.lineLeft.fill = _this.colorLeftLine;
                }
                if (msg["rl"]) {
                    _this.lineRight.fill = _this.colorRightLine;
                }
                // sample: {'d': dist, 'l': l, 'c': c,'r': r, 'll': ll, 'rl': rl}
                _this.canvas.renderAll();
            }
        };
        this.turnOff = function () {
            _this.isOff = true;
            _this.update({ "d": 10000 });
            _this.drawMiniDisplay();
        };
        this.turnOn = function () {
            _this.isOff = false;
            _this.drawMiniDisplay();
        };
        this.init = function (canvas) {
            var startAngle = -2.618; // 30deg
            var endAngle = -0.5235;
            startAngle = -2.35619; // 45deg
            endAngle = -0.785398;
            _this.canvas = canvas; //new fabric.Canvas("parkingControl");
            _this.canvas.allowTouchScrolling = false;
            _this.canvas.setZoom(1);
            _this.circle1 = new fabric.Circle({
                radius: 100,
                left: -10,
                top: 20,
                angle: 0,
                startAngle: startAngle,
                endAngle: endAngle,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            _this.circle2 = new fabric.Circle({
                radius: 80,
                left: 10,
                top: 40,
                angle: 0,
                startAngle: startAngle,
                endAngle: endAngle,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            _this.circle3 = new fabric.Circle({
                radius: 60,
                left: 30,
                top: 60,
                angle: 0,
                startAngle: startAngle,
                endAngle: endAngle,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            _this.circle4 = new fabric.Circle({
                radius: 40,
                left: 50,
                top: 80,
                angle: 0,
                startAngle: startAngle,
                endAngle: endAngle,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            _this.left = new fabric.Circle({
                radius: 40,
                left: 50,
                top: 80,
                angle: 0,
                startAngle: startAngle - 0.8,
                endAngle: endAngle - 1.65,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            _this.right = new fabric.Circle({
                radius: 40,
                left: 50,
                top: 80,
                angle: 0,
                startAngle: startAngle + 1.65,
                endAngle: endAngle + 0.8,
                stroke: _this.colorOff,
                strokeWidth: 17,
                fill: "",
                selectable: false
            });
            var body = new fabric.Rect({
                top: 115,
                left: 73,
                width: 50,
                height: 100,
                fill: "gray",
                selectable: false
            });
            var wleft = new fabric.Rect({
                top: 180,
                left: 45,
                width: 25,
                height: 50,
                fill: "dimgray",
                selectable: false
            });
            var wright = new fabric.Rect({
                top: 180,
                left: 126,
                width: 25,
                height: 50,
                fill: "dimgray",
                selectable: false
            });
            _this.lineLeft = new fabric.Rect({
                top: 130,
                left: 80,
                width: 10,
                height: 20,
                fill: _this.colorOff,
                selectable: false
            });
            _this.lineRight = new fabric.Rect({
                top: 130,
                left: 106,
                width: 10,
                height: 20,
                fill: _this.colorOff,
                selectable: false
            });
            /*
            this.distText = new fabric.Text("", {
                selectable: false,
                originX: "center",
                left: 98,
                top: 180,
                fontFamily: "Arial",
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                fill: "white"
            });
            */
            var parkingControl = new fabric.Group([
                _this.circle1, _this.circle2, _this.circle3, _this.circle4, _this.left, _this.right,
                body, wleft, wright, _this.lineLeft, _this.lineRight /*, this.distText*/
            ], {
                left: 1078,
                top: 140,
                width: 150,
                //height: 225,
                scaleX: 1,
                scaleY: 1,
                lockScalingX: true,
                lockScalingY: true,
                lockScalingFlip: true,
                hasBorders: false,
                hasControls: false
            });
            _this.canvas.add(parkingControl);
            _this.drawMiniDisplay();
        };
        this.drawMiniDisplay = function () {
            if (_this.miniDisplayImage != null) {
                _this.canvas.remove(_this.miniDisplayImage);
            }
            if (_this.isOff) {
                _this.miniDisplay = new steelseries.DisplaySingle("gMini", {
                    width: 160,
                    height: 60,
                    valuesNumeric: false,
                    value: "off ",
                    lcdDecimals: 0
                });
            }
            else {
                _this.miniDisplay = new steelseries.DisplaySingle("gMini", {
                    width: 160,
                    height: 60,
                    unitString: "cm",
                    lcdDecimals: 0,
                    unitStringVisible: true
                });
            }
            var factor = Dashboard.getInstance().zoomFactor;
            _this.miniDisplayImage = new fabric.Image(document.getElementById("gMini"), {
                left: 1073 * factor,
                top: 360 * factor,
                width: 160 * factor,
                height: 60 * factor
            });
            _this.canvas.add(_this.miniDisplayImage);
        };
    }
    return Parking;
})();
;
/// Singleton helper for sending requests
var RequestsHelper = (function () {
    function RequestsHelper() {
    }
    RequestsHelper.prototype.put = function (command, callbackSuccess, callbackError) {
        if (callbackSuccess === void 0) { callbackSuccess = null; }
        if (callbackError === void 0) { callbackError = null; }
        $.ajax({
            url: Settings.Current.getBaseAPIUrl() + command,
            type: "PUT",
            success: function (result) {
                console.log(command);
                if (callbackSuccess != null) {
                    callbackSuccess(result);
                }
            },
            error: function (result) {
                console.log(result + command);
                if (callbackError != null) {
                    callbackError(result);
                }
            }
        });
    };
    RequestsHelper.Current = new RequestsHelper();
    return RequestsHelper;
})();
var RobotControls = (function () {
    function RobotControls() {
        var _this = this;
        this.joystickLeft = null;
        this.accButton = null;
        this.brakeButton = null;
        this.currentSpeed = 40;
        this.showDirectionJoystick = function () {
            if (_this.joystickLeft != null)
                return;
            //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
            var evts = "plain:up";
            var currentDirectionAngle = 0;
            Dashboard.getInstance().setCruiseControlSpeed(_this.currentSpeed);
            _this.joystickLeft = nipplejs.create({
                maxNumberOfNipples: 1,
                zone: document.getElementById("jLeft"),
                mode: "dynamic",
                size: 120,
                position: { left: "50%", top: "50%" },
                color: "green"
            }).on("start end", function (evt, data) {
                if (evt.type === "end") {
                    RequestsHelper.Current.put("motor/stop");
                    Dashboard.getInstance().stop();
                }
            }).on("move", function (evt, data) {
                // ignore movement smaller than 10
                var dist = data["distance"];
                if (dist > 10) {
                    var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                    if (angle !== currentDirectionAngle) {
                        RequestsHelper.Current.put("motor/move/" + angle);
                        currentDirectionAngle = angle;
                        Dashboard.getInstance().move();
                        if ((angle > 100 && angle < 260) || angle < 80 || angle > 280) {
                            Dashboard.getInstance().showIcon(DashboardIcons.TurnSignals);
                        }
                        else {
                            Dashboard.getInstance().hideIcon(DashboardIcons.TurnSignals);
                        }
                    }
                }
            }).on(evts, function (evt, data) {
                console.log(evt.type);
            });
        };
    }
    RobotControls.prototype.init = function () {
        var _this = this;
        this.accButton = $("#accButton");
        this.accButton.click(function () {
            _this.modifySpeed(+10);
        });
        this.brakeButton = $("#brakeButton");
        this.brakeButton.click(function () {
            _this.modifySpeed(-10);
        });
    };
    RobotControls.prototype.show = function () {
        this.showDirectionJoystick();
        this.accButton.show();
        this.brakeButton.show();
    };
    RobotControls.prototype.hide = function () {
        if (this.joystickLeft != null) {
            this.joystickLeft.destroy();
            this.joystickLeft = null;
        }
        if (this.accButton != null) {
            this.accButton.hide();
        }
        if (this.brakeButton != null) {
            this.brakeButton.hide();
        }
    };
    RobotControls.prototype.modifySpeed = function (speed) {
        var _this = this;
        RequestsHelper.Current.put("motor/speed/" + (this.currentSpeed + speed), function (data) {
            _this.currentSpeed = data["speed"];
            Dashboard.getInstance().setCruiseControlSpeed(_this.currentSpeed);
        });
    };
    return RobotControls;
})();
var Settings = (function () {
    function Settings() {
        var _this = this;
        this.robotIpCookieName = "RobotIP";
        this.robotIP = null;
        this.show = function () {
            BootstrapDialog.show({
                title: "Settings",
                message: $("<div></div>").load("settings.html"),
                closable: true,
                closeByBackdrop: true,
                closeByKeyboard: true,
                data: {},
                onshow: function (dialogRef) {
                },
                onshown: function (dialogRef) {
                    //update ui
                    $("#robotIP").val(_this.getRobotIp());
                    $("#shutdownButton").click(_this.executeShutdown);
                    $("#rebootButton").click(_this.executeReboot);
                    $("#stopButton").click(_this.executeStop);
                },
                buttons: [
                    {
                        label: "Close",
                        action: function (dialogItself) {
                            dialogItself.close();
                        }
                    }
                ],
                onhide: function (dialogRef) {
                    _this.robotIP = $("#robotIP").val();
                    _this.storeRobotIp();
                }
            });
        };
        this.getBaseServerUrl = function () {
            return "http://" + _this.getRobotIp();
        };
        this.getBaseAPIUrl = function () {
            return "http://" + _this.getRobotIp() + ":80/ropi/api/v1.0/";
        };
    }
    Settings.prototype.getRobotIp = function () {
        //this.robotIP = "raspberrypi";
        if (!this.checkRobotIp(this.robotIP)) {
            this.robotIP = Cookies.get(this.robotIpCookieName);
            if (!this.checkRobotIp(this.robotIP)) {
                this.robotIP = window.location.hostname;
                if (!this.checkRobotIp(this.robotIP)) {
                    this.robotIP = "raspberrypi";
                }
            }
        }
        return this.robotIP;
    };
    Settings.prototype.storeRobotIp = function () {
        Cookies.set(this.robotIpCookieName, this.robotIP);
    };
    Settings.prototype.checkRobotIp = function (ip) {
        return ip != null && ip !== "" && ip !== "undefined";
    };
    Settings.prototype.executeShutdown = function () {
        BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to shutdown the Robot.\r\n You won't be able to reach it anymore (power on required)",
            type: BootstrapDialog.TYPE_DANGER,
            btnOKLabel: "Yes, shutdown!",
            btnOKClass: "btn-danger",
            callback: function (result) {
                if (result) {
                    RequestsHelper.Current.put("system/shutdown");
                }
            }
        });
    };
    Settings.prototype.executeReboot = function () {
        BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to reboot the Robot.\r\n Please wait few minutes then reconnect to the Robot.",
            type: BootstrapDialog.TYPE_WARNING,
            btnOKLabel: "Yes, reboot!",
            btnOKClass: "btn-warning",
            callback: function (result) {
                if (result) {
                    RequestsHelper.Current.put("system/reboot");
                }
            }
        });
    };
    Settings.prototype.executeStop = function () {
        BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to stop the server running on the Robot.\r\n You won't be able to reach it anymore (hard reset required)",
            type: BootstrapDialog.TYPE_DANGER,
            btnOKLabel: "Yes, stop it!",
            btnOKClass: "btn-danger",
            callback: function (result) {
                if (result) {
                    RequestsHelper.Current.put("quit");
                }
            }
        });
    };
    Settings.Current = new Settings();
    return Settings;
})();
//# sourceMappingURL=application.js.map