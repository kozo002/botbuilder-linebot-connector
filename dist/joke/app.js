"use strict";
var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen(); //platform -> input from (console ; fb ; line...)
var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        botLocalePath: __dirname + "/locale",
        defaultLocale: "zh"
    }
});
bot.dialog("/", ([function (s) {
        builder.Prompts.text(s, "me");
    },
    function (s, r) {
        s.library.localePath(r.response);
        s.send(r.response);
    }]));
