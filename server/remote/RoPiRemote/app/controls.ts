
var joystickLeft = null;
var joystickRight = null;
var speedSlider = null;
var panLeftButton = null;
var panRightButton = null;
var tiltUpButton = null;
var tiltDownButton = null;
var centerButton = null;

var currentTilt = 95;
var currentPan = 90;

var sendCameraCommand = command => {
    $.ajax({
        url: settings.getBaseAPIUrl() + "servos/" + command,
        type: "PUT",
        success(result) {
            console.log(result);
            processResult(result);
        }
    });
}

var adjustTilt = offset => (currentTilt + offset);

var adjustPan = offset => (currentPan + offset);

var processResult = data => {
    var pan = data["pan"];
    var tilt = data["tilt"];
    if (pan != null && pan !== -1) {
        currentPan = pan;
    }
    if (tilt != null && tilt !== -1) {
        currentTilt = data["tilt"];
    }
}

var controls = {
    showRobotControls() {
        if (joystickLeft != null) return;

        //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
        var evts = "plain:up";

        var currentDirectionAngle = 0;

        joystickLeft = nipplejs.create({
            zone: document.getElementById("jLeft"),
            mode: "static",
            size: 120,
            position: { left: "50%", top: "50%" },
            color: "green"
        }).on("start end", (evt, data) => {
            if (evt.type === "end") {
                $.ajax({
                    url: settings.getBaseAPIUrl() + "motor/stop",
                    type: "PUT",
                    success(result) {
                        console.log("STOP");
                    }
                });
            }
        }).on("move", (evt, data) => {
            // ignore movement smaller than 20
            var dist = data["distance"];
            if (dist > 10) {
                var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                if (angle !== currentDirectionAngle) {
                    $.ajax({
                        url: settings.getBaseAPIUrl() + "motor/move/" + angle,
                        type: "PUT",
                        success(result) {
                            console.log(angle);
                        }
                    });

                    currentDirectionAngle = angle;
                }
            }
        }).on(evts,
            (evt, data) => {
                console.log(evt.type);
            }
        );
        speedSlider = noUiSlider.create(document.getElementById("speedSlider"), {
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
                decimals: 0,
                //thousand: '.',
                //postfix: ' (US $)'
            }),
            pips: {
                mode: 'positions',
                values: [0, 50, 100],
                density: 10,
                stepped: true
            }
        });

        speedSlider.on("change", value => {
            var speed = Math.floor(value);
            $.ajax({
                url: settings.getBaseAPIUrl() + "motor/speed/" + speed,
                type: "PUT",
                success(result) {
                    console.log(speed + result);
                }
            });
        });

        parking.init();
    },
    hideRobotControls() {
        if (joystickLeft != null) {
            joystickLeft.destroy();
            joystickLeft = null;
        }
        if (speedSlider != null) {
            speedSlider.destroy();
            speedSlider = null;
        }
        parking.hide();
    },
    showCameraControls() {
        if (joystickRight != null) return;

        tiltUpButton.show();
        tiltDownButton.show();
        centerButton.show();
        panLeftButton.show();
        panRightButton.show();

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
    },
    hideCameraControls() {
        if (joystickRight != null) {
            joystickRight.destroy();
            joystickRight = null;
        }
        tiltUpButton.hide();
        tiltDownButton.hide();
        centerButton.hide();
        panLeftButton.hide();
        panRightButton.hide();
    },
    init() {
        tiltUpButton = $("#tiltUpButton");
        tiltUpButton.click(() => {
            sendCameraCommand(`tilt/${adjustTilt(-10)}`);
        });

        tiltDownButton = $("#tiltDownButton");
        tiltDownButton.click(() => {
            sendCameraCommand(`tilt/${adjustTilt(+10)}`);
        });

        centerButton = $("#centerButton");
        centerButton.click(() => {
            sendCameraCommand("center");
        });

        panLeftButton = $("#panLeftButton");
        panLeftButton.click(() => {
            sendCameraCommand(`pan/${adjustPan(+10)}`);
        });
        panRightButton = $("#panRightButton");
        panRightButton.click(() => {
            sendCameraCommand(`pan/${adjustPan(-10)}`);
        });
    }
}