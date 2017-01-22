// import * as jokebot from './joke/bot_script';
"use strict";
// import * as advbot from './adv/bot_script';
var searchbot = require("./search/bot_script");
var S3Adapter = require('parse-server').S3Adapter;
var express = require("express");
var app = express();
// //you can use different bot
// app.use('/linebot0', jokebot.lineConnector.listen());
// app.use('/advbot', advbot.lineConnector.listen());
app.use('/searchbot', searchbot.lineConnector.listen());
app.get('*', function (req, res) {
    res.send(200, 'Hello Line Bot');
});
var port = normalizePort(process.env.PORT || '9090');
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
app.listen(port, function () {
    console.log('server is running.' + port);
});
