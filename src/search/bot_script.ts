var redis = require("redis"),
    client = redis.createClient();


import {
    LineConnector, StickerMessage, ImageMessage, VideoMessage,//mp4 only
    BasicConfirmMessage, ConfirmMessage
} from './../LineConnector';


import * as builder from 'botbuilder';
import { Message, CardImage, UniversalBot, HeroCard, CardAction, Prompts, ConsoleConnector } from 'botbuilder';

export var lineConnector = new LineConnector({
    channelId: "1487296483",
    channelSecret: "40e21b20df162705bcccc3066fde13ee",
    channelAccessToken: "dVxAd9kcq59UXD8ANh503yB+14sWaWOH6DMLjMa8OPCpwdaeeXFHvzlQ1VH3OC/hm62Kz0w8VgcpOZdWuSGK3bD/Q1zsKXs1WIrkK9o6yACkKUASTy6fu0T6ulRSAOoamCzGDwKHAPH5aM0ohx4f4QdB04t89/1O/w1cDnyilFU="
}, (context, data, callback) => {
    let cid = context.address.channelId;
    client.set(cid, JSON.stringify(data));

    callback(null);
},
    (context, callback) => {
        let cid = context.address.channelId;
        client.get(cid, function (err, data) {
            callback(null, JSON.parse(data));
        }
        )
    });

export var console_connector = new builder.ConsoleConnector().listen();

export var bot = new builder.UniversalBot(lineConnector);

let getText = (s, i) => { return s.localizer.gettext(s.preferredLocale(), i) };

bot.dialog('/', [
    (s) => {
        s.beginDialog('/a');
    },
    (s) => {
        s.beginDialog('/b');
    }
]);

bot.dialog('/a', [
    (s) => {
        s.send(new StickerMessage(1, 403));
        s.send(new ImageMessage("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png")); //https only

        builder.Prompts.choice(s, "number?", ["1", "2"]);
    },
    (s, r) => {
        let o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);

bot.dialog('/b', [
    (s) => {
        let s1 = getText(s, "funny");
            let af = new builder.CardAction().title(s1).type("message").value(s1);
            let s2 = getText(s, "lame");
            let al = new builder.CardAction().title(s2).type("message").value(s2);
            let c = new builder.HeroCard().title(getText(s, "is_this_funny")).subtitle(getText(s, "is_this_funny")).text(getText(s, "is_this_funny")).buttons([af, al]);
            let m = new builder.Message().text("is_this_funny").addAttachment(c);
            builder.Prompts.choice(s, m, [s1, s2])
       
    },
    (s, r) => {
        
        let o = r.response.entity;
        s.endDialog("you select:" + o);
    }
]);


