var colors = require('colors');
var RaspiCam = require("raspicam");
var inject = require('reconnect-core');
var net = require('net');
var fs = require('fs');
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});
var logger = require('./functions/logger');
var isConnected = false;
var listeners = [];

var camera = new RaspiCam({ mode:"photo", output:"/root/car/videos/image.jpg" });


var reconnect = inject(function () {
    return net.connect.apply(null, arguments);
});

var re = reconnect({
    initialDelay: 100,
    maxDelay: 500,
    strategy: 'fibonacci',      // fibonacci, exponential
    failAfter: Infinity,
    randomisationFactor: 0,
    immediate: false
}, function (stream) {
    //console.log(stream);
    stream.setEncoding('utf8');

    stream.on('data', function (data) {
        var controller = data.split(":");
        var con = controller[0];
        var con1 = controller[1];

        stream.write("o:r");

        if(con == "c"){
            if(con1 == "u"){
                logger.log("info", "COMMANDE UP");
            }else if(con1 == "d"){
                logger.log("info", "COMMANDE DOWN");
            }else if(con1 == "l"){
                logger.log("info", "COMMANDE LEFT");
            }else if(con1 == "r"){
                logger.log("info", "COMMANDE RIGHT");
            }
        }else if(con == "o"){
            if(con1 == "i"){
                logger.log("info", "DEMANDE D'INFO");
                stream.write("INFO");
            }else if(con1 == "c"){
                logger.log("info", controller[2]);
            }
        }
    });
})
    .on('connect', function (con) {
        logger.log("info", "Connecté au serveur de commande !");
        con.write('o:u');
    })
    .on('reconnect', function (n, delay) {
        logger.log("error", "Tentative(s) "+n+" de reconnexion au serveur de commande avec un délais de "+delay+"ms");
    })
    .on('disconnect', function (err) {

    })
    .on('error', function (err) {
        isConnected = false;
        if(err.code == "ECONNREFUSED"){
            logger.log("error", "Impossible de se connecter au serveur de commande !");
        }else if(err.code == "ECONNRESET"){
            logger.log("error", "Connexion au serveur perdu !");
        }else if(err.code == "ETIMEDOUT"){
            logger.log("error", "Le serveur de commande ne répond pas !");
        }else{
            console.log(err);
            //logger.log("error", err);
        }
    }).connect(56111, "localhost");

//camera
var ca = reconnect({
    initialDelay: 100,
    maxDelay: 500,
    strategy: 'fibonacci',      // fibonacci, exponential
    failAfter: Infinity,
    randomisationFactor: 0,
    immediate: false
}, function (stream) {
    //console.log(stream);
    stream.setEncoding('utf8');
    camera.start();

    stream.on('data', function (data) {
        logger.log("info", "Image demandé !");
        /*fs.readFile('/root/car/videos/image.jpg', function(err, data) {
            if(!err){
                stream.write(data);
            }
        });*/
        var img = fs.createReadStream('/root/car/videos/image.jpg');
        img.pipe(stream);
    });
})
    .on('connect', function (con) {
        logger.log("info", "Connecté au serveur camera !");
    })
    .on('reconnect', function (n, delay) {
        logger.log("error", "Tentative(s) "+n+" de reconnexion au serveur camera avec un délais de "+delay+"ms");
    })
    .on('disconnect', function (err) {

    })
    .on('error', function (err) {
        isConnected = false;
        if(err.code == "ECONNREFUSED"){
            logger.log("error", "Impossible de se connecter au serveur camera !");
        }else if(err.code == "ECONNRESET"){
            logger.log("error", "Connexion au serveur camera perdu !");
        }else if(err.code == "ETIMEDOUT"){
            logger.log("error", "Le serveur de camera ne répond pas !");
        }else{
            console.log(err);
            //logger.log("error", err);
        }
    }).connect(56112, "localhost");
