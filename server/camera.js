"use strict";

var gui = require('nw.gui'),
    natUpnp = require('nat-upnp'),
    net = require('net'),
    fs = require('fs');

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

    sock.on('data', function(data) {
        console.log("IMAGE RECEIVED");
        document.getElementById('frame').src = data;
    });

    sock.on('error', function(msg){
        var prefix = "{" + sock.remoteAddress +':'+ sock.remotePort + '} ';
        if(msg.code == "ECONNRESET"){
            console.log(prefix + "Connexion interrompue avec la voiture !");
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

}).listen(56112, '192.168.1.10');

document.addEventListener('DOMContentLoaded', function() {
    $('#get-image').addEventListener('click', function () {
        if(listeners[0]) {
            listeners[0].write("get");
            console.log("GET IMAGE");
        }else{
            console.log("NOT CONNECTED");
        }
    });

    gui.Window.get().focus();
    gui.Window.get().on('close', function() {
        gui.App.quit();
    });
});

natcli.portMapping({
    public: 56112,
    private: 56112,
    ttl: 3600,
    enabled: true
}, function(err) {
    if(err){
        console.log("Error with open NAT !");
    }else{
        console.log("Opened NAT with success");
    }
});