var socketio = null;
var robotIpEntry = null;
var cameraButton = null;
var connectButton = null;
var controlsButton = null;
var robotIpCookieName = "RobotIP";

$(document).ready(() => {

    var getToggleStatus = toggle => (toggle != null && toggle.prop("checked"));

    var getIsConnected = () => getToggleStatus(connectButton);

    var getIsCameraActive = () => getToggleStatus(cameraButton);

    var getIsControlsActive = () => getToggleStatus(controlsButton);

    var disableControlsButton = () => {
        controlsButton.bootstrapToggle("off");
        controlsButton.bootstrapToggle("disable");
    }

    var enableControlsButton = () => {
        controlsButton.bootstrapToggle("enable");
        if (!getIsControlsActive()) {
            controlsButton.bootstrapToggle("on");
        }
    }

    var connect = () => {
        socketio = io.connect(settings.getBaseServerUrl() + ":80/", { 'forceNew': true });
        socketio.on("connected", msg => {
            //updateConnectionStatus(true, msg);
        });
        socketio.on("disconnected", msg => {
            connectButton.bootstrapToggle("off");
            cameraButton.bootstrapToggle("off");
        });
        socketio.on("parking", msg => {
            parking.update(msg);
        });

        socketio.emit("connect");
    };

    var disconnect = () => {
        if (socketio !== null) {
            socketio.disconnect();
        }
    };

    var processToggleControls = () => {
        if (!getIsCameraActive()) return;
        if (getIsControlsActive()) {
            controls.showCameraControls();
        } else {
            controls.hideCameraControls();
        }
    };

    var processToggleCamera = () => {
        var camera = $("#camera");
        if (getIsCameraActive()) {
            camera.attr("src", settings.getBaseServerUrl() + ":8080/stream/video.mjpeg");
            camera.show();
            enableControlsButton();
        } else {
            camera.attr("src", "");
            camera.hide();
            controls.hideCameraControls();
            disableControlsButton();
        }
    };

    var processRobotToggle = () => {
        if (getIsConnected()) {
            connect();
            controls.showRobotControls();
            // optionally switch on camera if not already running
            if (!getIsCameraActive()) {
                cameraButton.bootstrapToggle("toggle");
            }
            enableControlsButton();
        } else {
            controls.hideRobotControls();
            disconnect();
            if (!getIsCameraActive()) {
                disableControlsButton();
            }
        }
    };

    var run = () => {
        controls.init();

        cameraButton = $("#cameraButton");
        cameraButton.bootstrapToggle();
        cameraButton.change(() => {
            processToggleCamera();
        });
        
        connectButton = $("#connectButton");
        connectButton.bootstrapToggle();
        connectButton.change(() => {
            processRobotToggle();
        });

        controlsButton = $("#controlsButton");
        controlsButton.bootstrapToggle();
        controlsButton.change(() => {
            processToggleControls();
        });
        controlsButton.bootstrapToggle("disable");

        var settingsButton = $("#settingsButton");
        settingsButton.click(() => {
            settings.show();
        });
    }

    // go!
    run();
})