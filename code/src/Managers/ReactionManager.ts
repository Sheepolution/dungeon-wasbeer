import IMessageInfo from '../Interfaces/IMessageInfo';
import { ReactionMessageType } from '../Enums/ReactionMessageType';
import { MessageReaction, Message, User } from 'discord.js';
import { Utils } from '../Utils/Utils';
import PlayerCardHandler from '../Handlers/PlayerCardHandler';

export default class ReactionManager {

    private static messages:any = {};

    public static AddMessage(message:Message, messageInfo:IMessageInfo, reactionMessageType:ReactionMessageType, value:any) {
        if (messageInfo.message == null) {
            return;
        }

        const id = message.id;
        const timeout = setTimeout(() => {
            message.reactions.removeAll();
            delete ReactionManager.messages[id];
        }, Utils.GetMinutesInMiliSeconds(2));

        ReactionManager.messages[id] = {message:message, messageInfo: messageInfo, reactionMessageType: reactionMessageType, timeout: timeout, value: value};
    }

    public static OnReaction(reaction:MessageReaction, user:User) {
        const obj = ReactionManager.messages[reaction.message.id];
        if (obj == null) {
            return;
        }

        if (user.id != obj.messageInfo.member.id) {
            return;
        }

        clearTimeout(obj.timeout)

        obj.timeout = setTimeout(() => {
            obj.message.reactions.removeAll();
            delete ReactionManager.messages[obj.message.id];
        }, Utils.GetMinutesInMiliSeconds(2));

        if (obj.reactionMessageType == ReactionMessageType.PlayerCardList) {
            PlayerCardHandler.OnReaction(obj, reaction);
        }
    }
}