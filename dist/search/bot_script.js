"use strict";
var bot_script_1 = require("./../example/bot_script");
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
exports.console_connector = new builder.ConsoleConnector().listen();
exports.bot = new builder.UniversalBot(exports.lineConnector);
var getText = function (s, i) { return s.localizer.gettext(s.preferredLocale(), i); };
exports.bot.dialog('/', [
    function (s) {
        s.beginDialog('/a');
    },
    function (s) {
        s.beginDialog('/b');
    }
]);
exports.bot.dialog('/a', [
    function (s) {
        s.send(new LineConnector_1.StickerMessage(1, 403));
        s.send(new LineConnector_1.ImageMessage("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png")); //https only
        builder.Prompts.choice(s, "number?", ["1", "2"]);
    },
    function (s, r) {
        var o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);
exports.bot.dialog('/b', [
    function (s) {
        var s1 = getText(s, "funny");
        var af = new builder.CardAction().title(s1).type("message").value(s1);
        var s2 = getText(s, "lame");
        var al = new builder.CardAction().title(s2).type("message").value(s2);
        var img = new builder.CardImage().url("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png");
        var c = new builder.HeroCard().images([img]).title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
        var m = new builder.Message().text("is_this_funny").addAttachment(c);
        builder.Prompts.choice(s, m, [s1, s2]);
    },
    function (s, r) {
        s.send(new LineConnector_1.StickerMessage(1, 401));
        s.send(new LineConnector_1.StickerMessage(1, 402));
        var o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);
