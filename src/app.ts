import * as jokebot from './joke/bot_script';

import * as advbot from './adv/bot_script';

import * as searchbot from './search/bot_script';

import { ParseServer } from 'parse-server';

var S3Adapter = require('parse-server').S3Adapter;
import Parse = require('parse/node');
import * as express from 'express';
import * as builder from 'botbuilder';

let api = new ParseServer({
    databaseURI: 'mongodb://localhost:27017/linebotconnector', // Connection string for your MongoDB database
    appId: 'myAppId_linebotconnector',
    masterKey: 'myMasterKeylinebotconnector', // Keep this key secret!
    javascriptKey: 'javascriptKey_bot',

    fileKey: 'optionalFileKey_pet',
    serverURL: 'http://localhost:1337/parse', // Don't forget to change to https if needed
    filesAdapter: new S3Adapter(
    "AKIAIKFEA3AEYFE3INTQ",
    "QcsG57fgyUwR4ztGSi0SkxEbVTtjD+2aY4+WjRMw",
    "jokebot",
    {directAccess: true}
  )

});

var app = express();
console.log("start bot!")
app.use('/parse', api);
app.listen(1337, function () {
    console.log('parse-server-example running on port 1337.');
});

Parse.initialize("myAppId_linebotconnector", "javascriptKey_bot");

//you can use different bot
app.use('/linebot0', jokebot.lineConnector.listen());
app.use('/advbot', advbot.lineConnector.listen());
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
app.listen( port, function () {

    console.log('server is running.' + port);
});
