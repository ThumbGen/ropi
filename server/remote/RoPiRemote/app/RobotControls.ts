class RobotControls implements IControls {

    private joystickLeft = null;
    private accButton = null;
    private brakeButton = null;

    private currentSpeed: number = 40;

    init() {
        this.accButton = $("#accButton");
        this.accButton.click(() => {
            this.modifySpeed(+10);
        });
        this.brakeButton = $("#brakeButton");
        this.brakeButton.click(() => {
            this.modifySpeed(-10);
        });
    }

    show() {
        this.showDirectionJoystick();
        this.accButton.show();
        this.brakeButton.show();
    }

    hide() {
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
    }

    private showDirectionJoystick = () => {
        if (this.joystickLeft != null) return;

        //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
        var evts = "plain:up";

        var currentDirectionAngle = 0;

        Dashboard.getInstance().setCruiseControlSpeed(this.currentSpeed);

        this.joystickLeft = nipplejs.create({

            maxNumberOfNipples: 1,
            zone: document.getElementById("jLeft"),
            mode: "dynamic",
            size: 120,
            position: { left: "50%", top: "50%" },
            color: "green"
        }).on("start end", (evt, data) => {
            if (evt.type === "end") {
                RequestsHelper.Current.put("motor/stop");
                Dashboard.getInstance().stop();
            }
        }).on("move", (evt, data) => {
            // ignore movement smaller than 10
            var dist = data["distance"];
            if (dist > 10) {
                var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                if (angle !== currentDirectionAngle) {
                    RequestsHelper.Current.put(`motor/move/${angle}`);
                    currentDirectionAngle = angle;
                    Dashboard.getInstance().move();
                    if ((angle > 100 && angle < 260) || angle < 80 || angle > 280) {
                        Dashboard.getInstance().showIcon(DashboardIcons.TurnSignals);
                    } else {
                        Dashboard.getInstance().hideIcon(DashboardIcons.TurnSignals);
                    }
                }

            }
        }).on(evts,
            (evt, data) => {
                console.log(evt.type);
            }
            );
    }
    
    private modifySpeed(speed: number) {
        RequestsHelper.Current.put(`motor/speed/${this.currentSpeed + speed}`, (data) => {
            this.currentSpeed = data["speed"];
            Dashboard.getInstance().setCruiseControlSpeed(this.currentSpeed);
        });
    }
}