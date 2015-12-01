
class Settings {

    private robotIpCookieName = "RobotIP";

    private robotIP: string = null;

    static Current = new Settings();

    show = () => {
        
        BootstrapDialog.show({
            title: "Settings",
            message: $("<div></div>").load("settings.html"),
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            data: {},
            onshow: (dialogRef) => {

            },
            onshown: (dialogRef) => {
                //update ui
                $("#robotIP").val(this.getRobotIp());
                $("#shutdownButton").click(this.executeShutdown);
                $("#rebootButton").click(this.executeReboot);
                $("#stopButton").click(this.executeStop);
            },
            buttons: [
                {
                    label: "Close",
                    action(dialogItself) {
                        dialogItself.close();
                    }
                }
            ],
            onhide: (dialogRef) => {
                this.robotIP = $("#robotIP").val();
                this.storeRobotIp();
            }
        });
    }

    getRobotIp() {
        if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
            this.robotIP = Cookies.get(this.robotIpCookieName);
            if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
                this.robotIP = window.location.hostname;
            }
            if (this.robotIP == null || this.robotIP === "" || this.robotIP === "undefined") {
                this.robotIP = "raspberrypi";
            }
        }
        return this.robotIP;
    }

    storeRobotIp() {
        Cookies.set(this.robotIpCookieName, this.robotIP);
    }

    getBaseServerUrl = () => {
        return `http://${this.getRobotIp() }`;
    }

    getBaseAPIUrl = () => {
        return `http://${this.getRobotIp() }:80/ropi/api/v1.0/`;
    }

    private executeShutdown() {
        BootstrapDialog.confirm({
                title: "WARNING",
                message: "You are about to shutdown the Robot.\r\n You won't be able to reach it anymore (power on required)",
                type: BootstrapDialog.TYPE_DANGER,
                btnOKLabel: "Yes, shutdown!",
                btnOKClass: "btn-danger",
                callback(result) {
                    if (result) {
                        RequestsHelper.Current.put("system/shutdown");
                    }
                }
            }
        );
    }

    private executeReboot() {
        BootstrapDialog.confirm({
                title: "WARNING",
                message: "You are about to reboot the Robot.\r\n Please wait few minutes then reconnect to the Robot.",
                type: BootstrapDialog.TYPE_WARNING,
                btnOKLabel: "Yes, reboot!",
                btnOKClass: "btn-warning",
                callback(result) {
                    if (result) {
                        RequestsHelper.Current.put("system/reboot");
                    }
                }
            }
        );
    }

    private executeStop() {
        BootstrapDialog.confirm({
                title: "WARNING",
                message: "You are about to stop the server running on the Robot.\r\n You won't be able to reach it anymore (hard reset required)",
                type: BootstrapDialog.TYPE_DANGER,
                btnOKLabel: "Yes, stop it!",
                btnOKClass: "btn-danger",
                callback(result) {
                    if (result) {
                        RequestsHelper.Current.put("quit");
                    }
                }
            }
        );
    }
}

