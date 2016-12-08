"use strict";
var LineConnector_1 = require('./LineConnector');
var builder = require('botbuilder');
exports.lineConnector = new LineConnector_1.LineConnector({
    channelId: "1490090330",
    channelSecret: "b07f4fdc3a32d56c277b4b4b09d0876c",
    channelAccessToken: "EUupZ8DuplDAVoDH32DCaV+u6TTpq7uwQKTnFnT3zQaxpIUjUJomJ5CtGvJf3Z/pvWtVg+YhftWWQDfXIrSzgNAUuKeflOaezW2XRUgI61HlVrad7OP8TgXFnzFydJ6g8O3BsHmSYYwY7wqbczw57AdB04t89/1O/w1cDnyilFU="
});
exports.bot = new builder.UniversalBot(exports.lineConnector, {
    localizerSettings: {
        botLocalePath: __dirname + "./../locale",
        defaultLocale: "zh_Hans"
    }
});
var getText = function (s, i) { return s.localizer.gettext(s.preferredLocale(), i); };
exports.bot.dialog('/', [
    function (s) {
        if (s.userData.agree) {
            // s.send("me");
            s.beginDialog("/menu");
        }
        else {
            var a = new builder.CardAction().title(getText(s, "agree")).type("message").value(getText(s, "agree"));
            var c = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a]);
            var m = new builder.Message().text("me").addAttachment(c);
            s.send("me");
            s.send("begin");
            builder.Prompts.choice(s, m, getText(s, "agree"));
        }
    },
    function (s) {
        s.userData.agree = true;
        s.beginDialog("/joke");
    }
]);
exports.bot.dialog("/joke", [
    function (s, r) {
        //route /joke
        var s1 = getText(s, "funny");
        var af = new builder.CardAction().title(s1).type("message").value(s1);
        var s2 = getText(s, "lame");
        var al = new builder.CardAction().title(s2).type("message").value(s2);
        var c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "joke")).text(getText(s, "joke")).buttons([af, al]);
        var m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [getText(s, "funny"), getText(s, "lame")]);
    },
    function (s, r) {
        s.endDialog("end");
    }
]);
exports.bot.dialog("/menu", [
    function (s, r) {
        //route /joke
        var s1 = getText(s, "funny");
        var af = new builder.CardAction().title(s1).type("message").value(s1);
        var s2 = getText(s, "lame");
        var al = new builder.CardAction().title(s2).type("message").value(s2);
        var c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "joke")).text(getText(s, "joke")).buttons([af, al]);
        var m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [getText(s, "funny"), getText(s, "lame")]);
    },
    function (s, r) {
        s.endDialog("end");
    }
]);
