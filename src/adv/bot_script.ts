import Parse = require('parse/node');

import { LineConnector, StickerMessage, ImageMessage, VideoMessage, BasicConfirmMessage,ConfirmMessage } from './../LineConnector';

import * as builder from 'botbuilder';
import { Message, CardImage, UniversalBot, HeroCard, CardAction, Prompts, ConsoleConnector } from 'botbuilder';

export var lineConnector = new LineConnector({
    channelId: "1489577982",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165a18c",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilFU="
});
export var bot = new builder.UniversalBot(lineConnector,
    {
        localizerSettings: {
            botLocalePath: __dirname + "/locale",
            defaultLocale: "zh"
        }
    }
);
var ADV = Parse.Object.extend("ADV");
let getText = (s, i) => { return s.localizer.gettext(s.preferredLocale(), i) };
//1. 介紹＆使用方式
//2. 廣告型式
//2. 堅聽吐廣告 loop
//3. 歡迎加至各群組

bot.dialog('/', [
    (s) => {
        if (!s.userData.init) {
            s.send("introduce");
            s.userData.init = true;
        }
        s.endDialog();
        if (s.message.address.from.name === "user") {
            s.beginDialog('/set_adv');
        } else {
            s.send("how_to_use");
            s.beginDialog('/in_room');
        }
    }
]);

bot.dialog('/set_adv', [
    (s) => {
        let q = new Parse.Query(ADV);
        q.equalTo("owner", s.message.address.channelId);
        q.first().then((obj: Parse.Object) => {
            if (obj !== undefined) {
                s.conversationData.adv = obj;

                let t: string = obj.get("type");
                let f: Parse.File = obj.get("file");
                if (t === "text") {
                    s.send(obj.get("text"))
                } else if (t === "image") {
                    let m = new ImageMessage(f.url())
                    s.send(m);
                } else if (t === "video") {
                    let m = new VideoMessage(f.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                    s.send(m);
                }
                s.send("your_current_adv");
            } else {
                s.send("set_your_adv");
            }
            let s0 = getText(s, "text");
            let s1 = getText(s, "attachment");
            let s2 = getText(s, "no_option");
            
            let st = getText(s, "pls_choice");

            let m = new BasicConfirmMessage(st, s0, s1,s2);
            builder.Prompts.choice(s, m, [s0, s1,s2]);
        })
    },
    (s, r) => {
        let s0 = getText(s, "text");
        let s1 = getText(s, "attachment");
        let s2 = getText(s, "no_option");

        let o = r.response.entity;
        if (o === s0) {
            s.dialogData.type = "text";
            builder.Prompts.text(s, "send_me_the_content");
        } else if (o === s1) {
            s.dialogData.type = "other";
            builder.Prompts.attachment(s, "send_me_the_content");
        } else {
            s.endDialog("end");
            s.beginDialog("/")
            
        }
    },
    (s, r) => {
        // console.log(s.conversationData.adv);
        let adv = new ADV();;
        if (s.conversationData.adv) {
            adv = new ADV(s.conversationData.adv);
            // adv.set("objectId",s.conversationData.adv.objectId);
        }

        if (typeof (r.response) === "string") {
            adv.set("type", "text");
            let text: string = r.response;
            adv.set("text", text);
            adv.save();
            s.userData.isSetAdv = true;

            s.endDialog("end");
            if (!s.userData.isSetLindID) {
                s.beginDialog("/set_line_id");
            }
        } else {
            let type = r.response[0].type;
            let mid: string = r.response[0].id;
            //save adv
            let c = lineConnector.getMessageContent(mid);
            c.then((data, err) => {
                let subname = ".png";
                if (type === "video") {
                    subname = ".mp4";
                }
                let d1 = Array.prototype.slice.call(new Buffer(data), 0);
                // console.log(data,d1);
                let parseFile = new Parse.File("data" + subname, d1);
                parseFile.save().then(() => {
                    adv.set("owner", s.message.address.channelId);
                    adv.set("type", type)
                    adv.set("file", parseFile)
                    adv.save();
                    s.userData.isSetAdv = true;
                    s.endDialog("end");
                    if (!s.userData.isSetLindID) {
                        s.beginDialog("/set_line_id");
                    }
                });
            })

        }
    }
])

bot.dialog("/set_line_id", [(s) => {
    lineConnector.getUserProfile(s.message.address.from.id).then((data, err) => {
        // console.log(data)
        let adv = new ADV(s.conversationData.adv);
        adv.set("displayName", data.displayName);
        adv.set("userId", data.userId);
        adv.set("pictureUrl", data.pictureUrl);
        adv.save();
        s.send(data.displayName);
        builder.Prompts.text(s, "pls_set_user_id");
    })
}, (s, r) => {
    let n = r.response + getText(s, "is_your_line_id");
    s.userData.lineId=n;
    let s0 = getText(s, "yes");
    let s1 = getText(s, "no");

    let m = new BasicConfirmMessage(n, s0, s1);
    builder.Prompts.choice(s, m, [s0, s1])
}, (s, r) => {
    let s0 = getText(s, "yes");
    
    if(r.response.entity === s0){
        s.userData.isSetLindID = true;
        let adv = new ADV(s.conversationData.adv);
        adv.set("lineId",s.userData.lineId);
        adv.save();
        s.endDialog("end");
        s.beginDialog("/");

    }else{
        s.replaceDialog("/set_line_id");
    }

}
])


bot.dialog('/in_room', [(s) => {
    s.send("introduce");
    builder.Prompts.text(s, "how_to_use")

    // s.endDialog("how_to_use");
    // s.beginDialog("loop_advs");
}, (s) => {

    let f = (obj: Parse.Object) => {
        if (obj !== undefined) {
            let t: string = obj.get("type");
            let f: Parse.File = obj.get("file");
            if (t === "text") {
                s.send(obj.get("text"))
            } else if (t === "image") {
                let m = new ImageMessage(f.url())
                s.send(m);
            } else if (t === "video") {
                let m = new VideoMessage(f.url(), "https://israel365.com/wp-content/uploads/2015/06/video.png");
                s.send(m);
            }
            let displayName:string =  obj.get("displayName");
            let lineId:string = obj.get("lineId");
            if(lineId){
                let sp = getText(s,"provide_by");
                let text:string = sp + " https://line.me/R/ti/p/~"+lineId;

                
                let m = new ConfirmMessage({title:sp,subtitle:sp,text:text},{title:displayName,type:"uri",value:"https://line.me/R/ti/p/~"+lineId})
                s.send(m);
            }


            if (s.userData.findPram === "contained") {
                obj.remove("read", s.message.address.channelId);
            } else {
                obj.add("read", s.message.address.channelId);
            }


            obj.save();
        } else {
            if (s.userData.findPram) {
                if (s.userData.findPram === "contained") {
                    s.userData.findPram = "notContained";
                } else {
                    s.userData.findPram = "contained";
                }
            } else {
                s.userData.findPram = "contained";
            }
            s.send("no_adv")
        }
    }
    let q = new Parse.Query(ADV);
    console.log(s.userData.findPram)
    if (s.userData.findPram) {
        if (s.userData.findPram === "notContained") {
            q.notContainedIn("read", [s.message.address.channelId]).first().then(f)
        } else {
            q.containedIn("read", [s.message.address.channelId]).first().then(f)
        }
    } else {
        s.userData.findPram = "notContained";
        q.notContainedIn("read", [s.message.address.channelId]).first().then(f)

    }

}])

