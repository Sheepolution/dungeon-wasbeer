import IMessageInfo from '../Interfaces/IMessageInfo';
import { ReactionMessageType } from '../Enums/ReactionMessageType';
import { MessageReaction, Message, User } from 'discord.js';
import { Utils } from '../Utils/Utils';
import PlayerCardHandler from '../Handlers/PlayerCardHandler';
import CardManager from './CardManager';

export default class ReactionManager {

    private static messages:any = {};

    public static AddMessage(message:Message, reactionMessageType:ReactionMessageType, messageInfo?:IMessageInfo, values?:any) {
        const id = message.id;
        const timeout = setTimeout(() => {
            message.reactions.removeAll();
            delete ReactionManager.messages[id];
        }, Utils.GetMinutesInMiliSeconds(5));

        ReactionManager.messages[id] = {message:message, messageInfo: messageInfo, reactionMessageType: reactionMessageType, timeout: timeout, values: values};
    }

    public static OnReaction(reaction:MessageReaction, user:User) {
        const obj = ReactionManager.messages[reaction.message.id];
        if (obj == null) {
            return;
        }

        if (obj.messageInfo && user.id != obj.messageInfo.member.id && (!obj.requester || user.id != obj.requester.id)) {
            return;
        }

        clearTimeout(obj.timeout)

        obj.timeout = setTimeout(() => {
            obj.message.reactions.removeAll();
            delete ReactionManager.messages[obj.message.id];
        }, Utils.GetMinutesInMiliSeconds(5));

        switch (obj.reactionMessageType) {
            case ReactionMessageType.PlayerCardList:
                PlayerCardHandler.OnReaction(obj, reaction);
                break;
            case ReactionMessageType.PlayerCardGet:
                CardManager.OnReaction(obj, reaction, user);
                break;
        }
    }
}