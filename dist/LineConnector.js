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
var events_1 = require('events');
// import linebot = require("linebot");
var fetch = require('node-fetch');
var crypto = require('crypto');
var url = require('url');
var DATA = Parse.Object.extend("DATA");
var LineConnector = (function (_super) {
    __extends(LineConnector, _super);
    function LineConnector(options) {
        _super.call(this);
        // sendProcess:Promise<any>;
        this.sendProcess = null;
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
            // console.log("msg",msg)
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
                    source: mid,
                    text: msg.message.text,
                    res: res,
                };
                console.log("msg.message.type", msg.message.type);
                // console.log("msg",msg )
                if (msg.message.type !== "text") {
                    m.text = msg.message.type;
                }
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
        //new EventEmitter wait for call process;
        console.log("send");
        var _this = this;
        var P = function (a) {
            var auth = a;
            var ts = [];
            var e = new events_1.EventEmitter();
            setTimeout(function () {
                e.emit("done");
            }, 100);
            e.on("add", function (t) {
                console.log("add", t);
                ts.push(t);
            });
            e.on("done", function () {
                console.log("done", auth, ts);
                _this.reply(auth, ts);
                _this.sendProcess = null;
            });
            return e;
        };
        messages.map(function (msg) {
            // console.log("msg", msg)
            if (_this.sendProcess === null) {
                _this.sendProcess = P(msg.address.useAuth);
            }
            if (msg.attachments !== undefined) {
                // _this.renderAttachment(msg);
                var p = _this.getRenderTemplate(msg);
                p.then(function (t) {
                    console.log("t", t);
                    _this.sendProcess.emit("add", t);
                });
            }
            else {
                _this.sendProcess.emit("add", { type: 'text', text: msg.text });
            }
        });
    };
    LineConnector.prototype.getData = function (context, callback) {
        var _this = this;
        //  console.log("getData  context.address.channelId", context.address.channelId);
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
        // console.log("save",data)
        // console.log("save",data.privateConversationData["BotBuilder.Data.SessionState"].callstack)
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
    LineConnector.prototype.getRenderTemplate = function (msg) {
        var _this = this;
        return new Promise(function (res, rej) {
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
                                    // _this.reply(msg.address.useAuth, r);
                                    // return r;
                                    res(r_1);
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
                            if (tc.buttons.length <= 2 && tc.images === undefined) {
                                r_2.template.type = "confirm";
                            }
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
                            console.log("r0", r_2);
                            // _this.reply(msg.address.useAuth, r);
                            // return r;
                            res(r_2);
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
                // _this.reply(msg.address.useAuth, r);
                // return r;
                res(r_3);
            }
        });
        // if(msg.attachments)
        // this.reply()
    };
    return LineConnector;
}(botbuilder.ChatConnector));
exports.LineConnector = LineConnector;
