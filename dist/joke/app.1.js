"use strict";
var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen(); //platform -> input from (console ; fb ; line...)
var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        botLocalePath: __dirname + "./../../locale",
        defaultLocale: "zh_Hans"
    }
});
bot.dialog("/", ([function (s) {
        console.log(s.library.localePath());
        builder.Prompts.text(s, "me");
    },
    function (s, r) {
        console.log(r.response);
        // 
        s.library.localePath(r.response);
        s.send(r.response);
    }]));
