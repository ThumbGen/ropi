$(document).ready(() => {

    new Application().run();

});

class Application {
    private socketio = null;
    private robotIpEntry = null;
    private cameraButton = null;
    private connectButton = null;
    private cameraControlsButton = null;
    private cameraControlsOff = null;
    private cameraControlsJoystick = null;
    private cameraControlsSteppedJoystick = null;

    private robotControls = new RobotControls();
    private cameraControls = new CameraControls();

    run = () => {
        this.robotControls.init();
        this.cameraControls.init();

        this.cameraButton = $("#cameraButton");
        this.cameraButton.bootstrapToggle();
        this.cameraButton.change(() => {
            this.processToggleCamera();
        });

        this.connectButton = $("#connectButton");
        this.connectButton.bootstrapToggle();
        this.connectButton.change(() => {
            this.processRobotToggle();
        });

        this.cameraControlsButton = $("#controlsButtonOptions");
        this.cameraControlsJoystick = $("#controlsJoystick").click(() => {
            this.cameraControls.selectMode(CameraControl.FollowMeJoystick);
        });
        this.cameraControlsSteppedJoystick = $("#controlsSteppedJoystick").click(() => {
            this.cameraControls.selectMode(CameraControl.SteppedJoystick);
        });
        this.disableControlsButton();

        var settingsButton = $("#settingsButton");
        settingsButton.click(() => {
            Settings.Current.show();
        });

        Dashboard.getInstance().show();
    }

    private getToggleStatus = toggle => (toggle != null && toggle.prop("checked"));

    private getIsConnected = () => this.getToggleStatus(this.connectButton);

    private getIsCameraActive = () => this.getToggleStatus(this.cameraButton);

    private getIsControlsActive = () => true;

    private disableControlsButton = () => {
        this.cameraControls.hide();
        this.cameraControlsButton.prop("disabled", true);
    }

    private enableControlsButton = () => {
        this.cameraControlsButton.prop("disabled", false);
        this.cameraControls.show();
    }

    private connect = () => {
        this.socketio = io.connect(Settings.Current.getBaseServerUrl() + ":80/", { 'forceNew': true });
        this.socketio.on("connected", msg => {
            $("#badge").text(msg.title + ' ' + msg.robotType);
            //updateConnectionStatus(true, msg);
            Dashboard.getInstance().hideIcon(DashboardIcons.Engine);
        });
        this.socketio.on("disconnected", msg => {
            $("#badge").text('offline');
            this.connectButton.bootstrapToggle("off");
            this.cameraButton.bootstrapToggle("off");
        });
        this.socketio.on("parking", msg => {
            Dashboard.getInstance().parkingControl.update(msg);
        });
        this.socketio.on("sysinfo", msg => {
            Dashboard.getInstance().update(msg);
        });

        this.socketio.on("error", msg => {
            Dashboard.getInstance().showIcon(DashboardIcons.Engine);
        });

        this.socketio.on("reconnect_error", msg => {
            Dashboard.getInstance().showIcon(DashboardIcons.Engine);
        });

        this.socketio.emit("connect");
    }

    private disconnect = () => {
        if (this.socketio !== null) {
            this.socketio.disconnect();
        }
    }

    private processToggleControls = () => {
        if (!this.getIsCameraActive()) return;
    }

    private processToggleCamera = () => {
        if (this.getIsCameraActive()) {
            Dashboard.getInstance().startCamera();
            this.enableControlsButton();
        } else {
            Dashboard.getInstance().stopCamera();
            this.cameraControls.hide();
            this.disableControlsButton();
        }
    }

    private processRobotToggle = () => {
        if (this.getIsConnected()) {
            Dashboard.getInstance().startEngine(() => {
                this.connect();
                this.robotControls.show();
                // optionally switch on camera if not already running
                if (!this.getIsCameraActive()) {
                    this.cameraButton.bootstrapToggle("toggle");
                }
                this.enableControlsButton();
            });
        } else {
            Dashboard.getInstance().stopEngine(() => {
                $("#badge").text('offline');
                this.robotControls.hide();
                this.disconnect();
                if (!this.getIsCameraActive()) {
                    this.disableControlsButton();
                }
            });
        }
    }
}