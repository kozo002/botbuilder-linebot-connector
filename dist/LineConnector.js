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
var ConfirmMessage = (function (_super) {
    __extends(ConfirmMessage, _super);
    function ConfirmMessage(index, option1, option2, option3) {
        _super.call(this);
        var ass = [];
        var a1;
        var a0 = new botbuilder.CardAction().title(option1.title).type(option1.type).value(option1.value);
        ass.push(a0);
        if (option2) {
            a1 = new botbuilder.CardAction().title(option2.title).type(option2.type).value(option2.value);
            ass.push(a1);
        }
        if (option3) {
            var a = new botbuilder.CardAction().title(option3.title).type(option3.type).value(option3.value);
            ass.push(a);
        }
        var c = new botbuilder.HeroCard().title(index.title).subtitle(index.subtitle).text(index.text);
        c.buttons(ass);
        this.text(index.text).addAttachment(c);
    }
    return ConfirmMessage;
}(botbuilder.Message));
exports.ConfirmMessage = ConfirmMessage;
var BasicConfirmMessage = (function (_super) {
    __extends(BasicConfirmMessage, _super);
    function BasicConfirmMessage(text, option1, option2, option3) {
        var begin = { title: text, subtitle: text, text: text };
        var o1 = { title: option1, type: "message", value: option1 };
        var o2;
        if (option2) {
            o2 = { title: option2, type: "message", value: option2 };
        }
        var o3;
        if (option3) {
            o3 = { title: option3, type: "message", value: option3 };
        }
        _super.call(this, begin, o1, o2, o3);
    }
    return BasicConfirmMessage;
}(ConfirmMessage));
exports.BasicConfirmMessage = BasicConfirmMessage;
var StickerMessage = (function (_super) {
    __extends(StickerMessage, _super);
    function StickerMessage(pId, sId) {
        _super.call(this);
        this.text("sticker");
        this.addEntity({
            packageId: pId.toString(),
            stickerId: sId.toString()
        });
    }
    return StickerMessage;
}(botbuilder.Message));
exports.StickerMessage = StickerMessage;
var ImageMessage = (function (_super) {
    __extends(ImageMessage, _super);
    function ImageMessage(url) {
        _super.call(this);
        this.text("image");
        this.addEntity({
            originalContentUrl: url,
            previewImageUrl: url
        });
    }
    return ImageMessage;
}(botbuilder.Message));
exports.ImageMessage = ImageMessage;
var VideoMessage = (function (_super) {
    __extends(VideoMessage, _super);
    function VideoMessage(video_url, perview_image_url) {
        _super.call(this);
        this.text("video");
        this.addEntity({
            originalContentUrl: video_url,
            previewImageUrl: perview_image_url
        });
    }
    return VideoMessage;
}(botbuilder.Message));
exports.VideoMessage = VideoMessage;
var AudioMessage = (function (_super) {
    __extends(AudioMessage, _super);
    function AudioMessage(url) {
        _super.call(this);
        this.text("audio");
        this.addEntity({
            originalContentUrl: url,
            previewImageUrl: url
        });
    }
    return AudioMessage;
}(botbuilder.Message));
exports.AudioMessage = AudioMessage;
var LocationMessage = (function (_super) {
    __extends(LocationMessage, _super);
    function LocationMessage(title, address, latitude, longitude) {
        _super.call(this);
        this.text("location");
        this.addEntity({
            title: title,
            address: address,
            latitude: latitude,
            longitude: longitude
        });
    }
    return LocationMessage;
}(botbuilder.Message));
exports.LocationMessage = LocationMessage;
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
            try {
                var mid = "";
                if (msg.source.type === "user") {
                    mid = msg.source.userId;
                }
                else if (msg.source.type === "group") {
                    mid = msg.source.groupId;
                }
                else if (msg.source.type === "room") {
                    mid = msg.source.roomId;
                }
                //console.log("msg.source",msg.source)
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
                if (msg.message.type !== "text") {
                    m.text = msg.message.type;
                    m.attachments = [msg.message];
                }
                msg = m;
                // let fs = require("fs");
                // var data = fs.readFileSync(__dirname+'/joke/girl.jpg', 'utf-8');
                // console.log(data);
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
    };
    LineConnector.prototype.get = function (path) {
        console.log("get", path);
        return fetch(this.endpoint + path, { method: 'GET', headers: this.headers });
    };
    LineConnector.prototype.getUserProfile = function (userId) {
        return this.get('/profile/' + userId).then(function (res) {
            return res.json();
        });
    };
    LineConnector.prototype.getMessageContent = function (messageId) {
        return this.get('/message/' + messageId + '/content/').then(function (res) {
            return res.buffer();
        });
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
        // console.log("send",messages)
        //new EventEmitter wait for call process;
        // console.log("send");
        var _this = this;
        var P = function (a) {
            var auth = a;
            var ts = [];
            var e = new events_1.EventEmitter();
            setTimeout(function () {
                e.emit("done");
            }, 100);
            e.on("add", function (t) {
                // console.log("add", t)
                ts.push(t);
            });
            e.on("done", function () {
                // console.log("done", auth, ts)
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
                    // console.log("t", t);
                    _this.sendProcess.emit("add", t);
                });
            }
            else {
                // console.log("msg",msg)
                if (msg.text === "sticker" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'sticker', packageId: msg.entities[0].packageId, stickerId: msg.entities[0].stickerId });
                }
                else if (msg.text === "image" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'image', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl });
                }
                else if (msg.text === "video" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'video', originalContentUrl: msg.entities[0].originalContentUrl, previewImageUrl: msg.entities[0].previewImageUrl });
                }
                else if (msg.text === "audio" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'audio', originalContentUrl: msg.entities[0].originalContentUrl, duration: msg.entities[0].duration });
                }
                else if (msg.text === "location" && msg.entities) {
                    _this.sendProcess.emit("add", { type: 'location', title: msg.entities[0].title, address: msg.entities[0].address, latitude: msg.entities[0].latitude, longitude: msg.entities[0].longitude });
                }
                else {
                    _this.sendProcess.emit("add", { type: 'text', text: msg.text });
                }
            }
        });
    };
    LineConnector.prototype.getData = function (context, callback) {
        var _this = this;
        var cid = context.address.channelId + "/" + this.botId;
        var query = new Parse.Query(DATA);
        query.equalTo("channelId", cid).first().then(function (obj) {
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
        // console.log("context",context);
        // obj.set("room_type", context.address.from.name);
        // obj.set("room_id", context.address.id);
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
                            var subtext_1 = "\n";
                            var bn_c_1 = 0;
                            tc.buttons.map(function (b) {
                                var bn = {
                                    type: b.type,
                                    label: b.title,
                                    text: b.value,
                                    uri: b.value,
                                    data: b.value
                                };
                                bn_c_1++;
                                subtext_1 += bn_c_1 + "." + b.title + "\n";
                                // console.log(subtext)
                                r_2.template.actions.push(bn);
                            });
                            r_2.altText += subtext_1;
                            // console.log(r);
                            if (tc.images !== undefined) {
                                r_2.template.thumbnailImageUrl = tc.images[0].url;
                            }
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
