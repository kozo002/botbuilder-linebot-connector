
import { LineConnector } from './LineConnector';

import * as builder from 'botbuilder';
import { Message, CardImage, UniversalBot, HeroCard, CardAction, Prompts, ConsoleConnector } from 'botbuilder';

export var lineConnector = new LineConnector({
    channelId: "1489577982",
    channelSecret: "1752cff54cf3db3a9f4a4bdd6165a18c",
    channelAccessToken: "W5cNdbwKSLS86soxGjnxpzIPZgm3orCWVZuOkU5YBVqZ6nFctxxZLYE9a5UWJ9gL5yz0lnEnH9tld/B8e49PPRQEhyMnBnxUmPr6hXvxId0zrj4S675kQIjsVlkzY97ShKM+kyXAkpqRS2ZcAQkMVwdB04t89/1O/w1cDnyilFU="
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

