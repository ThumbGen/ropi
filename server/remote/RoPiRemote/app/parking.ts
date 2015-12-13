//http://jsfiddle.net/xk6ny85d/15/

class Parking {

    private colorOff = "lightGray";
    private color1 = "yellow";
    private color2 = "orange";
    private color3 = "orangered";
    private color4 = "red";
    private colorLeftLine = "red";
    private colorRightLine = "green";

    private miniDisplay;
    private miniDisplayImage;
    private isOff = true;
    private canvas: fabric.IStaticCanvas;
    private circle1: fabric.ICircle = null;
    private circle2: fabric.ICircle = null;
    private circle3: fabric.ICircle = null;
    private circle4: fabric.ICircle = null;
    private left: fabric.ICircle = null;
    private right: fabric.ICircle = null;
    private lineLeft: fabric.IRect = null;
    private lineRight: fabric.IRect = null;
    //private distText: fabric.IText = null;

    public update = (msg) => {
        if (this.canvas != null) {
            this.circle1.stroke = this.colorOff;
            this.circle2.stroke = this.colorOff;
            this.circle3.stroke = this.colorOff;
            this.circle4.stroke = this.colorOff;
            this.left.stroke = this.colorOff;
            this.right.stroke = this.colorOff;
            this.lineLeft.fill = this.colorOff;
            this.lineRight.fill = this.colorOff;
            const dist = msg["d"];
            if (!this.isOff) {
                this.miniDisplay.setValue(dist);
            }

            if (dist < 50 && dist >= 30) {
                this.circle1.stroke = this.color1;
                
                //var sound = document.getElementById("beep");
                //sound.addEventListener("ended", function () {
                //    this.currentTime = 0;
                //    this.play();
                //}, false);
                //sound.play();


            }
            if (dist < 30 && dist >= 20) {
                this.circle2.stroke = this.color2;
            }
            if (dist < 20 && dist >= 10) {
                this.circle3.stroke = this.color3;
            }
            if (dist < 10 || msg["c"]) {
                this.circle4.stroke = this.color4;
            }
            if (msg["l"]) {
                this.left.stroke = this.color4;
            }
            if (msg["r"]) {
                this.right.stroke = this.color4;
            }
            if (msg["ll"]) {
                this.lineLeft.fill = this.colorLeftLine;
            }
            if (msg["rl"]) {
                this.lineRight.fill = this.colorRightLine;
            }

            // sample: {'d': dist, 'l': l, 'c': c,'r': r, 'll': ll, 'rl': rl}
            this.canvas.renderAll();
        }
    }

    public turnOff = () => {
        this.isOff = true;
        this.update({ "d": 10000 });
        this.drawMiniDisplay();
    }

    public turnOn = () => {
        this.isOff = false;
        this.drawMiniDisplay();
    }

    public init = (canvas: any) => {

        var startAngle = -2.618; // 30deg
        var endAngle = -0.5235;
        startAngle = -2.35619; // 45deg
        endAngle = -0.785398;

        this.canvas = canvas;//new fabric.Canvas("parkingControl");
        this.canvas.allowTouchScrolling = false;
        this.canvas.setZoom(1);

        this.circle1 = new fabric.Circle({
            radius: 100,
            left: -10,
            top: 20,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: this.colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        this.circle2 = new fabric.Circle({
            radius: 80,
            left: 10,
            top: 40,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: this.colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        this.circle3 = new fabric.Circle({
            radius: 60,
            left: 30,
            top: 60,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: this.colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        this.circle4 = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle,
            endAngle: endAngle,
            stroke: this.colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        this.left = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle - 0.8,
            endAngle: endAngle - 1.65,
            stroke: this.colorOff,
            strokeWidth: 17,
            fill: "",
            selectable: false
        });

        this.right = new fabric.Circle({
            radius: 40,
            left: 50,
            top: 80,
            angle: 0,
            startAngle: startAngle + 1.65,
            endAngle: endAngle + 0.8,
            stroke: this.colorOff,
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

        this.lineLeft = new fabric.Rect({
            top: 130,
            left: 80,
            width: 10,
            height: 20,
            fill: this.colorOff,
            selectable: false
        });

        this.lineRight = new fabric.Rect({
            top: 130,
            left: 106,
            width: 10,
            height: 20,
            fill: this.colorOff,
            selectable: false
        });

        /*
        this.distText = new fabric.Text("", {
            selectable: false,
            originX: "center",
            left: 98,
            top: 180,
            fontFamily: "Arial",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            fill: "white"
        });
        */

        var parkingControl = new fabric.Group([
            this.circle1, this.circle2, this.circle3, this.circle4, this.left, this.right,
            body, wleft, wright, this.lineLeft, this.lineRight/*, this.distText*/
        ], {
                left: 1078,
                top: 140,
                width: 150,
                //height: 225,
                scaleX: 1,
                scaleY: 1,
                lockScalingX: true,
                lockScalingY: true,
                lockScalingFlip: true,
                hasBorders: false,
                hasControls: false
            });

        this.canvas.add(parkingControl);

        this.drawMiniDisplay();
    }

    private drawMiniDisplay = () => {

        if (this.miniDisplayImage != null) {
            this.canvas.remove(this.miniDisplayImage);
        }

        if (this.isOff) {
            this.miniDisplay = new steelseries.DisplaySingle("gMini", {
                width: 160,
                height: 60,
                valuesNumeric: false,
                value: "off ",
                lcdDecimals: 0
            });
        } else {
            this.miniDisplay = new steelseries.DisplaySingle("gMini", {
                width: 160,
                height: 60,
                unitString: "cm",
                lcdDecimals: 0,
                unitStringVisible: true
            });
        }

        var factor = Dashboard.getInstance().zoomFactor;
        this.miniDisplayImage = new fabric.Image(document.getElementById("gMini"), {
            left: 1073 * factor,
            top: 360 * factor,
            width: 160 * factor,
            height: 60 * factor
            
        });
        this.canvas.add(this.miniDisplayImage);
    }
};

