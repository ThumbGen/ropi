class CameraControls implements IControls {

    joystickRight: nipplejs.Manager = null;

    panLeftButton = null;
    panRightButton = null;
    tiltUpButton = null;
    tiltDownButton = null;
    centerButton = null;

    currentTilt = 95;
    currentPan = 90;
    step = 10;

    isBusy = false;

    init() {
        this.tiltUpButton = $("#tiltUpButton");
        this.tiltUpButton.click(() => {
            this.sendCameraCommand(`tilt/${this.adjustTilt(-this.step) }`);
        });

        this.tiltDownButton = $("#tiltDownButton");
        this.tiltDownButton.click(() => {
            this.sendCameraCommand(`tilt/${this.adjustTilt(+this.step) }`);
        });

        this.centerButton = $("#centerButton");
        this.centerButton.click(() => {
            this.sendCameraCommand("center");
        });

        this.panLeftButton = $("#panLeftButton");
        this.panLeftButton.click(() => {
            this.sendCameraCommand(`pan/${this.adjustPan(+this.step) }`);
        });
        this.panRightButton = $("#panRightButton");
        this.panRightButton.click(() => {
            this.sendCameraCommand(`pan/${this.adjustPan(-this.step) }`);
        });
    }

    show() {
        if (this.joystickRight != null) return;

        this.tiltUpButton.show();
        this.tiltDownButton.show();
        this.centerButton.show();
        this.panLeftButton.show();
        this.panRightButton.show();

        var currentDirection = null;
        var currentDistance = 0;
        var currentPanPercent = 0;
        var currentTiltPercent = 0;
        var joystickSize = 120;
        var distanceMax = Math.floor(joystickSize / 2);
        var centerX = 0;
        var centerY = 0;

        this.joystickRight = nipplejs.create({
            zone: document.getElementById("jRight"),
            size: joystickSize,
            mode: "static",
            position: { left: "50%", top: "50%" },
            color: "blue"
        }).on("start end", (evt, data) => {
            if (evt.type === "start") {
                centerX = data["position"]["x"];
                centerY = data["position"]["y"];
                console.log(`centerX:${centerX}  centerY:${centerY}`);
            } else {
                centerX = 0;
                centerY = 0;
                this.sendCameraCommand("center");
            }
            currentDirection = null;
            currentDistance = 0;
            
        }).on("move", (evt, data) => {
            
            if (data === null || data["direction"] === null || data["position"] === null) return;
            
            var panPercent = -Math.floor(((data["position"]["x"] - centerX) / distanceMax) * 100);
            var tiltPercent = Math.floor(((data["position"]["y"] - centerY) / distanceMax) * 100);

            if (panPercent > 100 || panPercent < -100 || tiltPercent > 100 || tiltPercent < -100) {
                return;
            }

            if (panPercent % 2 === 0 || tiltPercent % 2 === 0) {

                if (currentPanPercent !== panPercent || currentTiltPercent !== tiltPercent) {
                    currentPanPercent = panPercent;
                    currentTiltPercent = tiltPercent;

                    this.sendCameraCommand(`percent/${panPercent}/${tiltPercent}`);
                    console.log(`percent/${panPercent}/${tiltPercent}`);
                }
            }
        })
        /*.on('pressure', function (evt, data) {
                console.log({ pressure: data });*/;
    }

    hide() {
        if (this.joystickRight != null) {
            this.joystickRight.destroy();
            this.joystickRight = null;
        }
        this.tiltUpButton.hide();
        this.tiltDownButton.hide();
        this.centerButton.hide();
        this.panLeftButton.hide();
        this.panRightButton.hide();
    }

    private sendCameraCommand = command => {
        if (this.isBusy && command !== "center") {
            console.log("Skipped request...");
            return;
        }
        this.isBusy = true;
        RequestsHelper.Current.put(`servos/${command}`, this.processResult);
    }

    private processResult = data => {
        var pan = data["pan"];
        var tilt = data["tilt"];
        if (pan != null && pan !== -1) {
            this.currentPan = pan;
        }
        if (tilt != null && tilt !== -1) {
            this.currentTilt = data["tilt"];
        }
        this.isBusy = false;
    }

    private adjustTilt = offset => (this.currentTilt + offset);

    private adjustPan = offset => (this.currentPan + offset);
}