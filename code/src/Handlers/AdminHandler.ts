import CommandUtils from '../Utils/CommandUtils';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import BotManager from '../Managers/BotManager';
import SettingsConstants from '../Constants/SettingsConstants';
import MessageService from '../Services/MessageService';
import Card from '../Objects/Card';
import CardEmbeds from '../Embeds/CardEmbeds';
import DiscordService from '../Services/DiscordService';
import CardModel from '../Models/CardModel';
import CardManager from '../Managers/CardManager';

export default class AdminHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>, content:string) {
        if (messageInfo.message?.guild?.id != SettingsConstants.ADMIN_GUILD_ID) {
            return;
        }

        switch (command) {
            case 'add':
                this.AddNewCard(messageInfo, player, CommandUtils.GetAssignedArguments(content));
                break;
            case 'edit':
                this.EditCard(messageInfo, CommandUtils.GetAssignedArguments(content));
                break;
            case 'stats':
                this.SendCardStats(messageInfo);
                break;
            case 'card':
                this.SendCard(messageInfo, args[0]);
                break;
            case 'random':
                this.SendRandomCard(messageInfo);
                break;
            case 'refresh':
                this.ResetAllCache(messageInfo);
                break;
            case 'say':
                this.SayMessage(content);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async AddNewCard(messageInfo:IMessageInfo, player:Player, args:any) {
        if (args == null) {
            MessageService.SendAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment == null || !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.SendNoImageAttached(messageInfo);
            return;
        }

        const argKeys = Object.keys(args);
        const required = ['n', 'b', 'c', 'r'];
        const missing = [];
        for (const key of required) {
            if (!argKeys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            MessageService.SendMissingAssignedArguments(messageInfo, missing);
            return;
        }

        const cardModifyResult = await CardManager.AddNewCard(args.n, args.b, args.r, args.c, attachment?.proxyURL, player.GetId());
        if (cardModifyResult.result) {
            MessageService.SendMessage(messageInfo, 'De kaart is toegevoegd!', true, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.card));
        } else {
            MessageService.SendMessage(messageInfo, 'Er is al een kaart met deze naam in deze categorie!', false, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.card));
        }
    }

    private static async EditCard(messageInfo:IMessageInfo, args:any) {
        if (args == null) {
            MessageService.SendAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment != null && !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.SendNoImageAttached(messageInfo);
            return;
        }

        const arg_keys = Object.keys(args);
        const required = ['on'];
        const missing = [];
        for (const key of required) {
            if (!arg_keys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            MessageService.SendMissingAssignedArguments(messageInfo, missing);
            return;
        }

        const cardModifyResult = await CardManager.EditCard(args.on, args.n, args.b, args.r, args.c)
        if (cardModifyResult.result) {
            MessageService.SendMessage(messageInfo, 'De kaart is aangepast!', true, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.card));
        } else {
            MessageService.SendMessage(messageInfo, 'Er is geen kaart met de naam \'' + args.on + '\'.', false, true);
        }
    }

    private static async SendCard(messageInfo:IMessageInfo, name:string) {
        if (name == null) {
            this.SendRandomCard(messageInfo);
            return;
        }

        var card = new Card();
        if (!await card.FIND_BY_NAME(name)) {
            MessageService.SendMessage(messageInfo, 'Je hebt geen kaart met de naam \'' + name + '\'.', false, true);
            return;
        }

        this.SendCardEmbed(messageInfo, card);
    }

    private static async SendCardStats(messageInfo:IMessageInfo) {
        const cards:any = await Card.GET_ALL();
        MessageService.SendEmbed(messageInfo, CardEmbeds.GetCardStatsEmbed(cards));
    }

    private static async SendRandomCard(messageInfo:IMessageInfo) {
        const card_models:CardModel = await Card.GET_ALL();
        var cardModel = card_models.randomChoice();
        var card = new Card();
        card.ApplyModel(cardModel);
        this.SendCardEmbed(messageInfo, card);
    }

    private static async ResetAllCache(messageInfo:IMessageInfo) {
        await BotManager.ResetAllCache();
        MessageService.SendMessage(messageInfo, 'Alle cache is gereset.', true);
    }

    private static async SayMessage(message:string) {
        MessageService.SendMessageToMainChannel(message);
    }

    private static async SendCardEmbed(messageInfo:IMessageInfo, card:Card) {
        MessageService.SendEmbed(messageInfo, CardEmbeds.GetCardEmbed(card));
    }
}