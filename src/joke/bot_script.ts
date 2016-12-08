
import { LineConnector } from './../LineConnector';

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

        let s1 = getText(s, "funny");
        let af = new builder.CardAction().title(s1).type("message").value(s1);
        let s2 = getText(s, "lame");
        let al = new builder.CardAction().title(s2).type("message").value(s2);
        let c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "joke")).text(getText(s, "joke")).buttons([af, al]);
        let m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [s1,s2])
    },
    (s, r) => {
        console.log(r.response);

        s.endDialog("end");
        
    }
])
bot.dialog("/menu", [

    function (s, r) {
        //route /joke

        let s1 = getText(s, "provide");
        let af = new builder.CardAction().title(s1).type("message").value(s1);
        let c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "me")).text(getText(s, "me")).buttons([af]);
        let m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [s1])
    },
    (s, r) => {
        console.log("r",r.response.entity)
        let s1 = getText(s, "provide");
        
        let e = r.response.entity;
        
        switch(e){
            case s1:
                // s.send("")
                let p = getText(s, "provide_intro");
                builder.Prompts.attachment(s,p);
            break;
        }
        
        // s.endDialog("end menu");
    }
])



