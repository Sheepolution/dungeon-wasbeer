import Player from '../Objects/Player';
import { ClassType } from '../Enums/ClassType';
import MessageService from '../Services/MessageService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Character from '../Objects/Character';
import CharacterEmbeds from '../Embeds/CharacterEmbeds';
import PlayerManager from '../Managers/PlayerManager';
import DiscordUtils from '../Utils/DiscordUtils';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
import { Utils } from '../Utils/Utils';
import { Message } from 'discord.js';
import Heal from '../Objects/Heal';
import CampaignManager from '../Managers/CampaignManager';
import CharacterConstants from '../Constants/CharacterConstants';
import CardEmbeds from '../Embeds/CardEmbeds';
import { LogType } from '../Enums/LogType';
import LogService from '../Services/LogService';
import SettingsConstants from '../Constants/SettingsConstants';

export default class CharacterHandler {

    private static readonly classNames = Object.keys(ClassType);
    private static readonly  resetConfirmTimerPrefix = RedisConstants.REDIS_KEY + RedisConstants.RESET_CONFIRM_TIMER_KEY;

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>, content:string) {
        if (command == 'class') {
            this.CreateCharacter(messageInfo, player, args[0]);
            return;
        }

        switch (command) {
            case 'info':
                this.SendCharacterInfo(messageInfo, player);
                break;
            case 'character':
            case 'ik':
            case 'me':
                this.SendCharacterDescription(messageInfo, player);
                break;
            case 'cooldowns':
            case 'cooldown':
            case 'cd':
                this.SendCooldownsInfo(messageInfo, player);
                break;
            case 'stats':
            case 'statistieken':
                this.SendStatsInfo(messageInfo, player);
                break;
            case 'history':
            case 'geschiedenis':
            case 'verleden':
                this.SendHistoryInfo(messageInfo, player);
                break;
            case 'lijst':
            case 'kaarten':
                this.SendCardList(messageInfo, player);
                break;
            case 'equipment':
                this.SendEquipment(messageInfo, player);
                break;
            case 'equip':
                this.Equip(messageInfo, player, args[0]);
                break;
            case 'unequip':
                this.Unequip(messageInfo, player, args[0]);
                break;
            case 'heal':
                this.OnHeal(messageInfo, player, args[0]);
                break;
            case 'sos':
            case 'health':
                this.ShowLowestHealth(messageInfo);
                break;
            case 'inspireer':
            case 'inspire':
                this.OnInspire(messageInfo, player, args[0]);
                break;
            case 'art':
            case 'avatar':
            case 'oc':
                this.EditAvatar(messageInfo, player, content);
                break;
            case 'lore':
            case 'description':
            case 'beschrijving':
                this.EditLore(messageInfo, player, content);
                break;
            case 'name':
            case 'naam':
                this.EditName(messageInfo, player, content);
                break;
            case 'reset':
                this.OnReset(messageInfo, player);
                break;
            case 'ikweetzekerdatikwilstoppenmetditcharacter':
                this.OnResetConfirm(messageInfo, player);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async CreateCharacter(messageInfo:IMessageInfo, player:Player, className:string) {
        const character = player.GetCharacter();
        if (character != null) {
            MessageService.ReplyMessage(messageInfo, `Je hebt al een character genaamd ${character.GetName()}. Je kan een nieuw character aanmaken wanneer deze overlijdt, of wanneer je opnieuw begint met \`;reset\`.`, false);
            return;
        }

        if (className == null) {
            this.SendUnknownClassName(messageInfo);
            return;
        }

        className = className.toTitleCase();

        if (!this.classNames.includes(className)) {
            this.SendUnknownClassName(messageInfo);
            return;
        }

        const classType = (<any>ClassType)[className];
        const newCharacter = await player.CreateCharacter(classType);
        MessageService.ReplyMessage(messageInfo, 'Je character is aangemaakt!', undefined, true, CharacterEmbeds.GetNewCharacterEmbed(newCharacter));
        LogService.Log(player, newCharacter.GetId(), LogType.CharacterCreated, `${player.GetDiscordName()} heeft een nieuw character aangemaakt van de class ${classType}.`);
    }

    private static async Equip(messageInfo:IMessageInfo, player:Player, cardName:string) {
        // TODO: Dit soort checks doe je ergens anders ook. Dat moet anders kunnen.
        // TODO: Dat je gewoon iets hebt van GetCardFromArgument() ofzo.
        // TODO: Net zoals met het aanmaken/aanpassen van kaarten en monsters. Dat moet minder DRY hebben.
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = character.GetPlayer().FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        const card = playerCard.GetCard();
        const modifierClass = card.GetModifierClass();
        if (modifierClass != null && modifierClass != character.GetClass()) {
            MessageService.ReplyMessage(messageInfo, `Deze kaart is specifiek voor de class ${modifierClass} en jouw class is ${character.GetClass()}.`, false);
            return;
        }

        if (!character.HasEquipmentSpace()) {
            MessageService.ReplyMessage(messageInfo, 'Je equipment zit vol. Haal een kaart weg voordat je er weer een toevoegt.', false);
            return;
        }

        const realCardName = card.GetName();

        if (!card.HasBuffs()) {
            MessageService.ReplyMessage(messageInfo, `Je equipment is alleen voor kaarten met buffs. De kaart '${realCardName}' heeft geen buffs.`, false);
            return;
        }

        if (playerCard.IsEquipped()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit al in je equipment. Je kan maar één van elke kaart in je equipment hebben.`, false);
            return;
        }

        if (playerCard.IsUsedInTrade()) {
            MessageService.ReplyMessage(messageInfo, `Iemand is een ruil gestart met jouw kaart '${realCardName}', dus je kan deze nu niet equippen.`, false);
            return;
        }

        await character.Equip(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is aan je equipment toegevoegd.`, true, true, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async Unequip(messageInfo:IMessageInfo, player:Player, cardName:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = character.GetPlayer().FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        const realCardName = playerCard.GetCard().GetName();

        if (!playerCard.IsEquipped()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit niet in je equipment.`, false);
            return;
        }

        await character.Unequip(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is uit je equipment gehaald.`, true, true, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async OnHeal(messageInfo:IMessageInfo, player:Player, mention:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanHeal()) {
            MessageService.ReplyMessage(messageInfo, `Alleen clerics en paladins kunnen healen, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet healen want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetHealingCooldown();
        if (cooldown > 0) {
            const minutes = Utils.GetSecondsInMinutes(cooldown);
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${minutes + (minutes == 1 ? ' minuut' : ' minuten')} cooldown voordat je weer mag healen.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            const receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt healen moet je die persoon taggen.\n`;heal @persoon`', false);
                return;
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfHeal = receiver == character;
        const healthBefore = receiver.GetCurrentHealth();

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet healen want die is momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsFullHealth()) {
            MessageService.ReplyMessage(messageInfo, `${selfHeal ? 'Je bent' : receiver.GetName() + ' is'} al full health.`, false);
            return;
        }

        const message = await this.SendHealingEmbed(messageInfo, character, receiver);
        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const healing = character.GetHealingBasedOnRoll(roll);

        await receiver.GetHealthFromHealing(healing);
        await character.SetHealingCooldown();
        await this.UpdateHealingEmbed(message, character, receiver, roll, healing)
        await this.SaveHeal(character, receiver, healthBefore, character.GetFullModifierStats().healing, roll, healing);
    }

    private static async ShowLowestHealth(messageInfo:IMessageInfo) {
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetLowestHealthEmbed());
    }

    private static async OnInspire(messageInfo:IMessageInfo, player:Player, mention:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanInspire()) {
            MessageService.ReplyMessage(messageInfo, `Alleen bards kunnen inspireren, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet inspireren want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetInspireCooldown();
        if (cooldown > 0) {
            const minutes = Utils.GetSecondsInMinutes(cooldown);
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${minutes + (minutes == 1 ? ' minuut' : ' minuten')} cooldown voordat je weer mag inspireren.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            const receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt inspireren moet je die persoon taggen.\n`;inspireer @persoon`', false);
                return;
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfInspire = receiver == character;

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet inspireren want die is momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsInspired()) {
            MessageService.ReplyMessage(messageInfo, `${selfInspire ? 'Je bent ' : 'Deze persoon is '}al geïnspireerd.`, false);
            return;
        }

        await character.SetInspireCooldown();
        await receiver.BecomeInspired();
        await MessageService.ReplyMessage(messageInfo, `Je speelt prachtige muziek en inspireert ${selfInspire ? 'jezelf' : receiver.GetName()} ✨. Al ${selfInspire ? 'je' : 'hun'} stats krijgen een +1 boost tot ${selfInspire ? 'je' : 'hun'} volgende gevecht.`, true);
        LogService.Log(character.GetPlayer(), receiver.GetId(), LogType.Inspire, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} geïnspireerd.`);
    }

    private static async SaveHeal(character:Character, receiver:Character, receiverHealth:number, characterHealing:number, roll:number, finalHealing:number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const heal = await Heal.STATIC_POST(battle, character, receiver, receiverHealth, characterHealing, roll, finalHealing);
        LogService.Log(character.GetPlayer(), heal.id, LogType.Heal, `${character.GetName()} heeft een heal gedaan op ${character.GetId() == receiver.GetId() ? 'zichzelf.' : `${receiver.GetName()}.`}`);
    }

    private static async SendHealingEmbed(messageInfo:IMessageInfo, character:Character, receiver:Character) {
        return await MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetHealingEmbed(character, receiver))
    }

    private static async UpdateHealingEmbed(message:Message, character:Character, receiver:Character, roll:number, healing:number) {
        message.edit('', CharacterEmbeds.GetHealingEmbed(character, receiver, roll, healing));
    }

    private static async EditAvatar(messageInfo:IMessageInfo, player:Player, url?:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (url != null && url != '') {
            if (!url.includes('http')) {
                MessageService.ReplyMessage(messageInfo, 'Zorg dat de url die je meegeeft begint met \'http\'.', false);
                return;
            }
        } else {
            const attachment = messageInfo.message?.attachments.first();
            if (attachment == null || !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
                MessageService.ReplyNoImageAttached(messageInfo);
                return;
            }
            url = attachment.url;
        }

        await character.UpdateAvatarUrl(url);
        MessageService.ReplyMessage(messageInfo, 'De avatar van je character is aangepast.', true, true, await CharacterEmbeds.GetCharacterInfoEmbed(character));
    }

    private static async EditLore(messageInfo:IMessageInfo, player:Player, lore:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (lore == null || lore == '') {
            MessageService.ReplyMessage(messageInfo, 'Zorg dat je een lore meegeeft. `;lore [lore]`', false);
            return;
        }

        if (lore.length > 500) {
            MessageService.ReplyMessage(messageInfo, 'Je lore mag niet langer dan 500 tekens zijn.', false);
            return;
        }

        await character.UpdateLore(lore);
        MessageService.ReplyMessage(messageInfo, 'De lore van je character is aangepast.', true, true, await CharacterEmbeds.GetCharacterInfoEmbed(character));

    }

    private static async EditName(messageInfo:IMessageInfo, player:Player, name:string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (name.length > 50) {
            MessageService.ReplyMessage(messageInfo, 'De naam van je character mag niet langer zijn dan 50 tekens.', false);
            return;
        }

        await character.UpdateName(name);
        MessageService.ReplyMessage(messageInfo, `Je naam is aangepast naar ${name}.`);
    }

    private static async OnReset(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        this.SetResetCharacterTimer(character);

        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetResetCharacterWarningEmbed());
    }

    private static async OnResetConfirm(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        const timer = await this.GetResetCharacterTimer(character);
        if (timer <= 0) {
            return;
        }

        await character.Stop()

        MessageService.ReplyMessage(messageInfo, 'Je character heeft de party verlaten.\nJe kan een nieuw character maken met `;class [class]`', true);
        LogService.Log(character.GetPlayer(), character.GetId(), LogType.CharacterStop, `${character.GetName()} is gestopt.`);
    }

    private static async GetResetCharacterTimer(character:Character) {
        return await Redis.ttl(CharacterHandler.resetConfirmTimerPrefix + character.GetId());
    }

    private static async SetResetCharacterTimer(character:Character) {
        await Redis.set(CharacterHandler.resetConfirmTimerPrefix + character.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(CharacterConstants.RESET_CHARACTER_TIMER_DURATION));
    }

    private static async SendCharacterInfo(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterInfoEmbed(character));
    }

    private static async SendCooldownsInfo(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterCooldownsEmbed(character));
    }

    private static async SendStatsInfo(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterStatsEmbed(character));
    }

    private static async SendHistoryInfo(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterHistoryEmbed(character));
    }

    private static async SendCardList(messageInfo:IMessageInfo, player:Player) {
        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(player))
    }

    private static async SendEquipment(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async SendUnknownClassName(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, `Kies een van de volgende classes:\n${this.classNames.join(', ')}`, false);
    }

    private static async ReplyNotFullHealth(messageInfo:IMessageInfo, character:Character) {
        MessageService.ReplyMessage(messageInfo, `Je mag dit alleen doen wanneer je full health bent.\nHealth: ${character.GetCurrentHealth()}/${character.GetMaxHealth()}`, false);
    }
}