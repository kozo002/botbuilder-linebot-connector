
import { LineConnector, StickerMessage } from './../LineConnector';

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
            botLocalePath: __dirname + "./../../locale",
            defaultLocale: "zh_Hans"
        }
    }
);


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
bot.dialog("/joke", [

    function (s, r) {
        //route /joke
        s.userData.count_joke ++;
        s.send("funny_joke")

        let s1 = getText(s, "funny");
        let af = new builder.CardAction().title(s1).type("message").value(s1);
        let s2 = getText(s, "lame");
        let al = new builder.CardAction().title(s2).type("message").value(s2);
        let c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
        let m = new builder.Message().text("is_this_funny").addAttachment(c);
        builder.Prompts.choice(s, m, [s1, s2])
    },
    (s, r) => {
        s.endDialog();
        let sf = getText(s, "funny");
        let sl = getText(s, "lame");
        let e = r.response.entity;

        switch (e) {
            case sf:
                let m = new StickerMessage(2, 18);
                s.send(m)
                break;
            case sl:
                let m0 = new StickerMessage(1, 102);
                s.send(m0)
                break;
        }
        if(s.userData.count_joke>0){
            s.beginDialog("/menu");
            s.userData.count_joke = 0;
        }else{
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

        // s.endDialog("end menu");
    }
])

bot.dialog("/provide", [
    (s) => {
        let pi = getText(s, "provide_intro");
        // s.send(pi);
        builder.Prompts.attachment(s,pi);
    },
    (s, r) => {
        console.log("provide",r);
        s.send(new StickerMessage(1,2))
    }

])


bot.dialog("/contact", [
    (s) => {
        s.endDialog("contact_context")
    },
])





