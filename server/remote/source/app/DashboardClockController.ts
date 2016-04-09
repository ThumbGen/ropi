class DashboardClockController {

    private canvas: fabric.IStaticCanvas;
    private clockGaugeImage: fabric.IImage;
    private clockText: fabric.IText;
    private visible: boolean;
    
    constructor(canvas: fabric.IStaticCanvas) {
        this.canvas = canvas;

        this.clockText = new fabric.Text("21:45", {
            fontSize: 28,
            textAlign: "center",
            left: 420,
            top: 25,
            fontFamily: "Arial",
            fill: "white"

        });
        this.canvas.add(this.clockText);

        this.updateTime();
    }
    
    public isVisible = () =>{
        return this.visible;
    }
    
    public hideClock = () => {
        this.canvas.remove(this.clockGaugeImage);
        this.visible = false;
    }

    public showClock = () => {
        this.hideClock();

        new steelseries.Clock("gClock", {
            gaugeType: steelseries.GaugeType.TYPE4,
            size: 170,
            secondPointerVisible: true,
            backgroundVisible: true,
            backgroundColor: steelseries.BackgroundColor.BRUSHED_STAINLESS,
            frameVisible: false,
            frameDesign: steelseries.FrameDesign.TILTED_BLACK,
            minValue: 20,
            maxValue: 80,
            value: 45,
            niceScale: true,
            pointerType: steelseries.PointerType.TYPE5,
        });
        var factor = Dashboard.getInstance().zoomFactor;
        this.clockGaugeImage = new fabric.Image(document.getElementById("gClock"), {
            left: 579 * factor,
            top: 120 * factor,
            width: 250 * factor,
            height: 250 * factor

        });
        this.canvas.add(this.clockGaugeImage);
        this.canvas.renderAll();
        this.visible = true;
    }

    public updateTime = () => {
        var today = new Date();
        var h = this.checkTime(today.getHours());
        var m = this.checkTime(today.getMinutes());
        this.clockText.setText(h + ":" + m);
    }

    private checkTime = (i) => {
        if (i < 10) {
            i = `0${i}`;
        }; // add zero in front of numbers < 10
        return i;
    }
}