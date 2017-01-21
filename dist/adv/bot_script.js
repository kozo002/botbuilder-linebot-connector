"use strict";
var Parse = require("parse/node");
var LineConnector_1 = require("./../LineConnector");
var builder = require("botbuilder");
//adv
exports.lineConnector = new LineConnector_1.LineConnector({
    channelId: "1489577982",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165a18c",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilFU="
});
//mr.q
// export var lineConnector = new LineConnector({
//     channelId: "1487296483",
//     channelSecret: "40e21b20df162705bcccc3066fde13ee",
//     channelAccessToken: "dVxAd9kcq59UXD8ANh503yB+14sWaWOH6DMLjMa8OPCpwdaeeXFHvzlQ1VH3OC/hm62Kz0w8VgcpOZdWuSGK3bD/Q1zsKXs1WIrkK9o6yACkKUASTy6fu0T6ulRSAOoamCzGDwKHAPH5aM0ohx4f4QdB04t89/1O/w1cDnyilFU="
// });
exports.bot = new builder.UniversalBot(exports.lineConnector, {
    localizerSettings: {
        botLocalePath: __dirname + "/locale",
        defaultLocale: "zh"
    }
});
var ADV = Parse.Object.extend("ADV");
var getText = function (s, i) { return s.localizer.gettext(s.preferredLocale(), i); };
//1. 介紹＆使用方式
//2. 廣告型式
//2. 堅聽吐廣告 loop
//3. 歡迎加至各群組
exports.bot.dialog('/', [
    function (s) {
        if (!s.userData.init) {
            s.send("introduce");
            s.send("url");
            s.userData.init = true;
            s.endDialog();
            if (s.message.address.from.name === "user") {
                s.beginDialog('/set_adv');
            }
            else {
                s.send("introduce");
                s.send("how_to_use");
                s.beginDialog('/in_room');
            }
        }
        else {
            if (s.message.address.from.name === "user") {
                s.beginDialog('/set_adv');
            }
            else {
                s.beginDialog('/in_room');
            }
        }
    }
]);
exports.bot.dialog('/set_adv', [
    function (s) {
        var q = new Parse.Query(ADV);
        q.equalTo("owner", s.message.address.channelId);
        q.first().then(function (obj) {
            if (obj !== undefined) {
                s.conversationData.adv = obj;
                var t = obj.get("type");
                var f = obj.get("file");
                if (t === "text") {
                    s.send(obj.get("text"));
                }
                else if (t === "image") {
                    var m_1 = new LineConnector_1.ImageMessage(f.url());
                    s.send(m_1);
                }
                else if (t === "video") {
                    var m_2 = new LineConnector_1.VideoMessage(f.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                    s.send(m_2);
                }
                s.send("your_current_adv");
            }
            else {
                s.send("set_your_adv");
            }
            var s0 = getText(s, "text");
            var s1 = getText(s, "attachment");
            var s2 = getText(s, "no_option");
            var st = getText(s, "pls_choice");
            var m = new LineConnector_1.BasicConfirmMessage(st, s0, s1, s2);
            builder.Prompts.choice(s, m, [s0, s1, s2]);
        });
    },
    function (s, r) {
        var s0 = getText(s, "text");
        var s1 = getText(s, "attachment");
        var s2 = getText(s, "no_option");
        var o = r.response.entity;
        if (o === s0) {
            s.dialogData.type = "text";
            builder.Prompts.text(s, "send_me_the_content");
        }
        else if (o === s1) {
            s.dialogData.type = "other";
            builder.Prompts.attachment(s, "send_me_the_content");
        }
        else {
            s.send("url");
            s.endDialog("end");
            s.beginDialog("/");
        }
    },
    function (s, r) {
        // console.log(s.conversationData.adv);
        var adv = new ADV();
        if (s.conversationData.adv) {
            adv = new ADV(s.conversationData.adv);
        }
        if (typeof (r.response) === "string") {
            adv.set("type", "text");
            var text = r.response;
            adv.set("text", text);
            adv.save();
            s.userData.isSetAdv = true;
            s.endDialog("end");
            s.beginDialog("/set_line_id", adv);
        }
        else {
            var type_1 = r.response[0].type;
            var mid = r.response[0].id;
            //save adv
            var c = exports.lineConnector.getMessageContent(mid);
            c.then(function (data, err) {
                var subname = ".png";
                if (type_1 === "video") {
                    subname = ".mp4";
                }
                var d1 = Array.prototype.slice.call(new Buffer(data), 0);
                // console.log(data,d1);
                var parseFile = new Parse.File("data" + subname, d1);
                parseFile.save().then(function () {
                    adv.set("owner", s.message.address.channelId);
                    adv.set("type", type_1);
                    adv.set("file", parseFile);
                    adv.save();
                    s.userData.isSetAdv = true;
                    s.endDialog("end");
                    s.beginDialog("/set_line_id", adv);
                });
            });
        }
    }
]);
exports.bot.dialog("/set_line_id", [function (s, args) {
        var adv = args;
        s.dialogData.adv = adv;
        exports.lineConnector.getUserProfile(s.message.address.from.id).then(function (data, err) {
            adv.set("displayName", data.displayName);
            adv.set("userId", data.userId);
            adv.set("pictureUrl", data.pictureUrl);
            adv.save();
            s.send(data.displayName);
            builder.Prompts.text(s, "pls_set_user_id", adv);
        });
    }, function (s, r) {
        // console.log("r",r);
        s.userData.lineId = r.response;
        var n = r.response + getText(s, "is_your_line_id");
        var s0 = getText(s, "yes");
        var s1 = getText(s, "no");
        var m = new LineConnector_1.BasicConfirmMessage(n, s0, s1);
        builder.Prompts.choice(s, m, [s0, s1]);
    }, function (s, r) {
        var s0 = getText(s, "yes");
        if (r.response.entity === s0) {
            // s.userData.isSetLindID = true;
            // console.log(s.dialogData.adv)
            // let adv =s.dialogData.adv;
            var q = new Parse.Query(ADV);
            q.get(s.dialogData.adv.objectId).then(function (adv) {
                // console.log(adv);
                adv.set("lineId", s.userData.lineId);
                adv.save();
                s.endDialog("end");
                s.beginDialog("/");
            });
        }
        else {
            s.replaceDialog("/set_line_id");
        }
    }
]);
exports.bot.dialog('/in_room', [function (s) {
        var f = function (obj) {
            // console.log(obj)
            if (obj !== undefined) {
                var displayName = obj.get("displayName");
                var lineId = obj.get("lineId");
                if (lineId) {
                    var sp = getText(s, "provide_by");
                    var text = sp + " https://line.me/R/ti/p/~" + lineId;
                    var m = new LineConnector_1.ConfirmMessage({ title: sp, subtitle: sp, text: text }, { title: displayName, type: "uri", value: "https://line.me/R/ti/p/~" + lineId });
                    s.send(m);
                }
                var t = obj.get("type");
                var f_1 = obj.get("file");
                if (t === "text") {
                    s.send(obj.get("text"));
                }
                else if (t === "image") {
                    var m = new LineConnector_1.ImageMessage(f_1.url());
                    s.send(m);
                }
                else if (t === "video") {
                    var m = new LineConnector_1.VideoMessage(f_1.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                    s.send(m);
                }
                if (s.userData.findPram === "contained") {
                    obj.remove("read", s.message.address.channelId);
                }
                else {
                    obj.add("read", s.message.address.channelId);
                }
                obj.save();
            }
            else {
                if (s.userData.findPram) {
                    if (s.userData.findPram === "contained") {
                        s.userData.findPram = "notContained";
                    }
                    else {
                        s.userData.findPram = "contained";
                    }
                }
                else {
                    s.userData.findPram = "contained";
                }
                s.send("no_adv");
            }
        };
        var q = new Parse.Query(ADV);
        // console.log(s.userData.findPram)
        if (s.userData.findPram) {
            if (s.userData.findPram === "notContained") {
                q.notContainedIn("read", [s.message.address.channelId]).first().then(f);
            }
            else {
                q.containedIn("read", [s.message.address.channelId]).first().then(f);
            }
        }
        else {
            s.userData.findPram = "notContained";
            q.notContainedIn("read", [s.message.address.channelId]).first().then(f);
        }
    }]);
