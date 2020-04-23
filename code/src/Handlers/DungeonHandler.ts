import Player from '../Objects/Player';
import { ClassType } from '../Enums/ClassType';
import MessageService from '../Services/MessageService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import PlayerEmbeds from '../Embeds/PlayerEmbeds';

export default class DungeonHandler {

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
                this.SendCardSlots(messageInfo, player);
                break;
            case 'equip':
                this.AddCardToSlot(messageInfo, player, args[0]);
                break;
            case 'unequip':
                this.RemoveCardFromSlot(messageInfo, player, args[0]);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async ChooseClass(command:IMessageInfo, player:Player, className:string) {
        const playerClassName = player.GetClassName();
        if (playerClassName) {
            MessageService.ReplyMessage(command, `Je bent al de class ${playerClassName}. Je kan hier pas van veranderen wanneer je dood bent, of wanneer je opnieuw begint met \`;reset\`.`, false);
            return;
        }

        if (className == null) {
            this.SendUnknownClassName(command);
            return;
        }

        className = className.toTitleCase();

        if (!this.classNames.includes(className)) {
            this.SendUnknownClassName(command);
            return;
        }

        const classType = (<any>ClassType)[className];
        await player.SetClass(classType);
        MessageService.ReplyMessage(command, `Je bent nu de class ${className}!`, true)
    }

    private static async AddCardToSlot(messageInfo:IMessageInfo, player:Player, cardName:string) {
        // TODO: Dit soort checks doe je ergens anders ook. Dat moet anders kunnen.
        // TODO: Dat je gewoon iets hebt van GetCardFromArgument() ofzo.
        // TODO: Net zoals met het aanmaken/aanpassen van kaarten en monsters. Dat moet minder DRY hebben.

        // TODO: Dit mag je niet doen als je full health bent.

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = player.FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        if (!player.HasAvailableCardSlot()) {
            MessageService.ReplyMessage(messageInfo, 'Je equipment zit vol. Haal een kaart weg voordat je er weer een toevoegt.', false);
            return;
        }

        const realCardName = playerCard.GetCard().GetName();

        if (!playerCard.GetCard().HasBuffs()) {
            MessageService.ReplyMessage(messageInfo, `Je equipment is alleen voor kaarten met buffs. De kaart '${realCardName}' heeft geen buffs.`, false);
            return;
        }

        if (playerCard.IsInSlot()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit al in je equipment. Je kan maar één van elke kaart in je equipment hebben.`, false);
            return;
        }

        if (playerCard.IsUsedInTrade()) {
            MessageService.ReplyMessage(messageInfo, `Iemand is een ruil gestart met jouw kaart '${realCardName}', dus je kan deze nu niet equipment.`, false);
            return;
        }

        await player.AddCardToSlot(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is aan je equipment toegevoegd.`, true, true, PlayerEmbeds.GetCardSlotsEmbed(player));
    }

    private static async RemoveCardFromSlot(messageInfo:IMessageInfo, player:Player, cardName:string) {

        // TODO: Dit mag je niet doen als je full health bent.

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

        if (!playerCard.IsInSlot()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit niet in je equipment.`, false);
            return;
        }

        await player.RemoveCardFromSlot(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is uit je equipment gehaald.`, true, true, PlayerEmbeds.GetCardSlotsEmbed(player));
    }

    // Messages
    private static async SendUnknownClassName(command:IMessageInfo) {
        MessageService.ReplyMessage(command, `Kies een van de volgende classes:\n${this.classNames.join(', ')}`, false);
    }

    private static async SendModifierStats(messageInfo:IMessageInfo, player:Player) {
        MessageService.ReplyEmbed(messageInfo, PlayerEmbeds.GetModifierStatsEmbed(player));
    }

    private static async SendCardSlots(messageInfo:IMessageInfo, player:Player) {
        MessageService.ReplyEmbed(messageInfo, PlayerEmbeds.GetCardSlotsEmbed(player));
    }
}