import CommandUtils from '../Utils/CommandUtils';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import BotManager from '../Managers/BotManager';
import SettingsConstants from '../Constants/SettingsConstants';
import MessageService from '../Services/MessageService';
import Card from '../Objects/Card';
import CardEmbeds from '../Embeds/CardEmbeds';
import CardModel from '../Models/CardModel';
import CardManager from '../Managers/CardManager';
import MonsterManager from '../Managers/MonsterManager';
import { AttackType } from '../Enums/AttackType';
import Monster from '../Objects/Monster';
import MonsterEmbeds from '../Embeds/MonsterEmbeds';
import MonsterModel from '../Models/MonsterModel';
import { ModifierType } from '../Enums/ModifierType';
import CardService from '../Services/CardService';
import { ClassType } from '../Enums/ClassType';

export default class AdminHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>, content:string) {
        if (messageInfo.message?.guild?.id != SettingsConstants.ADMIN_GUILD_ID) {
            return;
        }

        switch (command) {
            case 'addcard':
            case 'add-card':
                this.AddNewCard(messageInfo, player, CommandUtils.GetAssignedArguments(content));
                break;
            case 'edit-card':
            case 'editcard':
                this.EditCard(messageInfo, CommandUtils.GetAssignedArguments(content));
                break;
            case 'addmonster':
            case 'add-monster':
                this.AddNewMonster(messageInfo, player, CommandUtils.GetAssignedArguments(content));
                break;
            case 'edit-monster':
            case 'editmonster':
                this.EditMonster(messageInfo, CommandUtils.GetAssignedArguments(content));
                break;
            case 'card-stats':
            case 'cardstats':
                this.SendCardStats(messageInfo);
                break;
            case 'card':
                this.SendCard(messageInfo, args[0]);
                break;
            case 'random-card':
                this.SendRandomCard(messageInfo);
                break;
            case 'monster':
                this.SendMonster(messageInfo, args[0]);
                break;
            case 'random-monster':
                this.SendRandomMonster(messageInfo);
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

    private static async ResetAllCache(messageInfo:IMessageInfo) {
        await BotManager.ResetAllCache();
        MessageService.ReplyMessage(messageInfo, 'Alle cache is gereset.', true);
    }

    private static async SayMessage(message:string) {
        MessageService.SendMessageToCardChannel(message);
    }

    // CARDS ////////////////

    private static async AddNewCard(messageInfo:IMessageInfo, player:Player, args:any) {
        if (args == null) {
            MessageService.ReplyAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment == null || !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.ReplyNoImageAttached(messageInfo);
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
            MessageService.ReplyMissingAssignedArguments(messageInfo, missing);
            return;
        }

        var modifiers, modifierClass;
        if (args.m) {
            modifiers = CardService.ParseModifierStringToArray(args.m);
            if (modifiers == null) {
                MessageService.ReplyMessage(messageInfo, 'Ik kan de modifiers niet parsen. Zorg dat je het juist formaat aanhoudt:\nattack=2/health=3')
                return;
            }

            if (args.mc) {
                modifierClass = (<any>ModifierType)[args.mc.toTitleCase()];
                if (modifierClass == null) {
                    MessageService.ReplyMessage(messageInfo, `'${args.mc}' is geen bestaande class.\nKies uit Bard, Cleric, Wizard, Paladin, Fighter en Ranger.`);
                    return;
                }
            }
        }

        const cardModifyResult = await CardManager.AddNewCard(args.n, args.b, args.r, args.c, attachment?.proxyURL, player.GetId(), modifiers, modifierClass);
        if (cardModifyResult.result) {
            MessageService.ReplyMessage(messageInfo, 'De kaart is toegevoegd!', true, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.object));
        } else {
            MessageService.ReplyMessage(messageInfo, 'Er is al een kaart met deze naam in deze categorie!', false, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.object));
        }
    }

    private static async EditCard(messageInfo:IMessageInfo, args:any) {
        if (args == null) {
            MessageService.ReplyAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment != null && !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.ReplyNoImageAttached(messageInfo);
            return;
        }

        const argKeys = Object.keys(args);
        const required = ['on'];
        const missing = [];
        for (const key of required) {
            if (!argKeys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            MessageService.ReplyMissingAssignedArguments(messageInfo, missing);
            return;
        }

        var modifiers, modifierClass;
        if (args.m) {
            modifiers = CardService.ParseModifierStringToArray(args.m);
            if (modifiers == null) {
                MessageService.ReplyMessage(messageInfo, 'Ik kan de modifiers niet parsen. Zorg dat je het juist formaat aanhoudt:\nattack=2/health=3')
                return;
            }

            if (args.mc) {
                modifierClass = (<any>ClassType)[args.mc.toTitleCase()];
                if (modifierClass == null) {
                    MessageService.ReplyMessage(messageInfo, `'${args.mc}' is geen bestaande class.\nKies uit Bard, Cleric, Wizard, Paladin, Fighter en Ranger.`);
                    return;
                }
            }
        }

        const cardModifyResult = await CardManager.EditCard(args.on, args.n, args.b, args.r, args.c, modifiers, modifierClass, attachment?.proxyURL);
        if (cardModifyResult.result) {
            MessageService.ReplyMessage(messageInfo, 'De kaart is aangepast!', true, true, CardEmbeds.GetCardEmbed(<Card>cardModifyResult.object));
        } else {
            MessageService.ReplyMessage(messageInfo, 'Er is geen kaart met de naam \'' + args.on + '\'.', false, true);
        }
    }

    private static async SendCard(messageInfo:IMessageInfo, name:string) {
        if (name == null) {
            this.SendRandomCard(messageInfo);
            return;
        }

        var card = new Card();
        if (!await card.FIND_BY_NAME(name)) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt geen kaart met de naam \'' + name + '\'.', false, true);
            return;
        }

        this.SendCardEmbed(messageInfo, card);
    }

    private static async SendCardStats(messageInfo:IMessageInfo) {
        const cards:any = await Card.GET_ALL();
        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetCardStatsEmbed(cards));
    }

    private static async SendRandomCard(messageInfo:IMessageInfo) {
        const cardModels:CardModel = await Card.GET_ALL();
        var cardModel = cardModels.randomChoice();
        var card = new Card();
        card.ApplyModel(cardModel);
        this.SendCardEmbed(messageInfo, card);
    }

    private static async SendCardEmbed(messageInfo:IMessageInfo, card:Card) {
        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetCardEmbed(card));
    }

    // MONSTERS ////////////////

    private static async AddNewMonster(messageInfo:IMessageInfo, player:Player, args:any) {
        if (args == null) {
            MessageService.ReplyAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment == null || !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.ReplyNoImageAttached(messageInfo);
            return;
        }

        const argKeys = Object.keys(args);
        const required = ['n', 'b', 'c', 't', 'l', 'h', 's', 'a', 'ab'];
        const missing = [];
        for (const key of required) {
            if (!argKeys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            MessageService.ReplyMissingAssignedArguments(messageInfo, missing);
            return;
        }

        const type = (<any>AttackType)[args.t];

        if (type == null) {
            MessageService.ReplyMessage(messageInfo, '', false);
            return;
        }

        const objectModifyResult = await MonsterManager.AddNewMonster(args.n, args.b, args.l, args.c, type, args.h, args.s, args.a, args.ab, attachment?.proxyURL, player.GetId());
        if (objectModifyResult.result) {
            MessageService.ReplyMessage(messageInfo, 'Het monster is toegevoegd!', true, true, MonsterEmbeds.GetMonsterEmbed(<Monster>objectModifyResult.object));
        } else {
            MessageService.ReplyMessage(messageInfo, 'Er is al een monster met deze naam!', false, true, MonsterEmbeds.GetMonsterEmbed(<Monster>objectModifyResult.object));
        }
    }

    private static async EditMonster(messageInfo:IMessageInfo, args:any) {
        if (args == null) {
            MessageService.ReplyAssignedArgumentsParseError(messageInfo);
            return;
        }

        const attachment = messageInfo.message?.attachments.first();
        if (attachment != null && !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            MessageService.ReplyNoImageAttached(messageInfo);
            return;
        }

        const argKeys = Object.keys(args);
        const required = ['on'];
        const missing = [];
        for (const key of required) {
            if (!argKeys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            MessageService.ReplyMissingAssignedArguments(messageInfo, missing);
            return;
        }

        const monsterModifyResult = await MonsterManager.EditMonster(args.on, args.n, args.b, args.l, args.c, args.t, args.h, args.s, args.a, args.ab)
        if (monsterModifyResult.result) {
            MessageService.ReplyMessage(messageInfo, 'Het monster is aangepast!', true, true, MonsterEmbeds.GetMonsterEmbed(<Monster>monsterModifyResult.object));
        } else {
            MessageService.ReplyMessage(messageInfo, 'Er is geen monster met de naam \'' + args.on + '\'.', false, true);
        }
    }

    private static async SendMonster(messageInfo:IMessageInfo, name:string) {
        if (name == null) {
            this.SendRandomMonster(messageInfo);
            return;
        }

        var monster = new Monster();
        if (!await monster.FIND_BY_NAME(name)) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt geen monster met de naam \'' + name + '\'.', false, true);
            return;
        }

        this.SendMonsterEmbed(messageInfo, monster);
    }

    private static async SendRandomMonster(messageInfo:IMessageInfo) {
        const monsterModels:MonsterModel = await Monster.GET_ALL();
        var monsterModel = monsterModels.randomChoice();
        var monster = new Monster();
        monster.ApplyModel(monsterModel);
        this.SendMonsterEmbed(messageInfo, monster);
    }

    private static async SendMonsterEmbed(messageInfo:IMessageInfo, monster:Monster) {
        MessageService.ReplyEmbed(messageInfo, MonsterEmbeds.GetMonsterEmbed(monster));
    }
}