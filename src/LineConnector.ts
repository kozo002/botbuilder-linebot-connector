// import * as _ from "lodash";

import * as botbuilder from "botbuilder";
import bodyParser = require("body-parser");
import Parse = require('parse/node');

// import linebot = require("linebot");
const fetch = require('node-fetch');
const crypto = require('crypto');
var url = require('url');

var DATA = Parse.Object.extend("DATA");

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
                    source: msg.source.userId,
                    text: msg.message.text,
                    res: res,
                };

                msg = m;

                _this.handler([msg]);
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
        return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
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

    send(messages, done) {
        var _this = this;


        messages.map((msg) => {
            // console.log("msg", msg)
            if (msg.attachments !== undefined) {
                _this.renderAttachment(msg);


            } else {
                _this.reply(msg.address.useAuth, msg.text);

            }
        })

        //    this.event.reply(messages);
    }
    // startConversation(address, cb) {
    //     console.log("startConversation",address)
    //     function clone(obj) {
    //         var cpy = {};
    //         if (obj) {
    //             for (var key in obj) {
    //                 if (obj.hasOwnProperty(key)) {
    //                     cpy[key] = obj[key];
    //                 }
    //             }
    //         }
    //         return cpy;
    //     }

    //     var adr: any = clone(address);
    //     adr.conversation = { id: 'Convo3' };
    //     cb(null, adr);
    // }

    getData(context, callback) {
        var _this = this;
        //  console.log("getData  context.address.channelId", context.address.channelId);

        // callback(null, null);
        let query = new Parse.Query(DATA);
        query.equalTo("channelId", context.address.channelId + "/" + this.botId ).first().then((obj: Parse.Object) => {
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

        obj.set("channelId", context.address.channelId + "/" + this.botId )
        obj.set("data", JSON.stringify(data));
        obj.save().then((err, data) => {
            // console.log("saveData 2", err, data)
            callback(null)
        });
    }

    renderAttachment(msg) {
        var _this = this;
        console.log("msg", msg);
        let l = msg.attachments.length;
        if (l === 1) {
            msg.attachments.map((a) => {
                switch (a.contentType) {
                    case 'application/vnd.microsoft.card.hero':
                    case 'application/vnd.microsoft.card.thumbnail':
                        var tc = a.content;
                        console.log("tc", tc);
                        if (tc.title === undefined) {
                            if (tc.images.length > 0) {
                                let r = {
                                    type: 'image',
                                    originalContentUrl: tc.images[0].url,
                                    previewImageUrl: tc.images[0].url
                                }
                                _this.reply(msg.address.useAuth, r);
                                return;
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
                        _this.reply(msg.address.useAuth, r);
                        return;
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
            console.log("r", r)
            _this.reply(msg.address.useAuth, r);


        }


        // if(msg.attachments)

        // this.reply()

    }

}
