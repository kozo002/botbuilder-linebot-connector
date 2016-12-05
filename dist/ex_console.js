"use strict";
var botbuilder_1 = require('botbuilder');
var cc = new botbuilder_1.ConsoleConnector();
console.log("__dirname", __dirname);
var bot = new botbuilder_1.UniversalBot(cc.listen(), {
    localizerSettings: {
        botLocalePath: "./" + __dirname + "/locale",
        defaultLocale: "zh-Hans"
    }
});
bot.dialog('/', [
    function (session) {
        session.send("greeting");
    }
]);
