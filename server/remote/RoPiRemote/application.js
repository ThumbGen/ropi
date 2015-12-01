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
        this.controlsButton = null;
        this.robotControls = new RobotControls();
        this.cameraControls = new CameraControls();
        this.parking = new Parking();
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
            _this.controlsButton = $("#controlsButton");
            _this.controlsButton.bootstrapToggle();
            _this.controlsButton.change(function () {
                _this.processToggleControls();
            });
            _this.controlsButton.bootstrapToggle("disable");
            var settingsButton = $("#settingsButton");
            settingsButton.click(function () {
                Settings.Current.show();
            });
        };
        this.getToggleStatus = function (toggle) { return (toggle != null && toggle.prop("checked")); };
        this.getIsConnected = function () { return _this.getToggleStatus(_this.connectButton); };
        this.getIsCameraActive = function () { return _this.getToggleStatus(_this.cameraButton); };
        this.getIsControlsActive = function () { return _this.getToggleStatus(_this.controlsButton); };
        this.disableControlsButton = function () {
            _this.controlsButton.bootstrapToggle("off");
            _this.controlsButton.bootstrapToggle("disable");
        };
        this.enableControlsButton = function () {
            _this.controlsButton.bootstrapToggle("enable");
            if (!_this.getIsControlsActive()) {
                _this.controlsButton.bootstrapToggle("on");
            }
        };
        this.connect = function () {
            _this.socketio = io.connect(Settings.Current.getBaseServerUrl() + ":80/", { 'forceNew': true });
            _this.socketio.on("connected", function (msg) {
                //updateConnectionStatus(true, msg);
            });
            _this.socketio.on("disconnected", function (msg) {
                _this.connectButton.bootstrapToggle("off");
                _this.cameraButton.bootstrapToggle("off");
            });
            _this.socketio.on("parking", function (msg) {
                _this.parking.update(msg);
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
            if (_this.getIsControlsActive()) {
                _this.cameraControls.show();
            }
            else {
                _this.cameraControls.hide();
            }
        };
        this.processToggleCamera = function () {
            var camera = $("#camera");
            if (_this.getIsCameraActive()) {
                camera.attr("src", Settings.Current.getBaseServerUrl() + ":8080/stream/video.mjpeg");
                camera.show();
                _this.enableControlsButton();
            }
            else {
                camera.attr("src", "");
                camera.hide();
                _this.cameraControls.hide();
                _this.disableControlsButton();
            }
        };
        this.processRobotToggle = function () {
            if (_this.getIsConnected()) {
                _this.connect();
                _this.robotControls.show();
                _this.parking.init();
                // optionally switch on camera if not already running
                if (!_this.getIsCameraActive()) {
                    _this.cameraButton.bootstrapToggle("toggle");
                }
                _this.enableControlsButton();
            }
            else {
                _this.robotControls.hide();
                _this.parking.hide();
                _this.disconnect();
                if (!_this.getIsCameraActive()) {
                    _this.disableControlsButton();
                }
            }
        };
    }
    return Application;
})();
var CameraControls = (function () {
    function CameraControls() {
        var _this = this;
        this.joystickRight = null;
        this.panLeftButton = null;
        this.panRightButton = null;
        this.tiltUpButton = null;
        this.tiltDownButton = null;
        this.centerButton = null;
        this.currentTilt = 95;
        this.currentPan = 90;
        this.sendCameraCommand = function (command) {
            RequestsHelper.Current.put("servos/" + command, _this.processResult);
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
        };
        this.adjustTilt = function (offset) { return (_this.currentTilt + offset); };
        this.adjustPan = function (offset) { return (_this.currentPan + offset); };
    }
    CameraControls.prototype.init = function () {
        var _this = this;
        this.tiltUpButton = $("#tiltUpButton");
        this.tiltUpButton.click(function () {
            _this.sendCameraCommand("tilt/" + _this.adjustTilt(-10));
        });
        this.tiltDownButton = $("#tiltDownButton");
        this.tiltDownButton.click(function () {
            _this.sendCameraCommand("tilt/" + _this.adjustTilt(+10));
        });
        this.centerButton = $("#centerButton");
        this.centerButton.click(function () {
            _this.sendCameraCommand("center");
        });
        this.panLeftButton = $("#panLeftButton");
        this.panLeftButton.click(function () {
            _this.sendCameraCommand("pan/" + _this.adjustPan(+10));
        });
        this.panRightButton = $("#panRightButton");
        this.panRightButton.click(function () {
            _this.sendCameraCommand("pan/" + _this.adjustPan(-10));
        });
    };
    CameraControls.prototype.show = function () {
        if (this.joystickRight != null)
            return;
        this.tiltUpButton.show();
        this.tiltDownButton.show();
        this.centerButton.show();
        this.panLeftButton.show();
        this.panRightButton.show();
        var currentPanAngle = 0;
        var currentTiltAngle = 0;
        //joystickRight = nipplejs.create({
        //    zone: document.getElementById("jRight"),
        //    mode: "static",
        //    position: { left: "50%", top: "50%" },
        //    color: "blue"
        //}).on("move", function (evt, data) {
        //    // ignore movement smaller than 20
        //    //var dist = data["distance"];
        //    //if (dist > 10) {
        //    //    var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
        //    //    if (angle !== currentPanAngle) {
        //    //        $.ajax({
        //    //            url: settings.getBaseAPIUrl() + "motor/move/" + angle,
        //    //            type: "PUT",
        //    //            success: function (result) {
        //    //                console.log(angle);
        //    //            }
        //    //        });
        //    //        currentDirectionAngle = angle;
        //    //    }
        //    //}
        //})/*.on('pressure', function (evt, data) {
        //        console.log({ pressure: data });
        //    })*/;
    };
    CameraControls.prototype.hide = function () {
        if (this.joystickRight != null) {
            this.joystickRight.destroy();
            this.joystickRight = null;
        }
        this.tiltUpButton.hide();
        this.tiltDownButton.hide();
        this.centerButton.hide();
        this.panLeftButton.hide();
        this.panRightButton.hide();
    };
    return CameraControls;
})();
//http://jsfiddle.net/xk6ny85d/15/
var Parking = (function () {
    function Parking() {
        var _this = this;
        this.colorOff = "whitesmoke";
        this.color1 = "yellow";
        this.color2 = "orange";
        this.color3 = "orangered";
        this.color4 = "red";
        this.colorLeftLine = "red";
        this.colorRightLine = "green";
        this.canvas = null;
        this.circle1 = null;
        this.circle2 = null;
        this.circle3 = null;
        this.circle4 = null;
        this.left = null;
        this.right = null;
        this.lineLeft = null;
        this.lineRight = null;
        this.distText = null;
        //private parkingControl = null;
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
                if (dist < 999) {
                    _this.distText.setText(dist.toString());
                }
                else {
                    _this.distText.setText("");
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
        this.hide = function () {
            if (_this.canvas != null) {
                _this.canvas.dispose();
            }
        };
        this.init = function () {
            var resizeCanvas = function () {
                if (_this.canvas == null)
                    return;
                _this.canvas.setHeight($("#main")[0].clientHeight);
                _this.canvas.setWidth($("#main")[0].clientWidth);
                _this.canvas.renderAll();
                if (window.innerWidth < 800) {
                    _this.canvas.setZoom(0.5);
                }
                else {
                    _this.canvas.setZoom(1);
                }
            };
            $(window).resize(resizeCanvas);
            //var video1 = new fabric.Image($("#camera"), {
            //    left: 350,
            //    top: 300,
            //    angle: -15,
            //    originX: 'center',
            //    originY: 'center'
            //});
            var startAngle = -2.618; // 30deg
            var endAngle = -0.5235;
            startAngle = -2.35619; // 45deg
            endAngle = -0.785398;
            _this.canvas = new fabric.Canvas("parkingControl");
            _this.canvas.selection = false;
            _this.canvas.allowTouchScrolling = true;
            _this.canvas.setZoom(0.5);
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
            _this.distText = new fabric.Text("", {
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
            var parkingControl = new fabric.Group([
                _this.circle1, _this.circle2, _this.circle3, _this.circle4, _this.left, _this.right,
                body, wleft, wright, _this.lineLeft, _this.lineRight, _this.distText
            ], {
                left: 0,
                top: 0,
                width: 190,
                height: 225,
                scaleX: 1,
                scaleY: 1,
                lockScalingX: true,
                lockScalingY: true,
                lockScalingFlip: true,
                hasBorders: false,
                hasControls: false
            });
            _this.canvas.add(parkingControl);
            if (_this.canvas.requestFullScreen) {
                _this.canvas.requestFullScreen();
            }
            else if (_this.canvas.webkitRequestFullScreen) {
                _this.canvas.webkitRequestFullScreen();
            }
            else if (_this.canvas.mozRequestFullScreen) {
                _this.canvas.mozRequestFullScreen();
            }
            //fabric.util.requestAnimFrame(function render() {
            //    canvas.renderAll();
            //    fabric.util.requestAnimFrame(render);
            //});
            resizeCanvas();
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
        this.speedSlider = null;
        this.showDirectionJoystick = function () {
            if (_this.joystickLeft != null)
                return;
            //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
            var evts = "plain:up";
            var currentDirectionAngle = 0;
            _this.joystickLeft = nipplejs.create({
                zone: document.getElementById("jLeft"),
                mode: "static",
                size: 120,
                position: { left: "50%", top: "50%" },
                color: "green"
            }).on("start end", function (evt, data) {
                if (evt.type === "end") {
                    RequestsHelper.Current.put("motor/stop");
                }
            }).on("move", function (evt, data) {
                // ignore movement smaller than 10
                var dist = data["distance"];
                if (dist > 10) {
                    var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                    if (angle !== currentDirectionAngle) {
                        RequestsHelper.Current.put("motor/move/" + angle);
                        currentDirectionAngle = angle;
                    }
                }
            }).on(evts, function (evt, data) {
                console.log(evt.type);
            });
        };
        this.showSpeedSlider = function () {
            _this.speedSlider = noUiSlider.create(document.getElementById("speedSlider"), {
                start: 30,
                step: 10,
                connect: "lower",
                tooltips: true,
                direction: "rtl",
                orientation: "vertical",
                range: {
                    "min": 0,
                    "max": 100
                },
                format: wNumb({
                    decimals: 0
                }),
                pips: {
                    mode: 'positions',
                    values: [0, 50, 100],
                    density: 10,
                    stepped: true
                }
            });
            _this.speedSlider.on("change", function (value) {
                var speed = Math.floor(value);
                RequestsHelper.Current.put("motor/speed/" + speed);
            });
        };
    }
    RobotControls.prototype.init = function () {
    };
    RobotControls.prototype.show = function () {
        this.showDirectionJoystick();
        this.showSpeedSlider();
    };
    RobotControls.prototype.hide = function () {
        if (this.joystickLeft != null) {
            this.joystickLeft.destroy();
            this.joystickLeft = null;
        }
        if (this.speedSlider != null) {
            this.speedSlider.destroy();
            this.speedSlider = null;
        }
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
        if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
            this.robotIP = Cookies.get(this.robotIpCookieName);
            if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
                this.robotIP = window.location.hostname;
            }
            if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
                this.robotIP = "raspberrypi";
            }
        }
        return this.robotIP;
    };
    Settings.prototype.storeRobotIp = function () {
        Cookies.set(this.robotIpCookieName, this.robotIP);
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