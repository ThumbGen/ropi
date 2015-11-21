//http://jsfiddle.net/xk6ny85d/15/

var colorOff = "whitesmoke";
var color1 = "yellow";
var color2 = "orange";
var color3 = "orangered";
var color4 = "red";
var colorLeftLine = "red";
var colorRightLine = "green";

var canvas = null;
var circle1 = null;
var circle2 = null;
var circle3 = null;
var circle4 = null;
var left = null;
var right = null;
var lineLeft = null;
var lineRight = null;

var parking = {
    
    update: function (msg) {
        if (canvas != null) {
            circle1.stroke = colorOff;
            circle2.stroke = colorOff;
            circle3.stroke = colorOff;
            circle4.stroke = colorOff;
            left.stroke = colorOff;
            right.stroke = colorOff;
            lineLeft.fill = colorOff;
            lineRight.fill = colorOff;

            var dist = msg["d"];
            
            if (dist < 50 && dist >= 30) {
                circle1.stroke = color1;
            } 
            if (dist < 30 && dist >= 20) {
                circle2.stroke = color2;
            } 
            if (dist < 20 && dist >= 10) {
                circle3.stroke = color3;
            } 
            if (dist < 10 || msg["c"]) {
                circle4.stroke = color4;
            } 
            if (msg["l"]) {
                left.stroke = color4;
            } 
            if (msg["r"]) {
                right.stroke = color4;
            } 
            if (msg["ll"]) {
                lineLeft.fill = colorLeftLine;
            } 
            if (msg["rl"]) {
                lineRight.fill = colorRightLine;
            } 
            
            // sample: {'d': dist, 'l': l, 'c': c,'r': r, 'll': ll, 'rl': rl}
            canvas.renderAll();
        }
    },
    hide: function() {
      if (canvas != null) {
          canvas.dispose();
      }
    },
    init: function() {

        var resizeCanvas = function () {
            if (window.innerWidth < 800) {
                canvas.setZoom(0.5);
            }else {
                canvas.setZoom(1);
            }
        };

        $(window).resize(resizeCanvas);

        //var video1 = new fabric.Image($("#camera"), {
        //    left: 350,
        //    top: 300,
        //    angle: -15,
        //    originX: 'center',
        //    originY: 'center'
        //});

        var startAngle = -2.618; // 30deg
        var endAngle = -0.5235;
        startAngle = -2.35619; // 45deg
        endAngle = -0.785398;

        canvas = new fabric.Canvas("parkingControl");
        canvas.selection = false;
        canvas.allowTouchScrolling = true;
        canvas.setZoom(0.5);

        circle1 = new fabric.Circle({
            radius: 100,
            left: -10,
            top: 20,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        circle2 = new fabric.Circle({
            radius: 80,
            left: 10,
            top: 40,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        circle3 = new fabric.Circle({
            radius: 60,
            left: 30,
            top: 60,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        circle4 = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        left = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle - 0.8,
            endAngle: endAngle - 1.65,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        right = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle + 1.65,
            endAngle: endAngle + 0.8,
            stroke: colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        var body = new fabric.Rect({
            top: 115,
            left: 73,
            width: 50,
            height: 100,
            fill: "gray",
            selectable: false
        });

        var wleft = new fabric.Rect({
            top: 180,
            left: 45,
            width: 25,
            height: 50,
            fill: "dimgray",
            selectable: false
        });

        var wright = new fabric.Rect({
            top: 180,
            left: 126,
            width: 25,
            height: 50,
            fill: "dimgray",
            selectable: false
        });

        lineLeft = new fabric.Rect({
            top: 130,
            left: 80,
            width: 10,
            height: 20,
            fill: colorOff,
            selectable: false
        });

        lineRight = new fabric.Rect({
            top: 130,
            left: 106,
            width: 10,
            height: 20,
            fill: colorOff,
            selectable: false
        });

        canvas.add(circle1, circle2, circle3, circle4, left, right, body, wleft, wright, lineLeft, lineRight);

    }
   
};

