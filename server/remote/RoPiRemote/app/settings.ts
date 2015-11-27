var robotIP = null;

var executeAction = action => {
    $.ajax({
        url: settings.getBaseAPIUrl() + action,
        type: "PUT",
        success(result) {
            console.log(action);
        }
    });
}

var executeShutdown = () => {
    BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to shutdown the Robot.\r\n You won't be able to reach it anymore (power on required)",
            type: BootstrapDialog.TYPE_DANGER,
            btnOKLabel: "Yes, shutdown!",
            btnOKClass: "btn-danger",
            callback(result) {
                if (result) {
                    executeAction("system/shutdown");
                }
            }
        }
    );
}

var executeReboot = () => {
    BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to reboot the Robot.\r\n Please wait few minutes then reconnect to the Robot.",
            type: BootstrapDialog.TYPE_WARNING,
            btnOKLabel: "Yes, reboot!",
            btnOKClass: "btn-warning",
            callback(result) {
                if (result) {
                    executeAction("system/reboot");
                }
            }
        }
    );
}

var executeStop = () => {
    BootstrapDialog.confirm({
            title: "WARNING",
            message: "You are about to stop the server running on the Robot.\r\n You won't be able to reach it anymore (hard reset required)",
            type: BootstrapDialog.TYPE_DANGER,
            btnOKLabel: "Yes, stop it!",
            btnOKClass: "btn-danger",
            callback(result) {
                if (result) {
                    executeAction("quit");
                }
            }
        }
    );
}

var settings = {
    show() {

        BootstrapDialog.show({
            title: "Settings",
            message: $("<div></div>").load("settings.html"),
            closable: true,
            closeByBackdrop: true,
            closeByKeyboard: true,
            data: {},
            onshow(dialogRef) {

            },
            onshown(dialogRef) {
                //update ui
                $("#robotIP").val(settings.getRobotIp());
                $("#shutdownButton").click(executeShutdown);
                $("#rebootButton").click(executeReboot);
                $("#stopButton").click(executeStop);
            },
            buttons: [
                {
                    label: "Close",
                    action(dialogItself) {
                        dialogItself.close();
                    }
                }
            ],
            onhide(dialogRef) {
                robotIP = $("#robotIP").val();
                settings.storeRobotIp();
            }
        });
    },
    getRobotIp() {
        if (robotIP == null || robotIP === "" || robotIP === "undefined") {
            robotIP = Cookies.get(robotIpCookieName);
            if (robotIP == null || robotIP === "" || robotIP === "undefined") {
                robotIP = window.location.hostname;
            }
            if (robotIP == null || robotIP === "" || robotIP === "undefined") {
                robotIP = "raspberrypi";
            }
        }
        return robotIP;
    },
    storeRobotIp() {
        Cookies.set(robotIpCookieName, robotIP);
    },
    getBaseServerUrl() {
        return `http://${settings.getRobotIp()}`;
    },
    getBaseAPIUrl() {
        return `http://${settings.getRobotIp()}:80/ropi/api/v1.0/`;
    }
};