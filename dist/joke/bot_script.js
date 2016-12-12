"use strict";
var Parse = require('parse/node');
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
        defaultLocale: "zh"
    }
});
var JOKE = Parse.Object.extend("JOKE");
var getText = function (s, i) { return s.localizer.gettext(s.preferredLocale(), i); };
exports.bot.dialog('/', [
    function (s) {
        s.send(s.library.localePath());
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
var cJoke;
exports.bot.dialog("/joke", [
    function (s, r) {
        s.userData.count_joke++;
        //query joke
        var q = new Parse.Query(JOKE);
        q.notContainedIn("read", [s.message.address.channelId]).descending("funny").first().then(function (obj, err) {
            console.log("obj", obj);
            if (err) {
                console.log("err", err);
                s.send("err");
                return;
            }
            if (obj === undefined) {
                s.send(new LineConnector_1.StickerMessage(1, 403));
                s.send("no_joke_you_read");
                s.endDialog();
                s.beginDialog("/menu");
            }
            cJoke = obj;
            obj.add("read", s.message.address.channelId);
            obj.save();
            var t = obj.get("type");
            if (t === "text") {
                var text = obj.get("text");
                s.send(text);
            }
            else {
                var f = obj.get("file");
                if (t === "image") {
                    var m_1 = new LineConnector_1.ImageMessage(f.url());
                    s.send(m_1);
                }
                else if (t === "video") {
                    var m_2 = new LineConnector_1.VideoMessage(f.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                    s.send(m_2);
                }
            }
            var s1 = getText(s, "funny");
            var af = new builder.CardAction().title(s1).type("message").value(s1);
            var s2 = getText(s, "lame");
            var al = new builder.CardAction().title(s2).type("message").value(s2);
            var c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
            var m = new builder.Message().text("is_this_funny").addAttachment(c);
            builder.Prompts.choice(s, m, [s1, s2]);
        });
    },
    function (s, r) {
        s.endDialog();
        var sf = getText(s, "funny");
        var sl = getText(s, "lame");
        var e = r.response.entity;
        switch (e) {
            case sf:
                var countf = 0;
                var cf = cJoke.get("funny");
                if (cf) {
                    countf = cf;
                }
                cJoke.set("funny", countf + 1);
                cJoke.save();
                var m = new LineConnector_1.StickerMessage(2, 100);
                s.send(m);
                break;
            case sl:
                var countl = 0;
                var cl = cJoke.get("lame");
                if (cl) {
                    countl = cl;
                }
                cJoke.set("lame", countl + 1);
                cJoke.save();
                var m0 = new LineConnector_1.StickerMessage(1, 113);
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
    }
]);
exports.bot.dialog("/provide", [
    function (s) {
        var st = getText(s, "provide_text");
        var si = getText(s, "provide_image");
        var sv = getText(s, "provide_video");
        var se = getText(s, "provide_end");
        var ap = new builder.CardAction().title(st).type("message").value(st);
        var ai = new builder.CardAction().title(si).type("message").value(si);
        var av = new builder.CardAction().title(sv).type("message").value(sv);
        var ae = new builder.CardAction().title(se).type("message").value(se);
        var pi = getText(s, "provide_intro");
        var c = new builder.HeroCard().title(pi).subtitle(pi).text(pi).buttons([ap, ai, av, ae]);
        var m = new builder.Message().text(pi).addAttachment(c);
        builder.Prompts.choice(s, m, [st, si, sv, se]);
    },
    function (s, r) {
        s.endDialog();
        var st = getText(s, "provide_text");
        var si = getText(s, "provide_image");
        var sv = getText(s, "provide_video");
        var se = getText(s, "provide_end");
        var e = r.response.entity;
        switch (e) {
            case st:
                s.beginDialog("/provide_text");
                break;
            case si:
                s.beginDialog("/provide_image");
                break;
            case sv:
                s.send(new LineConnector_1.StickerMessage(1, 4));
                s.beginDialog("/provide_video");
                break;
            case se:
                s.send(new LineConnector_1.StickerMessage(1, 4));
                s.beginDialog("/");
        }
        //1.get data;
        //2.query video/image/audio id then save stroage or old file
        //3.get url from my stroage
        // s.send(new StickerMessage(1, 2))
    }
]);
exports.bot.dialog("/provide_text", [
    function (s) {
        builder.Prompts.text(s, "pls_provide");
    },
    function (s, r) {
        console.log("provide", r);
        var text = r.response;
        s.send(text);
        var m0 = new LineConnector_1.StickerMessage(1, 2);
        s.send("thx_you_provide");
        s.endDialog();
        var j = new JOKE();
        j.set("type", "text");
        j.set("text", text);
        j.save();
        s.beginDialog("/menu");
    }
]);
exports.bot.dialog("/provide_image", [
    function (s) {
        // console.log(s);
        builder.Prompts.attachment(s, "pls_provide");
        builder.Prompts.text(s, "do_not");
    },
    function (s, r) {
        s.send(new LineConnector_1.StickerMessage(1, 2));
        s.endDialog();
        var id = r.response[0].id;
        saveJokeFile("image", id, s);
    }
]);
exports.bot.dialog("/provide_video", [
    function (s) {
        builder.Prompts.attachment(s, "pls_provide");
        builder.Prompts.text(s, "do_not");
    },
    function (s, r) {
        s.send(new LineConnector_1.StickerMessage(1, 2));
        s.endDialog();
        var id = r.response[0].id;
        saveJokeFile("video", id, s);
    }
]);
var saveJokeFile = function (type, id, s) {
    exports.lineConnector.getMessageContent(id).then(function (data, err) {
        if (data) {
            var d1 = Array.prototype.slice.call(new Buffer(data), 0);
            var subname = ".png";
            if (type === "video") {
                subname = ".mp4";
            }
            var parseFile_1 = new Parse.File("data" + subname, d1);
            parseFile_1.save().then(function () {
                var j = new JOKE();
                j.set("type", type);
                j.set("file", parseFile_1);
                j.save();
                s.beginDialog("/menu");
            });
        }
    });
};
exports.bot.dialog("/contact", [
    function (s) {
        s.endDialog("contact_context");
    },
]);
