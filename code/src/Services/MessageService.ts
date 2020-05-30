import DiscordService from './DiscordService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { TextChannel, MessageEmbed } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import BotManager from '../Managers/BotManager';

export default class MessageService {

    public static async ReplyMessage(messageInfo:IMessageInfo, message:string, good?:boolean, mention?:boolean, embed?:MessageEmbed) {
        if (good != null) {
            message = (good ?  EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + message;
        }
        if (mention != false) {
            return DiscordService.ReplyMessage(<TextChannel>messageInfo.channel, messageInfo.member, message, embed)
        } else {
            return DiscordService.SendMessage(<TextChannel>messageInfo.channel, message, embed)
        }
    }

    public static async ReplyEmbed(messageInfo:IMessageInfo, embed:MessageEmbed, message?:string) {
        return DiscordService.SendEmbed(messageInfo.channel, embed, message)
    }

    public static async SendMessageToCardChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetCardChannel(), message, embed);
    }

    public static async SendMessageToDNDChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetDNDChannel(), message, embed);
    }

    public static async SendMessageToChatChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetChatChannel(), message, embed);
    }

    public static async SendMessageToLogChannel(message:string) {
        return await this.SendMessage(BotManager.GetLogChannel(), message);
    }

    public static async ReplyMissingAssignedArguments(messageInfo:IMessageInfo, missing:Array<string>) {
        this.ReplyMessage(messageInfo, 'Je vergeet één of meerdere parameters:\n' + missing.join(', ') , false, true);
    }

    public static async ReplyAssignedArgumentsParseError(messageInfo:IMessageInfo) {
        this.ReplyMessage(messageInfo, 'Ik kon de parameters van je bericht niet verwerken.\nZorg dat dit het juiste format aanhoudt.\n\nVoorbeeld:\n;commando -voorbeeld Dit is een voorbeeld -getal 123', false, true);
    }

    public static async ReplyNoImageAttached(messageInfo:IMessageInfo) {
        this.ReplyMessage(messageInfo, 'Zorg dat je een afbeelding meegeeft van het formaat .png, .jpg of .jpeg.', false, true);
    }

    public static async ReplyMissingCardName(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Ik mis de naam van de kaart.', false);
    }

    public static async ReplyNotOwningCard(messageInfo:IMessageInfo, name:string) {
        MessageService.ReplyMessage(messageInfo, 'Je hebt geen kaart met de naam \'' + name + '\'.', false, true);
    }

    private static async SendMessage(channel:TextChannel, message:string, embed?:MessageEmbed) {
        return await DiscordService.SendMessage(channel, message, embed)
    }
}
