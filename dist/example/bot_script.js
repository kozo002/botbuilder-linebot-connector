"use strict";
var LineConnector_1 = require('./../LineConnector');
var builder = require('botbuilder');
exports.lineConnector = new LineConnector_1.LineConnector({
    channelId: "1490090330",
    channelSecret: "b07f4fdc3a32d56c277b4b4b09d0876c",
    channelAccessToken: "EUupZ8DuplDAVoDH32DCaV+u6TTpq7uwQKTnFnT3zQaxpIUjUJomJ5CtGvJf3Z/pvWtVg+YhftWWQDfXIrSzgNAUuKeflOaezW2XRUgI61HlVrad7OP8TgXFnzFydJ6g8O3BsHmSYYwY7wqbczw57AdB04t89/1O/w1cDnyilFU="
});
exports.bot = new builder.UniversalBot(exports.lineConnector, {
    localizerSettings: {
        botLocalePath: __dirname + "./../../locale",
        defaultLocale: "zh_Hans"
    }
});
var getText = function (s, i) { return s.localizer.gettext(s.preferredLocale(), i); };
exports.bot.dialog('/', [
    function (s) {
        s.send("hello");
        var a = new builder.CardAction().title(getText(s, "agree")).type("message").value(getText(s, "agree"));
        var c0 = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a]);
        var m0 = new builder.Message().text("me").addAttachment(c0);
        s.send(m0);
        var c1 = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a, a]);
        var m1 = new builder.Message().text("me").addAttachment(c1);
        s.send(m1);
        var m2 = new builder.Message().text("me").addAttachment(c0).addAttachment(c1);
        builder.Prompts.choice(s, m2, [getText(s, "agree")]);
    }
]);
