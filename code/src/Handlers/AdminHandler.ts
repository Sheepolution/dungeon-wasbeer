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
import CardService from '../Services/CardService';
import { ClassType } from '../Enums/ClassType';
import CampaignManager from '../Managers/CampaignManager';
import { LogType } from '../Enums/LogType';
import LogService from '../Services/LogService';
import PlayerCard from '../Objects/PlayerCard';
import PlayerManager from '../Managers/PlayerManager';
import DiscordService from '../Services/DiscordService';

export default class AdminHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>, content:string) {
        switch (command) {
            case 'restart-the-bot':
                this.RestartTheBot(messageInfo, player);
        }

        if (messageInfo.message?.guild?.id != SettingsConstants.ADMIN_GUILD_ID) {
            return;
        }

        switch (command) {
            case 'start-campaign':
            case 'startcampaign':
                this.StartCampaign();
                break;
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
            case 'say-card':
            case 'saycard':
                this.SayMessageCard(messageInfo, content, player);
                break;
            case 'say-dnd':
            case 'saydnd':
                this.SayMessageDND(messageInfo, content, player);
                break;
            case 'say-chat':
            case 'saychat':
                this.SayMessageChat(messageInfo, content, player);
                break;
            case 'give-card':
            case 'givecard':
                this.GiveCard(messageInfo, args[0], args, player)
                break;
            default:
                return false;
        }

        return true;
    }

    private static async RestartTheBot(messageInfo:IMessageInfo, player:Player) {
        if (SettingsConstants.CAN_RESTART_BOT_IDS.includes(messageInfo.message?.author.id || '')) {
            try {
                await LogService.Log(player, player.GetId(), LogType.BotRestarted, `${player.GetDiscordName()} heeft de bot opnieuw laten opstarten.`);
                await MessageService.ReplyMessage(messageInfo, 'Oké ik ben even weg en zou over 5 seconden weer terug moeten zijn.', true, true);
            } catch (error:any) {
                // Error
            }

            process.kill(process.pid);
        } else {
            MessageService.ReplyMessage(messageInfo, 'Sorry, je bent niet een van de mensen die mij mag restarten', false, true);
        }
    }

    private static async ResetAllCache(messageInfo:IMessageInfo) {
        await BotManager.ResetAllCache();
        MessageService.ReplyMessage(messageInfo, 'Alle cache is gereset.', true);
    }

    private static async SayMessageCard(messageInfo:IMessageInfo, message:string, player:Player) {
        await MessageService.SendMessageToCardChannel(message);
        MessageService.ReplyMessage(messageInfo, 'Ik heb het gezegd.', true, true);
        LogService.Log(player, player.GetId(), LogType.SayMessage, `${player.GetDiscordName()} zegt het bericht '${message}' in het kaarten-kanaal.`);
    }

    private static async SayMessageDND(messageInfo:IMessageInfo, message:string, player:Player) {
        await MessageService.SendMessageToDNDChannel(message);
        MessageService.ReplyMessage(messageInfo, 'Ik heb het gezegd.', true, true);
        LogService.Log(player, player.GetId(), LogType.SayMessage, `${player.GetDiscordName()} zegt het bericht '${message}' in het D&D-kanaal.`);
    }

    private static async SayMessageChat(messageInfo:IMessageInfo, message:string, player:Player) {
        await MessageService.SendMessageToChatChannel(message);
        MessageService.ReplyMessage(messageInfo, 'Ik heb het gezegd.', true, true);
        LogService.Log(player, player.GetId(), LogType.SayMessage, `${player.GetDiscordName()} zegt het bericht '${message}' in het chat-kanaal.`);
    }

    private static async GiveCard(messageInfo:IMessageInfo, receiverId:string, args:Array<string>, player:Player) {
        if (messageInfo.message == null) {
            return;
        }

        const guild = await DiscordService.FindGuild(SettingsConstants.MAIN_GUILD_ID);
        if (guild == null) {
            return;
        }

        const member = await DiscordService.FindMember(receiverId, guild);
        if (member == null) {
            MessageService.ReplyMessage(messageInfo, `Ik kan niemand vinden met het id of naam ${receiverId}`, false, true);
            return;
        }

        const receiver = await PlayerManager.GetPlayer(member.id, member.displayName);
        if (receiver == null) {
            return;
        }

        args.shift();
        const message = args.join(' ');

        const cardModifyResult = await CardManager.GivePlayerCard(receiver);
        const playerCard = <PlayerCard>cardModifyResult.object;
        const oldChannel = messageInfo.channel;
        const oldMember = messageInfo.member;
        messageInfo.channel = BotManager.GetCardChannel();
        messageInfo.member = member;
        var cardMessage = await MessageService.ReplyMessage(messageInfo, message, undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
        CardManager.OnCardMessage(cardMessage, playerCard);

        if (cardModifyResult.result) {
            LogService.Log(receiver, playerCard.GetCardId(), LogType.CardReceivedGiven, `${receiver.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen.`);
        } else {
            LogService.Log(receiver, playerCard.GetCardId(), LogType.CardReceivedGiven, `${receiver.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen, en heeft daar nu ${playerCard.GetAmount()} van.`);
        }

        messageInfo.channel = oldChannel;
        messageInfo.member = oldMember;

        MessageService.ReplyMessage(messageInfo, 'Ik heb de kaart gegeven.', true, true);
        LogService.Log(player, receiver.GetId(), LogType.GiveCard, `${player.GetDiscordName()} geeft aan kaart aan ${receiver.GetDiscordName()} met het bericht '${message}'.`);
    }

    private static async StartCampaign() {
        CampaignManager.StartNewSession()
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
        const required = ['n', 'b', 'c', 'l'];
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

        const cardModifyResult = await CardManager.AddNewCard(args.n, args.b, args.l, args.c, attachment?.proxyURL, player.GetId(), modifiers, modifierClass);
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
        }

        if (args.mc) {
            modifierClass = (<any>ClassType)[args.mc.toTitleCase()];
            if (modifierClass == null) {
                MessageService.ReplyMessage(messageInfo, `'${args.mc}' is geen bestaande class.\nKies uit Bard, Cleric, Wizard, Paladin, Fighter en Ranger.`);
                return;
            }
        }

        const cardModifyResult = await CardManager.EditCard(args.on, args.n, args.b, args.l, args.c, modifiers, modifierClass, attachment?.proxyURL);
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
        const required = ['n', 'b', 'c', 'l', 'h', 's', 'a', 'ab', 'abc'];
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

        const type = AttackType.Physical;

        const objectModifyResult = await MonsterManager.AddNewMonster(args.n, args.b, args.l, args.c, type, args.h, args.s, args.a, args.ab, args.abc, attachment?.proxyURL, player.GetId());
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

        const monsterModifyResult = await MonsterManager.EditMonster(args.on, args.n, args.b, args.l, args.c, args.t, args.h, args.s, args.a, args.ab, args.abc)
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