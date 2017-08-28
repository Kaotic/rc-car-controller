"use strict";

var gui = require('nw.gui'),
    natUpnp = require('nat-upnp'),
    net = require('net'),
    fs = require('fs');
var version = "1.0.5";
var lastping;

var natcli = natUpnp.createClient();
var listeners = [];

var $ = function (selector) {
    return document.querySelector(selector);
}

gui.Window.get().show();
//gui.Window.get().showDevTools();

var server = net.createServer(function(sock) {
    sock.setEncoding('utf8');
    listeners.push(sock);
    sock.write("o:c:Vous etes bien connecte sur KaoRC Server v"+version);

    sock.on('data', function(data) {
        var controller = data.split(":");
        var con = controller[0];
        var con1 = controller[1];
        var prefix = "{" + sock.remoteAddress +':'+ sock.remotePort + '} ';
        var hrTime = (new Date).getTime();

        console.log(data);
        if(con == "o"){
            if(con1 == "u"){
                writeLog(prefix + "Car connected !", "data");
            }else if(con1 == "r"){
                writeLog(prefix + "Data received in " + (hrTime - lastping) + "ms !", "data");
            }
        }else if(con == "o"){
            console.log(con1);
        }else{
            //writeLog(prefix + data, "data");
        }


    });

    sock.on('error', function(msg){
        var prefix = "{" + sock.remoteAddress +':'+ sock.remotePort + '} ';
        if(msg.code == "ECONNRESET"){
            writeLog(prefix + "Connexion interrompue avec la voiture !", "error");
        }else{
            console.log(msg);
        }
    });

    sock.on('end', function(){
        var prefix = "{" + sock.remoteAddress +':'+ sock.remotePort + '} ';
        console.log("Connection ended.");
    });

    sock.on('close', function(data) {
        var index = listeners.indexOf(sock);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    });

}).listen(56111, '192.168.1.10');

document.addEventListener('DOMContentLoaded', function() {
    $('#control-up').addEventListener('click', function () {
        if(listeners[0]) {
            listeners[0].write("c:u");
            lastping = (new Date).getTime();
            writeLog("UP", "command");
        }else{
            writeLog("NOT CONNECTED", "error");
        }
    });

    $('#control-down').addEventListener('click', function () {
        if(listeners[0]) {
            listeners[0].write("c:d");
            lastping = (new Date).getTime();
            writeLog("DOWN", "command");
        }else{
            writeLog("NOT CONNECTED", "error");
        }

    });

    $('#control-left').addEventListener('click', function () {
        if(listeners[0]) {
            listeners[0].write("c:l");
            lastping = (new Date).getTime();
            writeLog("LEFT", "command");
        }else{
            writeLog("NOT CONNECTED", "error");
        }

    });

    $('#control-right').addEventListener('click', function () {
        if(listeners[0]) {
            listeners[0].write("c:r");
            lastping = (new Date).getTime();
            writeLog("RIGHT", "command");
        }else{
            writeLog("NOT CONNECTED", "error");
        }

    });

    $('#control-camera').addEventListener('click', function () {
        gui.Window.open("./camera.html",{
            position: 'center',
                width: 670,
                height: 520
        });
    });

    gui.Window.get().focus();
    gui.Window.get().on('close', function() {
        gui.App.quit();
    });
});

natcli.portMapping({
    public: 56111,
    private: 56111,
    ttl: 3600,
    enabled: true
}, function(err) {
    if(err){
        writeLog("Error with open NAT !", "error");
    }else{
        writeLog("Opened NAT with success", "info");
    }
});

//FUNCTIONS

var writeLog = function (msg, type) {
    var logElement = $("#output");
    var levelh = type.replace(/([A-Z])/g, "-$1").toLocaleUpperCase();
    var typed = "[" + levelh + "]";
    logElement.innerHTML += `<span class=${type}>${typed} ${msg}</span><br>`;
    logElement.scrollTop = logElement.scrollHeight;
};

process.on('log', function (message) {
    writeLog(message);
});

// print error message in log window
process.on("uncaughtException", function(exception) {
    var stack = exception.stack.split("\n");
    stack.forEach(function (line) {
        writeLog(line, 'error');
        process.stdout.write(String(line) + "\n");
    });
});