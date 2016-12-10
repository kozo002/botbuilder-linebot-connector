"use strict";
var demobot = require('./bot_script');
var parse_server_1 = require('parse-server');
var S3Adapter = require('parse-server').S3Adapter;
var Parse = require('parse/node');
var express = require('express');
var api = new parse_server_1.ParseServer({
    databaseURI: 'mongodb://localhost:27017/linebotconnector',
    appId: 'myAppId_linebotconnector',
    masterKey: 'myMasterKeylinebotconnector',
    javascriptKey: 'javascriptKey_bot',
    fileKey: 'optionalFileKey_pet',
    serverURL: 'http://localhost:1337/parse',
    filesAdapter: new S3Adapter("AKIAIKFEA3AEYFE3INTQ", "QcsG57fgyUwR4ztGSi0SkxEbVTtjD+2aY4+WjRMw", "jokebot", { directAccess: true })
});
var app = express();
app.use('/parse', api);
app.listen(1337, function () {
    console.log('parse-server-example running on port 1337.');
});
Parse.initialize("myAppId_linebotconnector", "javascriptKey_bot");
//you can use different bot
app.use('/linebot0', demobot.lineConnector.listen());
app.get('*', function (req, res) {
    res.send(200, 'Hello Line Bot');
});
app.listen(process.env.port || 9090, function () {
    console.log('server is running.');
});
