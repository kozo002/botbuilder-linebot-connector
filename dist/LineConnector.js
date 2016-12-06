// import * as _ from "lodash";
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var botbuilder = require("botbuilder");
var bodyParser = require("body-parser");
var Parse = require('parse/node');
// import linebot = require("linebot");
var fetch = require('node-fetch');
var crypto = require('crypto');
var url = require('url');
var DATA = Parse.Object.extend("DATA");
var LineConnector = (function (_super) {
    __extends(LineConnector, _super);
    function LineConnector(options) {
        _super.call(this);
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
    LineConnector.prototype.verify = function (rawBody, signature) {
        var hash = crypto.createHmac('sha256', this.options.channelSecret)
            .update(rawBody, 'utf8')
            .digest('base64');
        return hash === signature;
    };
    LineConnector.prototype.dispatch = function (body, res) {
        var _this = this;
        if (!body || !body.events) {
            return;
        }
        body.events.forEach(function (msg) {
            try {
                var mid = "";
                if (msg.source.type === "user") {
                    mid = msg.source.userId;
                }
                else if (msg.source.type === "group") {
                    mid = msg.source.groupId;
                }
                var m = {
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
        });
    };
    LineConnector.prototype.listen = function () {
        // console.log("listen")
        var _this = this;
        var parser = bodyParser.json({
            verify: function (req, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return function (req, res) {
            parser(req, res, function () {
                if (_this.options.verify && !_this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                // console.log("listen 2")
                _this.dispatch(req.body, res);
                return res.json({});
            });
        };
        // return this.bot.parser();
    };
    LineConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };
    ;
    LineConnector.createMessages = function (message) {
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
    };
    LineConnector.prototype.get = function (path) {
        return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
    };
    LineConnector.prototype.post = function (path, body) {
        return fetch(this.endpoint + path, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
    };
    LineConnector.prototype.reply = function (replyToken, message) {
        var body = {
            replyToken: replyToken,
            messages: LineConnector.createMessages(message)
        };
        return this.post('/message/reply', body).then(function (res) {
            return res.json();
        });
    };
    LineConnector.prototype.send = function (messages, done) {
        var _this = this;
        messages.map(function (msg) {
            // console.log("msg", msg)
            if (msg.attachments !== undefined) {
                _this.renderAttachment(msg);
            }
            else {
                _this.reply(msg.address.useAuth, msg.text);
            }
        });
        //    this.event.reply(messages);
    };
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
    LineConnector.prototype.getData = function (context, callback) {
        var _this = this;
        //  console.log("getData  context.address.channelId", context.address.channelId);
        // callback(null, null);
        var query = new Parse.Query(DATA);
        query.equalTo("channelId", context.address.channelId + "/" + this.botId).first().then(function (obj) {
            if (obj !== undefined) {
                _this.obj = obj;
                var d = obj.get("data");
                var data = JSON.parse(d);
                callback(null, data);
            }
            else {
                callback(null, null);
            }
        });
    };
    LineConnector.prototype.saveData = function (context, data, callback) {
        var obj = new DATA();
        if (this.obj) {
            obj = this.obj;
        }
        obj.set("channelId", context.address.channelId + "/" + this.botId);
        obj.set("data", JSON.stringify(data));
        obj.save().then(function (err, data) {
            // console.log("saveData 2", err, data)
            callback(null);
        });
    };
    LineConnector.prototype.renderAttachment = function (msg) {
        var _this = this;
        // console.log("msg", msg);
        var l = msg.attachments.length;
        if (l === 1) {
            msg.attachments.map(function (a) {
                switch (a.contentType) {
                    case 'application/vnd.microsoft.card.hero':
                    case 'application/vnd.microsoft.card.thumbnail':
                        var tc = a.content;
                        // console.log("tc", tc);
                        if (tc.title === undefined) {
                            if (tc.images.length > 0) {
                                var r_1 = {
                                    type: 'image',
                                    originalContentUrl: tc.images[0].url,
                                    previewImageUrl: tc.images[0].url
                                };
                                _this.reply(msg.address.useAuth, r_1);
                                return;
                            }
                        }
                        var r_2 = {
                            type: 'template',
                            altText: tc.text,
                            template: {
                                type: "buttons",
                                title: tc.title,
                                text: tc.subtitle,
                                actions: []
                            }
                        };
                        var actions = void 0;
                        tc.buttons.map(function (b) {
                            var bn = {
                                type: "message",
                                label: b.title,
                                text: b.value
                            };
                            r_2.template.actions.push(bn);
                        });
                        if (tc.images !== undefined) {
                            r_2.template.thumbnailImageUrl = tc.images[0].url;
                        }
                        _this.reply(msg.address.useAuth, r_2);
                        return;
                }
            });
        }
        else {
            var r_3 = {
                type: 'template',
                altText: msg.text,
                template: {
                    type: "carousel",
                    columns: []
                }
            };
            msg.attachments.map(function (a) {
                switch (a.contentType) {
                    case 'application/vnd.microsoft.card.hero':
                    case 'application/vnd.microsoft.card.thumbnail':
                        var tc = a.content;
                        var c_1 = {
                            title: tc.title,
                            text: tc.subtitle,
                            actions: []
                        };
                        var actions = void 0;
                        tc.buttons.map(function (b) {
                            var bn = {
                                type: "message",
                                label: b.title,
                                text: b.value
                            };
                            c_1.actions.push(bn);
                        });
                        if (tc.images !== undefined) {
                            c_1.thumbnailImageUrl = tc.images[0].url;
                        }
                        r_3.template.columns.push(c_1);
                }
            });
            // console.log("r", r)
            _this.reply(msg.address.useAuth, r_3);
        }
        // if(msg.attachments)
        // this.reply()
    };
    return LineConnector;
}(botbuilder.ChatConnector));
exports.LineConnector = LineConnector;
