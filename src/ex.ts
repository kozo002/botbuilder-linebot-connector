import * as b0 from './bot_script';

import { ParseServer } from 'parse-server';
import Parse = require('parse/node');
import * as express from 'express';
import * as builder from 'botbuilder';

let api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/linebotconnector', // Connection string for your MongoDB database
    appId: 'myAppId_linebotconnector',
    masterKey: 'myMasterKeylinebotconnector', // Keep this key secret!
    javascriptKey: 'javascriptKey_bot',

    fileKey: 'optionalFileKey_pet',
    serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

var app = express();
app.use('/parse', api);
app.listen(1337, function () {
    console.log('parse-server-example running on port 1337.');
});

Parse.initialize("myAppId_linebotconnector", "javascriptKey_bot");

//you can use different bot
app.use('/linebot0', b0.lineConnector.listen());
app.use('/linebot1', b0.lineConnector.listen());

app.get('*', function (req, res) {
    res.send(200, 'Hello Line Bot');
});
app.listen(process.env.port || 9090, function () {
    console.log('server is running.');
});
