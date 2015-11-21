
var joystickLeft = null;
var joystickRight = null;

//var options = {
//    zone: Element,                  // active zone
//    color: String,
//    size: Integer,
//    threshold: Float,               // before triggering a directional event
//    fadeTime: Integer,              // transition time
//    multitouch: Boolean,
//    maxNumberOfNipples: Number,     // when multitouch, what is too many?
//    dataOnly: Boolean,              // no dom element whatsoever
//    position: Object,               // preset position for 'static' mode
//    mode: String,                   // 'dynamic', 'static' or 'semi'
//    restOpacity: Number,            // opacity when not 'dynamic' and rested
//    catchDistance: Number           // distance to recycle previous joystick in 'semi' mode
//};


var directionJoystick = {
    init: function () {
        var container = document.getElementById("jLeft");

        //var joystickLeft = nipplejs.create({
        //    maxNumberOfNipples: 2,
        //    catchDistance: 10,
        //    multitouch: false,
        //    zone: container,
        //    mode: "static",
        //    position: { left: '50%', top: '50%' },
        //    color: "red"
        //});


    }
};

var cameraJoystick = {
    init: function () {
        var container = document.getElementById("jRight");

        var joystickRight = nipplejs.create({
            maxNumberOfNipples: 2,
            multitouch: false,
            catchDistance: 10,
            zone: container,
            mode: "static",
            position: { left: '50%', top: '50%' },
            color: "green"
        });


    }
};

var joysticks = {
    init: function () {

        //var manager = nipplejs.create(
        //    {
        //        maxNumberOfNipples: 2,
        //        catchDistance: 100,
        //        multitouch: true,
        //        zone: document.getElementById("joysticksContainer"),
        //        mode: "semi",
        //        position: { left: '50%', top: '50%' },
        //        color: "red"
        //    });
        //var joystickLeft = manager.createNipple({ left: '20%', top: '50%' }, 0);
        //var joystickRight = manager.createNipple({ left: '80%', top: '50%' }, 1);

        //var evts = "dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right";
        var evts = "plain:up";

        var currentDirectionAngle = 0;

        var joystickLeft = nipplejs.create({
            zone: document.getElementById("jLeft"),
            mode: "static",
            position: { left: "50%", top: "50%" },
            color: "red"
        }).on("start end", function (evt, data) {
            if (connected) {
                if (evt.type === "end") {
                    $.ajax({
                        url: baseServerUrl + "motor/stop",
                        type: "PUT",
                        success: function (result) {
                            console.log("STOP");
                        }
                    });
                }
            }
        }).on("move", function (evt, data) {
            if (connected) {
                // ignore movement smaller than 20
                var dist = data["distance"];
                if (dist > 10) {
                    var angle = Math.floor(data["angle"]["degree"] / 10) * 10;
                    if (angle !== currentDirectionAngle) {
                        $.ajax({
                            url: baseServerUrl + "motor/move/" + angle,
                            type: "PUT",
                            success: function(result) {
                                console.log(angle);
                            }
                        });

                        currentDirectionAngle = angle;
                    }
                }
            }
        }).on(evts,
                function (evt, data) {
                    if (connected) {
                        console.log(evt.type);
                    }
                }
            )/*.on('pressure', function (evt, data) {
                console.log({ pressure: data });
            })*/;

        //var joystickRight = nipplejs.create({
        //    zone: document.getElementById("jRight"),
        //    mode: "static",
        //    position: { left: '50%', top: '50%' },
        //    color: "green"
        //});
    }
}