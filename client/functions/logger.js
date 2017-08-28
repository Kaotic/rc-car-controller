var logger = exports;
logger.debugLevel = 'error';
logger.log = function(level, message) {
    var levels = ['error', 'warn', 'info', 'data'];
    var levelh = level.replace(/([A-Z])/g, "-$1").toLocaleUpperCase();

    if (levels.indexOf(level) >= levels.indexOf(logger.debugLevel) ) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        };
        if(level == "data") {
            console.log("[" + levelh + '] ' + message.data);
        }else if(level == "info"){
            console.log("["+levelh .blue +'] '+message.info);
        }else if(level == "warn"){
            console.log("["+levelh+'] '+message.warn);
        }else if(level == "error") {
            console.log("[" + levelh .error+ '] ' + message);
        }
    }
}