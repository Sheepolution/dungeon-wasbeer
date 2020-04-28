import Player from '../Objects/Player';
import { ClassType } from '../Enums/ClassType';
import MessageService from '../Services/MessageService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Character from '../Objects/Character';
import CharacterEmbeds from '../Embeds/CharacterEmbeds';
import PlayerManager from '../Managers/PlayerManager';

export default class CharacterHandler {

    private static readonly classNames = Object.keys(ClassType);

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>) {
        switch (command) {
            case 'class':
                this.ChooseClass(messageInfo, player, args[0]);
                break;
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
        if (character == null) { return; }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = player.FindCard(cardName);
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
        if (character == null) { return; }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = player.FindCard(cardName);
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

    private static async SendModifierStats(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }
        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetModifierStatsEmbed(character));
    }

    private static async SendEquipment(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }
        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async SendUnknownClassName(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, `Kies een van de volgende classes:\n${this.classNames.join(', ')}`, false);
    }

    private static async ReplyNotFullHealth(messageInfo:IMessageInfo, character:Character) {
        MessageService.ReplyMessage(messageInfo, `Je mag dit alleen alleen doen wanneer je full health bent.\nHealth:${character.GetCurrentHealth()}/${character.GetMaxHealth()}`);
    }
}