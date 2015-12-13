enum DashboardIcons {
    SeatBelt = 0,
    Tempomat = 1,
    FrontAssist = 2,
    Engine = 3,
    Headlights = 4,
    LaneAssist = 5,
    ParkingBrake = 6,
    ParkingSensors = 7,
    WaterTemperature = 8,
    TurnSignals = 9
}

interface IIcon {
    id: DashboardIcons;
    iconPath?: fabric.IPathGroup;
    isVisible? : boolean;
}

class DashboardIconsController {
 
    // the canvas to draw icons to
    private canvas: fabric.IStaticCanvas;
    // a dictionary holding all icons
    private icons: { [id: number]: IIcon; } = {};
    
    constructor(canvas: fabric.IStaticCanvas) {
        this.canvas = canvas;
    }

    // show the specified icon
    public showIcon(target: DashboardIcons) {

        const icon = this.icons[target];
        if (icon != undefined && icon.isVisible) {
            return;
        } else {
            // mark it visible ASAP
            this.icons[target] = { id: target, isVisible: true };
        }

        var path: string = null;
        var left = -1;
        var top = -1;

        switch (target) {
            case DashboardIcons.Engine:
                path = "/images/Engine.svg";
                left = 675;
                top = 435;
                break;
            case DashboardIcons.FrontAssist:
                path = "/images/Frontassist.svg";
                left = 1230;
                top = 300;
                break;
            case DashboardIcons.Headlights:
                path = "/images/Headlights.svg";
                left = 615;
                top = 10;
                break;
            case DashboardIcons.LaneAssist:
                path = "/images/Laneassist.svg";
                left = 525;
                top = 435;
                break;
            case DashboardIcons.ParkingBrake:
                path = "/images/Parkingbrake.svg";
                left = 840;
                top = 435;
                break;
            case DashboardIcons.ParkingSensors:
                path = "/images/Parkingsensors.svg";
                left = 1030;
                top = 300;
                break;    
            case DashboardIcons.SeatBelt:
                path = "/images/Seatbelt.svg";
                left = 900;
                top = 435;
                break;
            case DashboardIcons.Tempomat:
                path = "/images/Tempomat.svg";
                left = 465;
                top = 435;
                break;
            case DashboardIcons.TurnSignals:
                path = "/images/Turnsignal.svg";
                left = 675;
                top = 10;
                break;
            case DashboardIcons.WaterTemperature:
                path = "/images/Temperature.svg";
                left = 960;
                top = 280;
                break;
        }

        if (path !== null && left !== -1 && top !== -1) {
            fabric.loadSVGFromURL(path, (objects: fabric.IPath[]) => {
                var factor = Dashboard.getInstance().zoomFactor;
                
                var result = new fabric.PathGroup(objects, {
                    left: left * factor,
                    top: top * factor
                });
                result.scaleX = 0.7 * factor;
                result.scaleY = 0.7 * factor;
                this.canvas.add(result);
                this.icons[target] = { id: target, iconPath: result, isVisible: true };
            });
        }
    }   

    // hide the specified icon
    public hideIcon(target: DashboardIcons) {
        const icon = this.icons[target];
        if (icon != undefined && icon.isVisible) {
            icon.isVisible = false;
            this.canvas.remove(icon.iconPath);
            //this.canvas.renderAll();
            icon.iconPath = null;
        }
    }

    // test: display all icons for 3 seconds
    public showAllIcons() {
        this.showIcon(DashboardIcons.Engine);
        this.showIcon(DashboardIcons.FrontAssist);
        this.showIcon(DashboardIcons.Headlights);
        this.showIcon(DashboardIcons.LaneAssist);
        this.showIcon(DashboardIcons.ParkingBrake);
        this.showIcon(DashboardIcons.ParkingSensors);
        this.showIcon(DashboardIcons.SeatBelt);
        this.showIcon(DashboardIcons.Tempomat);
        this.showIcon(DashboardIcons.TurnSignals);
        this.showIcon(DashboardIcons.WaterTemperature);    
        
    }

    public hideAllIcons() {
        this.hideIcon(DashboardIcons.Engine);
        this.hideIcon(DashboardIcons.FrontAssist);
        this.hideIcon(DashboardIcons.Headlights);
        this.hideIcon(DashboardIcons.LaneAssist);
        this.hideIcon(DashboardIcons.ParkingBrake);
        this.hideIcon(DashboardIcons.ParkingSensors);
        this.hideIcon(DashboardIcons.SeatBelt);
        this.hideIcon(DashboardIcons.Tempomat);
        this.hideIcon(DashboardIcons.TurnSignals);
        this.hideIcon(DashboardIcons.WaterTemperature);
    }
}