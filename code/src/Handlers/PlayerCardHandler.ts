import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import MessageService from '../Services/MessageService';
import CardEmbeds from '../Embeds/CardEmbeds';

export default class PlayerCardHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>) {
        switch (command) {
            case 'kaart':
                this.SendPlayerCard(messageInfo, player, args[0]);
                break;
            case 'lijst':
                this.SendPlayerCardList(messageInfo, player);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async SendPlayerCard(messageInfo:IMessageInfo, player:Player, cardName:string) {
        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = player.FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
    }

    private static async SendPlayerCardList(messageInfo:IMessageInfo, player:Player) {
        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(player));
    }
}