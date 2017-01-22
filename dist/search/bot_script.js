"use strict";
var redis = require("redis"), client = redis.createClient();
var LineConnector_1 = require("./../LineConnector");
var builder = require("botbuilder");
exports.lineConnector = new LineConnector_1.LineConnector({
    channelId: "1487296483",
    channelSecret: "40e21b20df162705bcccc3066fde13ee",
    channelAccessToken: "dVxAd9kcq59UXD8ANh503yB+14sWaWOH6DMLjMa8OPCpwdaeeXFHvzlQ1VH3OC/hm62Kz0w8VgcpOZdWuSGK3bD/Q1zsKXs1WIrkK9o6yACkKUASTy6fu0T6ulRSAOoamCzGDwKHAPH5aM0ohx4f4QdB04t89/1O/w1cDnyilFU="
}, function (context, data, callback) {
    var cid = context.address.channelId;
    client.set(cid, JSON.stringify(data));
    callback(null);
}, function (context, callback) {
    var cid = context.address.channelId;
    client.get(cid, function (err, data) {
        callback(null, JSON.parse(data));
    });
});
exports.bot = new builder.UniversalBot(exports.lineConnector);
var google = require('google');
google.resultsPerPage = 1;
var nextCounter = 0;
exports.bot.dialog('/', [
    function (s) {
        // s.beginDialog('/a');
        builder.Prompts.choice(s, "number?", ["1", "2"]);
    },
    function (s, r) {
        s.send("ok");
        var o = r.response;
        console.log(o);
        s.endDialog(o);
    }
]);
