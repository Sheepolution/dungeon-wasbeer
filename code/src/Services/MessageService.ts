import DiscordService from './DiscordService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { TextChannel, MessageEmbed } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';

export default class MessageService {

    public static SendMessage(messageInfo:IMessageInfo, message:string, good?:boolean, mention?:boolean, embed?:MessageEmbed) {
        if (good != null) {
            message = (good ?  EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + message;
        }
        if (mention != false) {
            DiscordService.ReplyMessage(<TextChannel>messageInfo.channel, messageInfo.member, message, embed)
        } else {
            DiscordService.SendMessage(<TextChannel>messageInfo.channel, message, embed)
        }
    }

    public static SendEmbed(messageInfo:IMessageInfo, embed:MessageEmbed, content?:string) {
        DiscordService.SendEmbed(messageInfo.channel, embed, content)
    }

    public static SendMessageToMainChannel(messageInfo:IMessageInfo, content:string) {
        this.SendMessage(messageInfo, content, undefined, false);
    }

    public static SendMissingAssignedArguments(messageInfo:IMessageInfo, missing:Array<string>) {
        this.SendMessage(messageInfo, 'Je vergeet één of meerdere parameters:\n' + missing.join(', ') , false, true);
    }

    public static SendAssignedArgumentsParseError(messageInfo:IMessageInfo) {
        this.SendMessage(messageInfo, 'Ik kon de parameters van je bericht niet verwerken.\nZorg dat dit het juiste format aanhoudt.\n\nVoorbeeld:\n;commando -voorbeeld Dit is een voorbeeld -getal 123', false, true);
    }

    public static SendNoImageAttached(messageInfo:IMessageInfo) {
        this.SendMessage(messageInfo, 'Zorg dat je een afbeelding meegeeft van het formaat .png, .jpg of .jpeg.', false, true);
    }

    public static SendMissingCardName(messageInfo:IMessageInfo) {
        MessageService.SendMessage(messageInfo, 'Ik mis de naam van de kaart.', false);
    }

    public static SendNotOwningCard(messageInfo:IMessageInfo, name:string) {
        MessageService.SendMessage(messageInfo, 'Je hebt geen kaart met de naam \'' + name + '\'.', false, true);
    }
}