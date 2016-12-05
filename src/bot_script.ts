
import { LineConnector } from './LineConnector';

import * as builder from 'botbuilder';
import { Message, CardImage, UniversalBot, HeroCard, CardAction, Prompts, ConsoleConnector } from 'botbuilder';

export var lineConnector = new LineConnector({
    channelId: "1487296XXX",
    channelSecret: "40e21b20df162705bcccc3066fde1XXX",
    channelAccessToken: "dVxAd9kcq59UXD8ANh503yB+14sWaWOH6DMLjMa8OPCpwdaeeXFHvzlQ1VH3OC/hm62Kz0w8VgcpOZdWuSGK3bD/Q1zsKXs1WIrkK9o6yACkKUASTy6fu0T6ulRSAOoamCzGDwKHAPH5aM0ohx4f4QdB04t89/1O/w1cDnyilXXX"
});


export var bot = new builder.UniversalBot(lineConnector, {
    localizerSettings: {
        botLocalePath: __dirname + "./../locale",
        defaultLocale: "en"
    }
});


bot.dialog('/', [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.choice(session, "locale_prompt", 'English|Español|Italiano|中文');
    },
    function (session, results) {
        // Update preferred locale
        var locale;
        switch (results.response.entity) {
            case 'English':
                locale = 'en';
                break;
            case 'Español':
                locale = 'es';
                break;
            case 'Italiano':
                locale = 'it';
                break;
            case '中文':
                locale = 'zh-Hans';
                break;
        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                // Locale files loaded
                session.endDialog('locale_updated');
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

