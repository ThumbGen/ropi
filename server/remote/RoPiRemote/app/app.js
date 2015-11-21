var connected = false;
var socket = null;
var robotIp = "raspberrypi";
var baseServerUrl = "";

$(document).ready(function () {

    var updateConnectionStatus = function (isConnected, msg) {
        if (msg != null) {
            console.log(msg);
        }
        var label = "offline";
        var labelClass = "label label-default";
        if (isConnected) {
            label = "online";
            labelClass = "label label-success";
        }
        $("#connectedLabel").attr("class", labelClass);
        $("#connectedLabel").text(label);
    }

    var connect = function () {

        parking.init();

        $("#camera").attr("src", "http://" + robotIp + ":8080/stream/video.mjpeg");
        $("#camera").show();

        //todo save the robotIp to cookies

        socket = io.connect("http://" + robotIp + ":80/", { 'forceNew': true });
        socket.on("connected", function (msg) {
            updateConnectionStatus(true, msg);
        });
        socket.on("disconnected", function (msg) {
            updateConnectionStatus(false, msg);
        });
        socket.on("parking", function (msg) {
            parking.update(msg);
        });

        socket.emit('connect');

        baseServerUrl = "http://" + robotIp + ":80/ropi/api/v1.0/";
    }

    var disconnect = function () {
        if (socket !== null) {
            socket.disconnect();
        }

        parking.hide();
        
        $("#camera").attr("src", "");
        $("#camera").hide();
    }

    var processConnectDisconnect = function() {
        if (connected) {
            disconnect();
            $("#connectButton").html("Connect");
        } else {
            connect();
            $("#connectButton").html("Disconnect");
        }
        connected = !connected;
        updateConnectionStatus(connected, null);
    }

    $("#connectButton").click(function() {
        processConnectDisconnect();
    });

    //TODO load it from cookies
    $("#robotIP").val(robotIp);

    joysticks.init();
    
})