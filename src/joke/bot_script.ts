import Parse = require('parse/node');

import { LineConnector, StickerMessage, ImageMessage, VideoMessage } from './../LineConnector';

import * as builder from 'botbuilder';
import { Message, CardImage, UniversalBot, HeroCard, CardAction, Prompts, ConsoleConnector } from 'botbuilder';

export var lineConnector = new LineConnector({
    channelId: "1490090330",
    channelSecret: "b07f4fdc3a32d56c277b4b4b09d0876c",
    channelAccessToken: "EUupZ8DuplDAVoDH32DCaV+u6TTpq7uwQKTnFnT3zQaxpIUjUJomJ5CtGvJf3Z/pvWtVg+YhftWWQDfXIrSzgNAUuKeflOaezW2XRUgI61HlVrad7OP8TgXFnzFydJ6g8O3BsHmSYYwY7wqbczw57AdB04t89/1O/w1cDnyilFU="
});
export var bot = new builder.UniversalBot(lineConnector,
    {
        localizerSettings: {
            botLocalePath: __dirname + "/locale",
            defaultLocale: "zh_Hans"
        }
    }
);
var JOKE = Parse.Object.extend("JOKE");
let getText = (s, i) => { return s.localizer.gettext(s.preferredLocale(), i) };
bot.dialog('/', [
    function (s) {
        if (s.userData.agree) {
            // s.send("me");
            s.beginDialog("/menu");
        } else {
            s.userData.count_joke = 0;
            let a = new builder.CardAction().title(getText(s, "agree")).type("message").value(getText(s, "agree"));
            let c = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a]);
            let m = new builder.Message().text("me").addAttachment(c);
            s.send("me");
            s.send("begin");
            builder.Prompts.choice(s, m, getText(s, "agree"))
        }
    },
    (s) => {
        s.userData.agree = true;
        s.beginDialog("/joke");
    }
]);

var cJoke: Parse.Object;
bot.dialog("/joke", [
    function (s, r) {
        s.userData.count_joke++;
        //query joke
        let q = new Parse.Query(JOKE);
        q.notContainedIn("read", [s.message.address.channelId]).descending("funny").first().then((obj: Parse.Object, err) => {
            console.log("obj", obj)
            if (err) {
                console.log("err", err);
                s.send("err")
                return;
            }
            if (obj === undefined) {
                   s.send(new StickerMessage(1, 403));
             
                s.send("no_joke_you_read");
                s.endDialog();
                s.beginDialog("/menu");
            }
            cJoke = obj;
            obj.add("read", s.message.address.channelId)
            obj.save();
            let t = obj.get("type");
            if (t === "text") {
                let text = obj.get("text");
                s.send(text);
            } else {
                let f: Parse.File = obj.get("file");
                if (t === "image") {
                    let m = new ImageMessage(f.url())

                    s.send(m);
                } else if (t === "video") {
                    let m = new VideoMessage(f.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                    s.send(m);
                }
            }
            let s1 = getText(s, "funny");
            let af = new builder.CardAction().title(s1).type("message").value(s1);
            let s2 = getText(s, "lame");
            let al = new builder.CardAction().title(s2).type("message").value(s2);
            let c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
            let m = new builder.Message().text("is_this_funny").addAttachment(c);
            builder.Prompts.choice(s, m, [s1, s2])
        })
    },
    (s, r) => {
        s.endDialog();
        let sf = getText(s, "funny");
        let sl = getText(s, "lame");
        let e = r.response.entity;
        switch (e) {
            case sf:
                let countf = 0;
                let cf: number = cJoke.get("funny");
                if (cf) {
                    countf = cf;
                }
                cJoke.set("funny", countf + 1);
                cJoke.save();

                let m = new StickerMessage(2, 100);
                s.send(m);
                break;
            case sl:
                let countl = 0;
                let cl: number = cJoke.get("lame");
                if (cl) {
                    countl = cl;
                }
                cJoke.set("lame", countl + 1);
                cJoke.save();

                let m0 = new StickerMessage(1, 113);
                s.send(m0);
                break;
        }
        if (s.userData.count_joke > 0) {
            s.beginDialog("/menu");
            s.userData.count_joke = 0;
        } else {
            s.beginDialog("/joke")
        }


    }
])
bot.dialog("/menu", [

    function (s, r) {
        //route /joke
        let t_sm = getText(s, "me");
        let t_sb = getText(s, "begin");

        let sp = getText(s, "provide");
        let sc = getText(s, "contact");
        let smore = getText(s, "more");
        let ap = new builder.CardAction().title(sp).type("message").value(sp);
        let ac = new builder.CardAction().title(sc).type("message").value(sc);
        let amore = new builder.CardAction().title(smore).type("message").value(smore);

        let c = new builder.HeroCard().title(t_sm).subtitle(t_sb).text(t_sm + t_sb).buttons([ap, ac, amore]);
        let m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [sp, sc, smore])
    },
    (s, r) => {
        let sp = getText(s, "provide");
        let sc = getText(s, "contact");
        let smore = getText(s, "more");

        let e = r.response.entity;

        switch (e) {
            case sp:
                s.beginDialog("/provide")
                break;
            case sc:
                s.beginDialog("/contact")
                break;
            case smore:
                s.beginDialog("/joke")
                break;
        }
    }
])
bot.dialog("/provide", [
    (s) => {
        let st = getText(s, "provide_text");
        let si = getText(s, "provide_image");
        let sv = getText(s, "provide_video");
        let se = getText(s, "provide_end");

        let ap = new builder.CardAction().title(st).type("message").value(st);
        let ai = new builder.CardAction().title(si).type("message").value(si);
        let av = new builder.CardAction().title(sv).type("message").value(sv);
        let ae = new builder.CardAction().title(se).type("message").value(se);

        let pi = getText(s, "provide_intro");
        let c = new builder.HeroCard().title(pi).subtitle(pi).text(pi).buttons([ap, ai, av, ae]);
        let m = new builder.Message().text(pi).addAttachment(c);
        builder.Prompts.choice(s, m, [st, si, sv, se]);
    },
    (s, r) => {
        s.endDialog();
        let st = getText(s, "provide_text");
        let si = getText(s, "provide_image");
        let sv = getText(s, "provide_video");
        let se = getText(s, "provide_end");

        let e = r.response.entity;
        switch (e) {
            case st:
                
                s.beginDialog("/provide_text");

                break;
            case si:
                
                s.beginDialog("/provide_image");

                break;
            case sv:
            s.send(new StickerMessage(1, 4));
                
                s.beginDialog("/provide_video");

                break;
            case se:
                
                s.send(new StickerMessage(1, 4));
                s.beginDialog("/");
        }

        //1.get data;
        //2.query video/image/audio id then save stroage or old file
        //3.get url from my stroage
        // s.send(new StickerMessage(1, 2))
    }
])

bot.dialog("/provide_text", [
    (s) => {
        builder.Prompts.text(s, "pls_provide");
    },
    (s, r) => {
        console.log("provide", r);
        let text: string = r.response;
        s.send(text);
        let m0 = new StickerMessage(1, 2);

        s.send("thx_you_provide");
        s.endDialog();

        let j = new JOKE();
        j.set("type", "text");

        j.set("text", text);
        j.save();

        s.beginDialog("/menu");

    }
])

bot.dialog("/provide_image", [
    (s) => {
        // console.log(s);
        builder.Prompts.attachment(s, "pls_provide");
        builder.Prompts.text(s, "do_not");
    },
    (s, r) => {
        s.send(new StickerMessage(1, 2));
        s.endDialog();
        let id = r.response[0].id;
        saveJokeFile("image", id, s)
    }
])

bot.dialog("/provide_video", [
    (s) => {
        builder.Prompts.attachment(s, "pls_provide");
        builder.Prompts.text(s, "do_not");
    },
    (s, r) => {
        s.send(new StickerMessage(1, 2));
        s.endDialog();
        let id = r.response[0].id;
        saveJokeFile("video", id, s)
    }
])


var saveJokeFile = (type, id, s) => {
    lineConnector.getMessageContent(id).then(
        (data, err) => {
            if (data) {
                let d1 = Array.prototype.slice.call(new Buffer(data), 0)
                let subname = ".png";
                if (type === "video") {
                    subname = ".mp4";
                }
                let parseFile = new Parse.File("data" + subname, d1);
                parseFile.save().then(() => {
                    let j = new JOKE();
                    j.set("type", type)
                    j.set("file", parseFile)
                    j.save();
                    s.beginDialog("/menu");
                });
            }

        }
    );

}


bot.dialog("/contact", [
    (s) => {
        s.endDialog("contact_context")
    },
])

