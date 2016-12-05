// import * as _ from "lodash";
"use strict";
var LineConnector = (function () {
    function LineConnector(opts) {
    }
    LineConnector.prototype.getData = function () {
    };
    LineConnector.prototype.onEvent = function () {
    };
    LineConnector.prototype.send = function () {
    };
    LineConnector.prototype.listen = function () {
        return wechat(config, function (req, res, next) {
            var wechatMessage = req.weixin;
            if (!self.options.enableReply) {
                self.processMessage(wechatMessage);
                res.status(200).end();
            }
            else {
                next();
            }
        });
    };
    ;
    LineConnector.prototype.saveData = function () {
    };
    LineConnector.prototype.startConversation = function () {
    };
    return LineConnector;
}());
