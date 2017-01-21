import * as jokebot from './joke/bot_script';

import * as advbot from './adv/bot_script';

import * as searchbot from './search/bot_script';


var S3Adapter = require('parse-server').S3Adapter;

import * as express from 'express';
import * as builder from 'botbuilder';


var app = express();

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
