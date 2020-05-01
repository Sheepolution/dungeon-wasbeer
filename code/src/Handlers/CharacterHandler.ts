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

export default class CharacterHandler {

    private static readonly classNames = Object.keys(ClassType);
    private static readonly  healingCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.HEALING_COOLDOWN_KEY;

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>) {
        if (command == 'class') {
            this.ChooseClass(messageInfo, player, args[0]);
            return;
        }

        switch (command) {
            case 'stats':
                this.SendModifierStats(messageInfo, player);
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
                this.OnHeal(messageInfo, player, args[0])
                break;
            default:
                return false;
        }

        return true;
    }

    private static async ChooseClass(messageInfo:IMessageInfo, player:Player, className:string) {
        const character = player.GetCharacter();
        if (character != null) {
            const characterClassName = character.GetClassName();
            MessageService.ReplyMessage(messageInfo, `Je hebt al een character van de class ${characterClassName}. Je kan een nieuw character aanmaken wanneer deze overlijdt, of wanneer je opnieuw begint met \`;reset\`.`, false);
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

        if (!character.HasEquipmentSpace()) {
            MessageService.ReplyMessage(messageInfo, 'Je equipment zit vol. Haal een kaart weg voordat je er weer een toevoegt.', false);
            return;
        }

        const realCardName = playerCard.GetCard().GetName();

        if (!playerCard.GetCard().HasBuffs()) {
            MessageService.ReplyMessage(messageInfo, `Je equipment is alleen voor kaarten met buffs. De kaart '${realCardName}' heeft geen buffs.`, false);
            return;
        }

        if (playerCard.IsEquipped()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit al in je equipment. Je kan maar één van elke kaart in je equipment hebben.`, false);
            return;
        }

        if (playerCard.IsUsedInTrade()) {
            MessageService.ReplyMessage(messageInfo, `Iemand is een ruil gestart met jouw kaart '${realCardName}', dus je kan deze nu niet equipment.`, false);
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

        const cooldown = await this.GetHealingCooldown(character);
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

        if (receiver.IsFullHealth()) {
            MessageService.ReplyMessage(messageInfo, `${selfHeal ? 'Je bent' : receiver.GetName() + ' is'} al full health.`, false);
            return;
        }

        const message = await this.SendHealingEmbed(messageInfo, character, receiver);
        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const healing = character.GetHealingBasedOnRoll(roll);

        await receiver.GetHealthFromHealing(healing);
        await this.SetHealingCooldown(character);
        await this.UpdateHealingEmbed(message, character, receiver, roll, healing)
        await this.SaveHeal(character, receiver, healthBefore, character.GetFullModifierStats().healing, roll, healing);
    }

    private static async GetHealingCooldown(character:Character) {
        return await Redis.ttl(CharacterHandler.healingCooldownPrefix + character.GetId());
    }

    private static async SetHealingCooldown(character:Character) {
        await Redis.set(CharacterHandler.healingCooldownPrefix + character.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(character.GetMaxHealingCooldown()));
    }

    private static async SaveHeal(character:Character, receiver:Character, receiverHealth:number, characterHealing:number, roll:number, finalHealing:number) {
        const battle = CampaignManager.GetBattle();
        Heal.STATIC_POST(battle, character, receiver, receiverHealth, characterHealing, roll, finalHealing);
    }

    private static async SendHealingEmbed(messageInfo:IMessageInfo, character:Character, receiver:Character) {
        return await MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetHealingEmbed(character, receiver))
    }

    private static async UpdateHealingEmbed(message:Message, character:Character, receiver:Character, roll:number, healing:number) {
        message.edit('', CharacterEmbeds.GetHealingEmbed(character, receiver, roll, healing));
    }

    private static async SendModifierStats(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetModifierStatsEmbed(character));
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
        MessageService.ReplyMessage(messageInfo, `Je mag dit alleen alleen doen wanneer je full health bent.\nHealth:${character.GetCurrentHealth()}/${character.GetMaxHealth()}`);
    }
}