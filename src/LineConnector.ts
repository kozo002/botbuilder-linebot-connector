// import * as _ from "lodash";

import * as botbuilder from "botbuilder";
import bodyParser = require("body-parser");
import Parse = require('parse/node');
import { EventEmitter } from 'events';

// import linebot = require("linebot");
const fetch = require('node-fetch');
const crypto = require('crypto');
var url = require('url');

var DATA = Parse.Object.extend("DATA");

export class StickerMessage extends botbuilder.Message {
    constructor(pId: number, sId: number) {
        super();
        this.text("sticker");
        this.addEntity({
            packageId: pId.toString(),
            stickerId: sId.toString()
        })
    }
}
export class ImageMessage extends botbuilder.Message {
    constructor(url: string) {
        super();
        this.text("image");
        this.addEntity({
            originalContentUrl: url,
            previewImageUrl: url
        })
    }
}
export class VideoMessage extends botbuilder.Message {
    constructor(video_url: string, perview_image_url: string) {
        super();
        this.text("video");
        this.addEntity({
            originalContentUrl: video_url,
            previewImageUrl: perview_image_url
        })
    }
}
export class AudioMessage extends botbuilder.Message {
    constructor(url: string) {
        super();
        this.text("audio");
        this.addEntity({
            originalContentUrl: url,
            previewImageUrl: url
        })
    }
}
export class LocationMessage extends botbuilder.Message {
    constructor(title: string, address: string, latitude: string, longitude: string) {
        super();
        this.text("location");
        this.addEntity({
            title,
            address,
            latitude,
            longitude
        })
    }
}

export class LineConnector extends botbuilder.ChatConnector {
    botId;
    options;
    headers;
    endpoint;
    handler;
    event;
    obj;
    constructor(options) {
        super();
        this.options = options || {};
        this.options.channelId = options.channelId || '';
        this.options.channelSecret = options.channelSecret || '';
        this.options.channelAccessToken = options.channelAccessToken || '';
        if (this.options.verify === undefined) {
            this.options.verify = true;
        }
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.options.channelAccessToken
        };
        this.endpoint = 'https://api.line.me/v2/bot';
        this.botId = options.channelId;
    }
    verify(rawBody, signature) {
        const hash = crypto.createHmac('sha256', this.options.channelSecret)
            .update(rawBody, 'utf8')
            .digest('base64');
        return hash === signature;
    }

    dispatch(body, res) {
        const _this = this;
        if (!body || !body.events) {
            return;
        }
        body.events.forEach(function (msg) {
            try {
                let mid = "";
                if (msg.source.type === "user") {
                    mid = msg.source.userId
                } else if (msg.source.type === "group") {
                    mid = msg.source.groupId
                }

                let m = {
                    locale: 'textLocale',
                    channelData: 'sourceEvent',
                    user: {
                        id: mid,
                        name: "user"
                    },
                    getUserProfile: mid,
                    attachments: msg.attachments || [],
                    entities: msg.entities || [],
                    address: {
                        id: mid,
                        channelId: "line:" + mid,
                        from: {
                            id: mid,
                            name: msg.source.type
                        },
                        conversation: "conversation",
                        recipient: 'bot',
                        serviceUrl: _this.endpoint,
                        useAuth: msg.replyToken

                    },
                    source: mid,
                    text: msg.message.text,
                    res: res,
                };


                if (msg.message.type !== "text") {
                    m.text = msg.message.type;
                    m.attachments = [msg.message]
                    // if(msg.message.type==="image"){
                    //     m.attachments= [{"type":"image","id":msg.message.id}];
                    // }
                    // else if(msg.message.type==="video"){
                    //     m.attachments= [{"type":"video","id":msg.message.id}];
                    // }
                    // else if(msg.message.type==="audio"){
                    //     m.attachments= [{"type":"audio","id":msg.message.id}];
                    // }
                    // else if(msg.message.type==="location"){
                    //     m.attachments= [{"type":"location","id":msg.message.id,title:}];
                    // }
                }


                msg = m;
                // let fs = require("fs");
                // var data = fs.readFileSync(__dirname+'/joke/girl.jpg', 'utf-8');
                // console.log(data);
                _this.handler([msg]);
                // _this.handler(data);
            }
            catch (e) {
                console.error(e instanceof Error ? e.stack : e.toString());
            }
        })
    }
    listen() {
        // console.log("listen")

        const parser = bodyParser.json({
            verify: function (req: any, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return (req, res) => {
            parser(req, res, () => {
                if (this.options.verify && !this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                // console.log("listen 2")
                this.dispatch(req.body, res);
                return res.json({});
            });
        };
        // return this.bot.parser();
    }
    onEvent(handler) {
        this.handler = handler;
    };

    static createMessages(message) {
        // console.log(message)
        if (typeof message === 'string') {
            return [{ type: 'text', text: message }];
        }



        if (Array.isArray(message)) {
            return message.map(function (m) {
                if (typeof m === 'string') {
                    return { type: 'text', text: m };
                }

                return m;
            });
        }
        return [message];
    }

    get(path) {
        console.log("get", path);
        return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
    }
    getUserProfile(userId) {
        return this.get('/profile/' + userId).then(function (res) {
            return res.json();
        });
    }

    getMessageContent(messageId) {
        return this.get('/message/' + messageId + '/content/').then(function (res) {
            return res.buffer();
        });
    }


    post(path, body) {
        return fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
    }

    reply(replyToken, message) {
        const body = {
            replyToken: replyToken,
            messages: LineConnector.createMessages(message)
        };
        return this.post('/message/reply', body).then(function (res) {
            return res.json();
        });
    }
    // sendProcess:Promise<any>;

    sendProcess = null;


    send(messages, done) {
        // console.log("send",messages)
        //new EventEmitter wait for call process;
        // console.log("send");
        var _this = this;
        let P = (a: string) => {
            let auth = a;
            let ts = [];
            let e = new EventEmitter();

            setTimeout(() => {
                e.emit("done");
            }, 100);

            e.on("add", (t) => {
                // console.log("add", t)

                ts.push(t);
            })
            e.on("done", () => {
                // console.log("done", auth, ts)
                _this.reply(auth, ts);
                _this.sendProcess = null;
            })
            return e;
        }

        messages.map((msg) => {
            // console.log("msg", msg)
            if (_this.sendProcess === null) {
                _this.sendProcess = P(msg.address.useAuth);
            }
            if (msg.attachments !== undefined) {
                // _this.renderAttachment(msg);
                let p: Promise<any> = _this.getRenderTemplate(msg);
                p.then((t) => {
                    // console.log("t", t);
                    _this.sendProcess.emit("add", t)
                });
            } else {
                // console.log("msg",msg)
                if (msg.text === "sticker" && msg.entities) {
                    let js = { type: 'sticker', packageId: msg.entities[0].packageId, stickerId: msg.entities[0].stickerId };
                    console.log("sticker",msg.entities)
                    
                    console.log("sticker",JSON.stringify(js))
                    _this.sendProcess.emit("add", { type: 'sticker', packageId: msg.entities[0].packageId, stickerId: msg.entities[0].stickerId });
                } else if (msg.text === "image" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'image', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl });
                } else if (msg.text === "video" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'video', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl });
                } else if (msg.text === "audio" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'audio', originalContentUrl: msg.entities[0].originalContentUrl, duration: msg.entities[0].duration });
                } else if (msg.text === "location" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'location', title: msg.entities[0].title, address: msg.entities[0].address, latitude: msg.entities[0].latitude, longitude: msg.entities[0].longitude });
                } else {
                    _this.sendProcess.emit("add", { type: 'text', text: msg.text });

                }
            }
        })
    }

    getData(context, callback) {
        var _this = this;
        let cid = context.address.channelId + "/" + this.botId;
        let query = new Parse.Query(DATA);
        query.equalTo("channelId", cid).first().then((obj: Parse.Object) => {
            if (obj !== undefined) {
                _this.obj = obj;
                var d: string = obj.get("data");
                var data = JSON.parse(d);
                callback(null, data);
            } else {
                callback(null, null);
            }
        })
    }
    saveData(context, data, callback) {
        let obj = new DATA();

        if (this.obj) {
            obj = this.obj;
        }
        obj.set("channelId", context.address.channelId + "/" + this.botId)
        obj.set("data", JSON.stringify(data));
        obj.save().then((err, data) => {
            // console.log("saveData 2", err, data)
            callback(null)
        });
    }

    getRenderTemplate(msg): Promise<any> {

        var _this = this;

        return new Promise((res, rej) => {

            let l = msg.attachments.length;
            if (l === 1) {

                msg.attachments.map((a) => {
                    switch (a.contentType) {
                        case 'application/vnd.microsoft.card.hero':
                        case 'application/vnd.microsoft.card.thumbnail':

                            var tc = a.content;
                            // console.log("tc", tc);
                            if (tc.title === undefined) {
                                if (tc.images.length > 0) {
                                    let r = {
                                        type: 'image',
                                        originalContentUrl: tc.images[0].url,
                                        previewImageUrl: tc.images[0].url
                                    }
                                    // _this.reply(msg.address.useAuth, r);
                                    // return r;
                                    res(r);
                                }
                            }
                            let r: any = {
                                type: 'template',
                                altText: tc.text,
                                template: {
                                    type: "buttons",
                                    title: tc.title,
                                    text: tc.subtitle,
                                    actions: []
                                }
                            };
                            if (tc.buttons.length <= 2 && tc.images === undefined) {
                                r.template.type = "confirm";
                            }

                            let actions;
                            tc.buttons.map((b) => {
                                let bn = {
                                    type: "message",
                                    label: b.title,
                                    text: b.value
                                }
                                r.template.actions.push(bn)
                            });

                            if (tc.images !== undefined) {
                                r.template.thumbnailImageUrl = tc.images[0].url;
                            }
                            // console.log("r0", r)


                            // _this.reply(msg.address.useAuth, r);
                            // return r;
                            res(r);
                    }

                })
            } else {
                let r: any = {
                    type: 'template',
                    altText: msg.text,
                    template: {
                        type: "carousel",
                        columns: []

                    }
                };
                msg.attachments.map((a) => {
                    switch (a.contentType) {
                        case 'application/vnd.microsoft.card.hero':
                        case 'application/vnd.microsoft.card.thumbnail':
                            var tc = a.content;
                            let c: any = {
                                title: tc.title,
                                text: tc.subtitle,
                                actions: []
                            }

                            let actions;
                            tc.buttons.map((b) => {
                                let bn = {
                                    type: "message",
                                    label: b.title,
                                    text: b.value
                                }
                                c.actions.push(bn)
                            });
                            if (tc.images !== undefined) {
                                c.thumbnailImageUrl = tc.images[0].url;
                            }
                            r.template.columns.push(c);
                    }

                })
                // console.log("r", r)
                // _this.reply(msg.address.useAuth, r);
                // return r;
                res(r);

            }
        });


        // if(msg.attachments)

        // this.reply()

    }

}
