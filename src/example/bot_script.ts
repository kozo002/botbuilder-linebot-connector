
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
        s.send("hello");
        
        let a = new builder.CardAction().title(getText(s, "agree")).type("message").value(getText(s, "agree"));
        let c0 = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a]);
        let m0 = new builder.Message().text("me").addAttachment(c0);
        s.send(m0)
        let c1 = new builder.HeroCard().title(getText(s, "law")).subtitle(getText(s, "law")).text(getText(s, "law")).buttons([a,a]);
        let m1 = new builder.Message().text("me").addAttachment(c1)
        s.send(m1)
        let m2 = new builder.Message().text("me").addAttachment(c0).addAttachment(c1)
        builder.Prompts.choice(s,m2,[getText(s, "agree")]);
        
        
        
        
    }
]);


