# botbuilder-linebot-connector

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![NPM Dependencies][dependencies-image]][dependencies-url]
  [![Build][travis-image]][travis-url]

LINE Messaging API for Node.js

# About LINE Messaging API

Please refer to the official API documents for details.
- Developer Documents - https://developers.line.me/messaging-api/overview
- API Reference - https://devdocs.line.me/en/#messaging-api

# Installation

```bash
$ npm install botbuilder-linebot-connector --save
```


#usage

```bash
import { ParseServer } from 'parse-server';
import Parse = require('parse/node');
import * as express from 'express';
import * as builder from 'botbuilder';
var LineConnector = require( "botbuilder-linebot-connector");

var lineConnector = new LineConnector.LineConnector({
    channelId: "1489577XXX",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165aXXX",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilXXX"
});
var bot = new builder.UniversalBot(lineConnector);

bot.dialog('/', [
    function (session) {
        // Prompt the user to select their preferred locale
        session.send("hello world");
    }   
]);

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
app.use('/linebot', lineConnector.listen());

app.get('*', function (req, res) {
    res.send(200, 'Hello Tarot Bot');
});
app.listen(process.env.port || 9090, function () {
    console.log('server is running.');
});
```

command line:
ngrok http 9090

line console
https://xxx.xxx.xxx/

done