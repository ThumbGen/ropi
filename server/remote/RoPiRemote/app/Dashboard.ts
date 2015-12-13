//http://jsfiddle.net/mentosan/o3nxs401/146/

class Dashboard {

    private static instance: Dashboard;

    constructor() {
        if (Dashboard.instance) {
            throw new Error("Error - use Dashboard.getInstance()");
        }
    }

    static getInstance(): Dashboard {
        Dashboard.instance = Dashboard.instance || new Dashboard();
        return Dashboard.instance;
    }

    public parkingControl = new Parking();
    private clockController: DashboardClockController;
    private iconsController: DashboardIconsController;

    private cameraInterval: any;
    private leftGauge;
    private rightGauge;
    private iconSeatBelt: fabric.IPathGroup;
    private canvas = new fabric.StaticCanvas("dashboard");
    public zoomFactor = 1;
    private originalWidth = 1408;
    private originalHeight = 513;
    private isCameraVisible = false;
    private tempInterval;
    private cruiseControlSpeed = 0;
    private isMoving = false;
    private cameraUrl = null;
    private cameraImage;

    public show = () => {

        this.canvas.setBackgroundColor("black", () => { });
        this.canvas.setHeight(this.originalHeight);
        this.canvas.setWidth(this.originalWidth);

        this.clockController = new DashboardClockController(this.canvas);
        this.iconsController = new DashboardIconsController(this.canvas);

        this.drawMiddleDisplay();

        this.drawCameraAndGauges();

        setInterval(() => { 
            //leftGauge.setValueAnimated(Math.random() * 100); 
            //rightGauge.setValueAnimated(Math.random() * 100); 
            //leftGauge.setOdoValue(Math.random() * 30000.2)
            this.clockController.updateTime();
            if (this.cameraInterval == null) {
                this.canvas.renderAll();
            }
        }, 1000);

        window.onresize = this.resizeCanvas;
        
        this.tempInterval = setInterval(() => {
            clearInterval(this.tempInterval);
            this.resizeCanvas();
        }, 500);
        
    }

    public startEngine = (callback: any) => {

        this.iconsController.showAllIcons();
        this.leftGauge.setValue(100);
        this.rightGauge.setValue(90);

        setTimeout(() => {
            this.iconsController.hideAllIcons();
            this.leftGauge.setValue(0);
            this.rightGauge.setValue(0);

            this.parkingControl.turnOn();
            this.showIcon(DashboardIcons.ParkingSensors);
            this.showIcon(DashboardIcons.Headlights);
            this.showIcon(DashboardIcons.ParkingBrake);

            if (callback != null) {
                callback();
            }
        }, 1500);
    }

    public stopEngine = (callback: any) => {
        this.iconsController.hideAllIcons();
        this.parkingControl.turnOff();
        if (callback != null) {
            callback();
        }
    }

    public setCruiseControlSpeed = (speed: number) => {
        if (this.leftGauge != null) {
            var needMove = false;
            if (this.cruiseControlSpeed !== speed && this.isMoving) {
                needMove = true;
            }
            this.cruiseControlSpeed = speed;
            this.leftGauge.setThreshold(this.cruiseControlSpeed);
            if (needMove) {
                this.move();
            }
        }
        if (this.cruiseControlSpeed === 0) {
            this.hideIcon(DashboardIcons.Tempomat);
        } else {
            this.showIcon(DashboardIcons.Tempomat);
        }
    }

    public move = () => {
        if (this.leftGauge != null && this.cruiseControlSpeed != null && !this.isMoving) {
            this.hideIcon(DashboardIcons.ParkingBrake);
            this.isMoving = true;
            this.leftGauge.setValueAnimated(this.cruiseControlSpeed);
        }
    }

    public stop = () => {
        if (this.leftGauge != null) {
            this.isMoving = false;
            this.leftGauge.setValueAnimated(0);
            this.showIcon(DashboardIcons.ParkingBrake);
            this.hideIcon(DashboardIcons.TurnSignals);
        }
    }

    public showIcon = (icon: DashboardIcons) => {
        this.iconsController.showIcon(icon);
    }

    public hideIcon = (icon: DashboardIcons) => {
        this.iconsController.hideIcon(icon);
    }

    public startCamera = () => {

        //this.cameraUrl = "http://img.izismile.com/img/img5/20120809/video/definitely_not_what_youd_expect_to_see_from_a_russian_dashcam_400x300_01.jpg";
        this.cameraUrl = Settings.Current.getBaseServerUrl() + ":8080/stream/video.mjpeg";

        var img = <HTMLImageElement>document.getElementById("camera");
        img.onload = () => {
            this.clockController.hideClock();
            this.cameraImage.setElement(img);
            this.cameraImage.width = 500;
            this.cameraImage.height = 375;
        }
        img.onerror = () => {
            this.clockController.showClock();
        }
        img.src = this.cameraUrl;

        this.cameraInterval = setInterval(() => { 
            this.canvas.renderAll();
        }, 250);
    }

    public stopCamera = () => {
        
        if (this.cameraInterval != null) {
            clearInterval(this.cameraInterval);
            this.cameraInterval = null;
        }
        this.cameraUrl = "http://";
        var img = <HTMLImageElement>document.getElementById("camera");
        img.onerror = () => {
            this.clockController.showClock();
        }
        img.src = this.cameraUrl;
    }

    private drawCameraAndGauges = () => {

        fabric.Image.fromURL("http://",
        (image) => {
            this.cameraImage = image;
            var ar = image.height / image.width;
            image.left = 455;
            image.top = 60;
            //image.width = 500;
            //image.height = 375; //image.width * ar;
            this.canvas.add(image);
            this.drawGauges();
        });
        
        this.clockController.showClock();
    }

    private drawLeftGauge = () => {
        this.leftGauge = new steelseries.Radial("gLeft", {
            gaugeType: steelseries.GaugeType.TYPE3,
            minValue: 0,
            maxValue: 100,
            size: 510,
            ledVisible: false,
            foregroundType: steelseries.ForegroundType.TYPE3,
            //frameDesign: steelseries.FrameDesign.STEEL,
            frameDesign: steelseries.FrameDesign.TILTED_BLACK,
            knobStyle: steelseries.KnobStyle.SILVER,
            pointerType: steelseries.PointerType.TYPE9,
            lcdDecimals: 0,
            threshold: 0,
            tickLabelOrientation: steelseries.TickLabelOrientation.HORIZONTAL,
            section: null,
            area: null,
            titleString: "Speed",
            unitString: "%",
            lcdVisible: true,
            useOdometer: true,
            odometerParams: { digits: 5 },
            backgroundColor: steelseries.BackgroundColor.BLACK
        });
        var leftGaugeImage = new fabric.Image(document.getElementById("gLeft"), {
            left: 0,
            top: 0,
            width: 510,
            height: 510
        });
        this.canvas.add(leftGaugeImage);
    }

    private drawRightGauge = () => {
        this.rightGauge = new steelseries.RadialBargraph("gRight", {
            gaugeType: steelseries.GaugeType.TYPE2,
            minValue: 10,
            maxValue: 90,
            size: 510,
            tickLabelOrientation: steelseries.TickLabelOrientation.HORIZONTAL,
            foregroundType: steelseries.ForegroundType.TYPE3,
            frameDesign: steelseries.FrameDesign.TILTED_BLACK,
            ledVisible: false,
            niceScale: false,
            fractionalScaleDecimals: false,
            useValueGradient: true,
            section: null,
            area: null,
            lcdVisible: false,
            backgroundColor: steelseries.BackgroundColor.BLACK
        });
        var rightGaugeImage = new fabric.Image(document.getElementById("gRight"), {
            left: 898,
            top: 0,
            width: 510,
            height: 510
        });
        this.canvas.add(rightGaugeImage);
    }

    private drawGauges = () => {
        this.drawLeftGauge();
        this.drawRightGauge();
        this.parkingControl.init(this.canvas);
    }

    private drawMiddleDisplay = () => {
        this.canvas.add(new fabric.Line([400, 59, 1000, 59], {
            stroke: "gray",
            strokeWidth: 2
        }));
        this.canvas.add(new fabric.Line([400, 436, 1000, 436], {
            stroke: "gray",
            strokeWidth: 2
        }));
        var degreesText = new fabric.Text("22.5 °C", {
            fontSize: 28,
            textAlign: "center",
            left: 890,
            top: 25,
            fontFamily: "Arial",
            fill: "white"
        });
        this.canvas.add(degreesText);
    };

    private zoomIt = (factor) => {
        this.canvas.setHeight(this.canvas.getHeight() * factor);
        this.canvas.setWidth(this.canvas.getWidth() * factor);
        if (this.canvas.backgroundImage) {
            // Need to scale background images as well
            const bi = this.canvas.backgroundImage;
            bi.width = bi.width * factor;
            bi.height = bi.height * factor;
        }
        var objects = this.canvas.getObjects();
        for (var i in objects) {
            const scaleX = objects[i].scaleX;
            const scaleY = objects[i].scaleY;
            const left = objects[i].left;
            const top = objects[i].top;

            const tempScaleX = scaleX * factor;
            const tempScaleY = scaleY * factor;
            const tempLeft = left * factor;
            const tempTop = top * factor;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }
        this.canvas.renderAll();
        this.canvas.calcOffset();
    }

    private resizeCanvas = () => {
        
        //return;

        var clientWidth = window.innerWidth;
        //var clientHeight = window.innerHeight;

        this.zoomFactor = clientWidth / this.canvas.getWidth();

        //debugger;
        this.zoomIt(this.zoomFactor);
    };
}
