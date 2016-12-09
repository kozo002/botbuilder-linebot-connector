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
        botLocalePath: __dirname + "/locale",
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
            s.userData.count_joke = 0;
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
        s.userData.count_joke++;
        s.send("funny_joke");
        var s1 = getText(s, "funny");
        var af = new builder.CardAction().title(s1).type("message").value(s1);
        var s2 = getText(s, "lame");
        var al = new builder.CardAction().title(s2).type("message").value(s2);
        var c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
        var m = new builder.Message().text("is_this_funny").addAttachment(c);
        builder.Prompts.choice(s, m, [s1, s2]);
    },
    function (s, r) {
        s.endDialog();
        var sf = getText(s, "funny");
        var sl = getText(s, "lame");
        var e = r.response.entity;
        switch (e) {
            case sf:
                var m = new LineConnector_1.StickerMessage(2, 18);
                s.send(m);
                break;
            case sl:
                var m0 = new LineConnector_1.StickerMessage(1, 102);
                s.send(m0);
                break;
        }
        if (s.userData.count_joke > 0) {
            s.beginDialog("/menu");
            s.userData.count_joke = 0;
        }
        else {
            s.beginDialog("/joke");
        }
    }
]);
exports.bot.dialog("/menu", [
    function (s, r) {
        //route /joke
        var t_sm = getText(s, "me");
        var t_sb = getText(s, "begin");
        var sp = getText(s, "provide");
        var sc = getText(s, "contact");
        var smore = getText(s, "more");
        var ap = new builder.CardAction().title(sp).type("message").value(sp);
        var ac = new builder.CardAction().title(sc).type("message").value(sc);
        var amore = new builder.CardAction().title(smore).type("message").value(smore);
        var c = new builder.HeroCard().title(t_sm).subtitle(t_sb).text(t_sm + t_sb).buttons([ap, ac, amore]);
        var m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [sp, sc, smore]);
    },
    function (s, r) {
        var sp = getText(s, "provide");
        var sc = getText(s, "contact");
        var smore = getText(s, "more");
        var e = r.response.entity;
        switch (e) {
            case sp:
                s.beginDialog("/provide");
                break;
            case sc:
                s.beginDialog("/contact");
                break;
            case smore:
                s.beginDialog("/joke");
                break;
        }
        // s.endDialog("end menu");
    }
]);
exports.bot.dialog("/provide", [
    function (s) {
        var st = getText(s, "provide_text");
        var so = getText(s, "provide_other");
        var ap = new builder.CardAction().title(st).type("message").value(st);
        var ac = new builder.CardAction().title(so).type("message").value(so);
        var pi = getText(s, "provide_intro");
        var c = new builder.HeroCard().title(pi).subtitle(pi).text(pi).buttons([ap, ac]);
        var m = new builder.Message().text(pi).addAttachment(c);
        builder.Prompts.choice(s, m, [st, so]);
    },
    function (s, r) {
        s.endDialog();
        var st = getText(s, "provide_text");
        var so = getText(s, "provide_other");
        var e = r.response.entity;
        switch (e) {
            case st:
                s.beginDialog("/provide_text");
                break;
            case so:
                s.beginDialog("/provide_other");
                break;
        }
        //1.get data;
        //2.query video/image/audio id then save stroage or old file
        //3.get url from my stroage
        // s.send(new StickerMessage(1, 2))
    }
]);
exports.bot.dialog("/provide_text", [
    function (s) {
        builder.Prompts.text(s, "provide_text");
    },
    function (s, r) {
        console.log("provide", r);
        var text = r.response;
        s.send(text);
        s.send("thx_you_provide");
        s.endDialog();
        s.beginDialog("/menu");
    }
]);
exports.bot.dialog("/provide_other", [
    function (s) {
        builder.Prompts.attachment(s, "provide_other");
    },
    function (s, r) {
        s.send(new LineConnector_1.StickerMessage(1, 2));
        s.endDialog();
        s.beginDialog("/menu");
    }
]);
exports.bot.dialog("/contact", [
    function (s) {
        s.endDialog("contact_context");
    },
]);
