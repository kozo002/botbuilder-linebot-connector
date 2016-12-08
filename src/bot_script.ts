
import { LineConnector } from './LineConnector';

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
        botLocalePath: __dirname + "./../locale",
        defaultLocale: "zh_Hans"
    }
}
);


let getText = (s, i) => { return s.localizer.gettext(s.preferredLocale(), i) };



bot.dialog('/', [
    function (s) {
        // Prompt the user to select their preferred locale
        // builder.Prompts.choice(session, "locale_prompt", 'English|Español|Italiano|中文');
        let a = new builder.CardAction().title(getText(s,"agree")).type("message").value(getText(s,"agree"));
            
        let c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "begin")).text(getText(s, "me") + getText(s, "begin")).buttons([a]);
        let m = new builder.Message().text("me").addAttachment(c);
        s.send("hello");
        s.send("great");
        s.send("me");
        // s.endDialog("end");
        
        builder.Prompts.choice(s, m, getText(s,"agree"))
    }
    ,
    function (s, r) {
        let s1 = getText(s,"funny");
        let af = new builder.CardAction().title(s1).type("message").value(s1);
        let s2 = getText(s,"lame");
        let al = new builder.CardAction().title(s2).type("message").value(s2);
        let c = new builder.HeroCard().title(getText(s, "me")).subtitle(getText(s, "joke")).text(getText(s, "joke")).buttons([af,al]);
        let m = new builder.Message().text("me").addAttachment(c);
        builder.Prompts.choice(s, m, [getText(s,"funny"),getText(s,"lame")])
    },
    (s,r)=>{
        s.endDialog("end");
    }
]);

