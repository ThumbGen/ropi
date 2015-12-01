class RobotControls implements IControls {

    joystickLeft : nipplejs.Manager = null;
    speedSlider = null;

    init() {

    }

    show() {
        this.showDirectionJoystick();
        this.showSpeedSlider();
    }

    hide() {
        if (this.joystickLeft != null) {
            this.joystickLeft.destroy();
            this.joystickLeft = null;
        }
        if (this.speedSlider != null) {
            this.speedSlider.destroy();
            this.speedSlider = null;
        }
    }

    private showDirectionJoystick = () => {
        if (this.joystickLeft != null) return;

        //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
        var evts = "plain:up";

        var currentDirectionAngle = 0;

        this.joystickLeft = nipplejs.create({
            zone: document.getElementById("jLeft"),
            mode: "static",
            size: 120,
            position: { left: "50%", top: "50%" },
            color: "green"
        }).on("start end", (evt, data) => {
            if (evt.type === "end") {
                RequestsHelper.Current.put("motor/stop");
            }
        }).on("move", (evt, data) => {
            // ignore movement smaller than 10
            var dist = data["distance"];
            if (dist > 10) {
                var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                if (angle !== currentDirectionAngle) {
                    RequestsHelper.Current.put(`motor/move/${angle}`);
                    currentDirectionAngle = angle;
                }
            }
        }).on(evts,
            (evt, data) => {
                console.log(evt.type);
            }
        );
    }

    private showSpeedSlider = () => {
        this.speedSlider = noUiSlider.create(document.getElementById("speedSlider"), {
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

        this.speedSlider.on("change", value => {
            var speed = Math.floor(value);
            RequestsHelper.Current.put(`motor/speed/${speed}`);
        });
    }
}