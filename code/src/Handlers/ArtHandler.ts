import IMessageInfo from '../Interfaces/IMessageInfo';
import { MessageReaction, TextChannel } from 'discord.js';
import { ReactionMessageType } from '../Enums/ReactionMessageType';
import ReactionManager from '../Managers/ReactionManager';
import { Utils } from '../Utils/Utils';
import MessageService from '../Services/MessageService';

export default class ArtHandler {
    public static async OnReaction(obj:any, reaction:MessageReaction) {
        if (reaction.emoji.name == '📌') {
            obj.messageInfo.message.reactions.removeAll();
            await Utils.Sleep(Utils.Random(2, 10));
            await this.SayMessage(obj.messageInfo);
            await Utils.Sleep(1);
            await this.PinArt(obj.messageInfo);
        }
    }

    public static async AddPinReaction(messageInfo:IMessageInfo) {
        if (messageInfo.message == null) {
            return;
        }

        messageInfo?.message.react('📌');

        ReactionManager.AddMessage(messageInfo?.message, ReactionMessageType.ArtPin, messageInfo, null, 1);
    }

    public static async PinArt(messageInfo:IMessageInfo) {
        const pinned = await (<TextChannel>messageInfo.channel).messages.fetchPinned(true);
        const pinnedArray = pinned.array();
        if (pinnedArray.length >= 50) {
            pinnedArray.sort((a, b) => {
                return a.createdTimestamp - b.createdTimestamp;
            })
            await pinnedArray[0].unpin();
        }

        await messageInfo.message?.pin();
    }

    public static async SayMessage(messageInfo:IMessageInfo) {
        var messages = [
            'Wooow! Die is echt héél goed {1}!',
            'Nice {1}! Echt heel mooi!!',
            'Lekker bezig {1}!',
            'Wow cool {1}!',
            'Supermooi {1}!',
            '{1} Aaah echt heel gaaf!!',
            'Allemachtig wat is dat toch prachtig {1}!',
            '{1} Oooohhh!! 😍',
            'Wow heel nice {1}!',
            '{1} JAAAAA DIE IS LEUK!!',
            'Omg die is zo leuk {1}!',
            '{1} Noooouuuuu!!!',
            'Die is echt heel ziek {1}!!',
            'Echt mooi getekend {1}! Misschien maak ik er wel een kaartje van...',
            'Heb jij die getekend?! Echt super mooi!',
            '{1} Als jouw tekening een frikandel was, dan was het een frikandel speciaal',
            '{1} In welk museum hangt dit? Of... wacht, is dit JOUW tekening?!',
            '{1} WAAAUUUUUWWW!!!',
            'Hoe kan jij zo goed tekenen {1}?! Ik ben zoooo jaloers!',
            '{1} Leer mij tekenen alsjeblieft! Tenzij ik er voor moet oefenen, laat dan maar zitten...',
            '{1} Mag ik deze ophangen? Recht voor mijn hoofd bedoel ik, zodat ik er heel de dag naar kan kijken.',
        ];

        MessageService.SendMessageToArtChannel(messages.randomChoice().replace('{1}', messageInfo.member.user.toString()));
    }
}