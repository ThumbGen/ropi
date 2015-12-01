class CameraControls implements IControls {

    joystickRight = null;

    panLeftButton = null;
    panRightButton = null;
    tiltUpButton = null;
    tiltDownButton = null;
    centerButton = null;

    currentTilt = 95;
    currentPan = 90;


    init() {
        this.tiltUpButton = $("#tiltUpButton");
        this.tiltUpButton.click(() => {
            this.sendCameraCommand(`tilt/${this.adjustTilt(-10) }`);
        });

        this.tiltDownButton = $("#tiltDownButton");
        this.tiltDownButton.click(() => {
            this.sendCameraCommand(`tilt/${this.adjustTilt(+10) }`);
        });

        this.centerButton = $("#centerButton");
        this.centerButton.click(() => {
            this.sendCameraCommand("center");
        });

        this.panLeftButton = $("#panLeftButton");
        this.panLeftButton.click(() => {
            this.sendCameraCommand(`pan/${this.adjustPan(+10) }`);
        });
        this.panRightButton = $("#panRightButton");
        this.panRightButton.click(() => {
            this.sendCameraCommand(`pan/${this.adjustPan(-10) }`);
        });
    }

    show() {
        if (this.joystickRight != null) return;

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
    }

    private adjustTilt = offset => (this.currentTilt + offset);

    private adjustPan = offset => (this.currentPan + offset);
}