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
    private cameraControlsButtons = null;

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
        this.cameraControlsOff = $("#controlsOff").click(() => {
            this.cameraControls.hide();
        });
        this.cameraControlsJoystick = $("#controlsJoystick").click(() => {
            this.cameraControls.show(CameraControl.Joystick);
        });
        this.cameraControlsButtons = $("#controlsButtons").click(() => {
            this.cameraControls.show(CameraControl.Buttons);
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

    private getIsControlsActive = () => this.cameraControls.currentCameraControls !== CameraControl.None;

    private disableControlsButton = () => {
        this.cameraControls.hide();
        this.cameraControlsButton.prop("disabled", true);
    }

    private enableControlsButton = () => {
        this.cameraControlsButton.prop("disabled", false);
        if (!this.getIsControlsActive()) {
            this.cameraControls.show(CameraControl.Joystick);
        }
    }

    private connect = () => {
        this.socketio = io.connect(Settings.Current.getBaseServerUrl() + ":80/", { 'forceNew': true });
        this.socketio.on("connected", msg => {
            //updateConnectionStatus(true, msg);
            Dashboard.getInstance().hideIcon(DashboardIcons.Engine);
        });
        this.socketio.on("disconnected", msg => {
            this.connectButton.bootstrapToggle("off");
            this.cameraButton.bootstrapToggle("off");
        });
        this.socketio.on("parking", msg => {
            Dashboard.getInstance().parkingControl.update(msg);
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
        if (this.getIsControlsActive()) {
            this.cameraControls.show();
        } else {
            this.cameraControls.hide();
        }
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
                this.robotControls.hide();
                this.disconnect();
                if (!this.getIsCameraActive()) {
                    this.disableControlsButton();
                }
            });
        }
    }
}