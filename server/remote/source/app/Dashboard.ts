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
    private dummyVoltageValue = "22.5 °C";

    private tempWarningLimit = 60; // show temperature warning over 60 degrees
    private warningTemperatureColor = steelseries.ColorDef.RED;
    private normalTemperatureColor = steelseries.ColorDef.RAITH;
    
    //private logoUrl = "http://dexterind.wpengine.com/wp-content/uploads/2015/07/dexter-logo-sm.png";
    //private logoUrl = "Pi2GoLogo.png";
    private logoUrl = null;
    private logoImage;
    private cameraInterval: any;
    private leftGauge;
    private miniGaugeLeft;
    private miniGaugeRight;
    private rightGauge;
    private voltageText: fabric.IText;
    private canvas = new fabric.StaticCanvas("dashboard");
    public zoomFactor = 1;
    private originalWidth = 1408;
    private originalHeight = 513;
    private isCameraVisible = false;
    private tempInterval;
    private cruiseControlSpeed = 0;
    private isMoving = false;
    private cameraImage;

    public show = () => {

        this.canvas.setBackgroundColor("black", () => { });
        this.canvas.setHeight(this.originalHeight);
        this.canvas.setWidth(this.originalWidth);

        this.clockController = new DashboardClockController(this.canvas);
        this.iconsController = new DashboardIconsController(this.canvas);
        this.parkingControl.iconsController = this.iconsController;

        this.drawMiddleDisplay();

        this.drawCameraAndGauges();

        setInterval(() => {
            if(this.clockController.isVisible()) { 
                this.clockController.updateTime();
                if (this.cameraInterval == null) {
                    this.canvas.renderAll();
                }
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
        this.rightGauge.setValueColor(this.normalTemperatureColor);
        this.miniGaugeLeft.setValue(100);
        this.miniGaugeRight.setValue(100);


        setTimeout(() => {
            this.iconsController.hideAllIcons();
            this.leftGauge.setValue(0);
            this.rightGauge.setValue(0);
            this.miniGaugeLeft.setValue(0);
            this.miniGaugeRight.setValue(0);


            this.parkingControl.turnOn();
            this.showIcon(DashboardIcons.ParkingSensors);
            this.showIcon(DashboardIcons.Headlights);
            this.showIcon(DashboardIcons.ParkingBrake);
            this.showIcon(DashboardIcons.SeatBelt);
            
            if (callback != null) {
                callback();
            }
        }, 1500);
    }

    public stopEngine = (callback: any) => {
        this.setLogoUrl(null);
        this.showClockOrLogo();
        this.parkingControl.turnOff();
        this.miniGaugeLeft.setValue(0);
        this.miniGaugeRight.setValue(0);
        this.rightGauge.setValueAnimated(0);
        this.rightGauge.setValueColor(this.normalTemperatureColor);
        this.iconsController.hideAllIcons();
        this.voltageText.setText(this.dummyVoltageValue);
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

        var img = <HTMLImageElement>document.getElementById("camera");
        img.onload = () => {
            this.hideLogo();
            this.hideClock();
            this.cameraImage.setElement(img);
            this.cameraImage.width = 500;
            this.cameraImage.height = 375;
        }
        img.onerror = () => {
            this.showClockOrLogo();
        }
        img.src = Settings.Current.getCameraUrl();

        this.cameraInterval = setInterval(() => { 
            this.canvas.renderAll();
        }, 250);
    }

    public stopCamera = () => {
        
        if (this.cameraInterval != null) {
            clearInterval(this.cameraInterval);
            this.cameraInterval = null;
        }
        
        var img = <HTMLImageElement>document.getElementById("camera");
        img.onerror = () => {
            this.showClockOrLogo();
        }
        img.src = "http://";
    }

    public update = (msg) => {
        if (this.canvas != null) {
            var memPercent = msg["mp"];
            var cpuPercent = msg["cp"];
            var cpuTemp = msg["ct"];
            
            this.rightGauge.setValueAnimated(cpuTemp);
            this.miniGaugeLeft.setValue(cpuPercent);
            this.miniGaugeRight.setValue(memPercent);

            // if cpu temp > tempWarningLimit => show warning
            if (cpuTemp > this.tempWarningLimit) {
                this.iconsController.showIcon(DashboardIcons.WaterTemperature);
                this.rightGauge.setValueColor(this.warningTemperatureColor);
            } else {
                this.iconsController.hideIcon(DashboardIcons.WaterTemperature);
                this.rightGauge.setValueColor(this.normalTemperatureColor);
            }
            // voltage
            if(msg["v"] !== "0"){
                this.voltageText.setText(msg["v"] + " V");
            } else{
                this.voltageText.setText(this.dummyVoltageValue);
            }
        }
    }

    public setLogoUrl = (logo) => {
        this.logoUrl = logo;
    }

    private hideLogo = () =>{
        this.canvas.remove(this.logoImage);
        this.canvas.renderAll();
    }

    private hideClock = () => {
        this.clockController.hideClock();
    }

    private showClockOrLogo = () => {
        this.clockController.hideClock();
        if(this.logoUrl !== null){
            fabric.Image.fromURL(this.logoUrl,
                (image) => {
                    this.logoImage = image;
                    var ar = image.height / image.width;
                    image.width = 200 * this.zoomFactor;
                    image.left = 705 * this.zoomFactor - image.width / 2;
                    image.height = image.width * ar;
                    image.top = 220 * this.zoomFactor - image.height / 2;
                    this.canvas.add(image);
                    this.canvas.renderAll();
                });
        } else {
            this.hideLogo();
            this.clockController.showClock();
        }
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
        
        this.showClockOrLogo();
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
            backgroundColor: steelseries.BackgroundColor.CARBON
        });
        var leftGaugeImage = new fabric.Image(document.getElementById("gLeft"), {
            left: 0,
            top: 0,
            width: 510,
            height: 510
        });
        this.canvas.add(leftGaugeImage);

        this.voltageText = new fabric.Text(this.dummyVoltageValue, {
            fontSize: 28,
            textAlign: "center",
            left: 890,
            top: 25,
            fontFamily: "Arial",
            fill: "white"
        });
        this.canvas.add(this.voltageText);

        this.miniGaugeLeft = new steelseries.Linear("gMiniLeft", {
            gaugeType: steelseries.GaugeType.TYPE1,
            backgroundVisible: false,
            frameVisible: false,
            minValue: 0,
            maxValue: 100,
            ledVisible: false,
            thresholdVisible: false,
            lcdVisible: false,
            niceScale: false,
            foregroundVisible: false,
        });
        var miniGaugeLeftImage = new fabric.Image(document.getElementById("gMiniLeft"), {
            left: 405,
            top: 400,
            width: 340,
            height: 80
        });
        this.canvas.add(miniGaugeLeftImage);

        this.miniGaugeRight = new steelseries.Linear("gMiniRight", {
            gaugeType: steelseries.GaugeType.TYPE1,
            backgroundVisible: false,
            frameVisible: false,
            minValue: 0,
            maxValue: 100,
            ledVisible: false,
            lcdVisible: false,
            niceScale: true,
            thresholdVisible: false,
            foregroundVisible: false,
        });
        var miniGaugeRightImage = new fabric.Image(document.getElementById("gMiniRight"), {
            left: 660,
            top: 400,
            width: 340,
            height: 80
        });
        this.canvas.add(miniGaugeRightImage);
    }

    private drawRightGauge = () => {
        this.rightGauge = new steelseries.RadialBargraph("gRight", {
            gaugeType: steelseries.GaugeType.TYPE2,
            minValue: 10,
            maxValue: 90,
            size: 510,
            valueColor: this.normalTemperatureColor,
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
            backgroundColor: steelseries.BackgroundColor.CARBON
        });
        var rightGaugeImage = new fabric.Image(document.getElementById("gRight"), {
            left: 898,
            top: 0,
            width: 510,
            height: 510
        });
        this.canvas.add(rightGaugeImage);
        var degreesSymbol = new fabric.Text("°C", {
            fontSize: 28,
            textAlign: "center",
            left: 1317,
            top: 270,
            fontFamily: "Arial",
            fill: "white"
        });
        this.canvas.add(degreesSymbol);
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
        this.zoomFactor = clientWidth / this.canvas.getWidth();
        //debugger;
        this.zoomIt(this.zoomFactor);
    };
}
