var redis = require("redis"),
    client = redis.createClient();


import { LineConnector, StickerMessage, ImageMessage, VideoMessage } from './../LineConnector';

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

export var bot = new builder.UniversalBot(lineConnector);

var google = require('google')

google.resultsPerPage = 1
var nextCounter = 0

bot.dialog('/', [
    function (s, r) {
        console.log("s.message.attachments", s.message.attachments.length)
        if (s.message.attachments.length === 0) {
            google(s.message.text, function (err, res) {
                if (err) console.error(err)
                for (var i = 0; i < res.links.length; ++i) {
                    var link = res.links[i];
                    console.log(link)
                    if (link) {
                        s.send(link.title)
                    }
                }
                if (nextCounter < 4) {
                    nextCounter += 1
                    if (res.next) res.next()
                }
            })
        }

    }
]);
