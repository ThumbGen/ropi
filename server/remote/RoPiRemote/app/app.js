var socketio = null;
var robotIpEntry = null;
var cameraButton = null;
var connectButton = null;
var controlsButton = null;
var robotIpCookieName = "RobotIP";
$(document).ready(function () {
    var getToggleStatus = function (toggle) { return (toggle != null && toggle.prop("checked")); };
    var getIsConnected = function () { return getToggleStatus(connectButton); };
    var getIsCameraActive = function () { return getToggleStatus(cameraButton); };
    var getIsControlsActive = function () { return getToggleStatus(controlsButton); };
    var disableControlsButton = function () {
        controlsButton.bootstrapToggle("off");
        controlsButton.bootstrapToggle("disable");
    };
    var enableControlsButton = function () {
        controlsButton.bootstrapToggle("enable");
        if (!getIsControlsActive()) {
            controlsButton.bootstrapToggle("on");
        }
    };
    var connect = function () {
        socketio = io.connect(settings.getBaseServerUrl() + ":80/", { 'forceNew': true });
        socketio.on("connected", function (msg) {
            //updateConnectionStatus(true, msg);
        });
        socketio.on("disconnected", function (msg) {
            connectButton.bootstrapToggle("off");
            cameraButton.bootstrapToggle("off");
        });
        socketio.on("parking", function (msg) {
            parking.update(msg);
        });
        socketio.emit("connect");
    };
    var disconnect = function () {
        if (socketio !== null) {
            socketio.disconnect();
        }
    };
    var processToggleControls = function () {
        if (!getIsCameraActive())
            return;
        if (getIsControlsActive()) {
            controls.showCameraControls();
        }
        else {
            controls.hideCameraControls();
        }
    };
    var processToggleCamera = function () {
        var camera = $("#camera");
        if (getIsCameraActive()) {
            camera.attr("src", settings.getBaseServerUrl() + ":8080/stream/video.mjpeg");
            camera.show();
            enableControlsButton();
        }
        else {
            camera.attr("src", "");
            camera.hide();
            controls.hideCameraControls();
            disableControlsButton();
        }
    };
    var processRobotToggle = function () {
        if (getIsConnected()) {
            connect();
            controls.showRobotControls();
            // optionally switch on camera if not already running
            if (!getIsCameraActive()) {
                cameraButton.bootstrapToggle("toggle");
            }
            enableControlsButton();
        }
        else {
            controls.hideRobotControls();
            disconnect();
            if (!getIsCameraActive()) {
                disableControlsButton();
            }
        }
    };
    var run = function () {
        controls.init();
        cameraButton = $("#cameraButton");
        cameraButton.bootstrapToggle();
        cameraButton.change(function () {
            processToggleCamera();
        });
        connectButton = $("#connectButton");
        connectButton.bootstrapToggle();
        connectButton.change(function () {
            processRobotToggle();
        });
        controlsButton = $("#controlsButton");
        controlsButton.bootstrapToggle();
        controlsButton.change(function () {
            processToggleControls();
        });
        controlsButton.bootstrapToggle("disable");
        var settingsButton = $("#settingsButton");
        settingsButton.click(function () {
            settings.show();
        });
    };
    // go!
    run();
});
//# sourceMappingURL=app.js.map