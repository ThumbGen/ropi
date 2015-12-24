enum CameraControl {
    SteppedJoystick,
    FollowMeJoystick
}

class CameraControls implements IControls {

    private joystickRight = null;

    private currentTilt = 95;
    private currentPan = 90;
    private step = 10;

    private isBusy = false;

    currentCameraControls = CameraControl.SteppedJoystick;

    init() {

    }

    selectMode(cameraControl: CameraControl) {
        this.currentCameraControls = cameraControl;
    }

    show() {

        var currentDirection = null;
        var currentDistance = 0;
        var currentPanPercent = 0;
        var currentTiltPercent = 0;
        var joystickSize = 120;
        var distanceMax = Math.floor(joystickSize / 2);
        var centerX = 0;
        var centerY = 0;
        var currentInterval;

        this.hide();

        this.currentCameraControls = CameraControl.SteppedJoystick;
        if (this.joystickRight != null) return;

        this.joystickRight = nipplejs.create({
            maxNumberOfNipples: 1,
            zone: document.getElementById("jRight"),
            size: joystickSize,
            mode: "dynamic",
            position: { left: "50%", top: "50%" },
            color: "blue"
        }).on("start end", (evt, data) => {

            if (this.currentCameraControls === CameraControl.FollowMeJoystick) {
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
            } else if (this.currentCameraControls === CameraControl.SteppedJoystick) {
                clearInterval(currentInterval);

                if (evt.type === "start") {

                } else {
                    this.sendCameraCommand(`move/stop`);
                }
            }
        }).on("move", (evt, data) => {

            if (this.currentCameraControls === CameraControl.FollowMeJoystick) {
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
                    }
                }
            }
        }).on("dir", (evt, data) => {

            if (this.currentCameraControls === CameraControl.SteppedJoystick) {

                var direction = data["direction"]["angle"];
                console.log(direction);
                if (currentDirection === direction) {
                    return;
                }

                currentDirection = direction;
                this.sendCameraCommand(`move/${currentDirection}`);
            }
        });
    }

    hide() {

        if (this.joystickRight != null) {
            this.joystickRight.destroy();
            this.joystickRight = null;
        }

        this.currentCameraControls = CameraControl.SteppedJoystick;
    }

    private sendCameraCommand = command => {
        if (this.isBusy && command !== "center") {
            console.log("Skipped request...");
            return;
        }
        this.isBusy = true;
        RequestsHelper.Current.put(`servos/${command}`, this.processResult, () => this.isBusy = false);
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