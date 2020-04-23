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
        case 'kaarten':
            this.SendPlayerCardList(messageInfo, player);
            break;
        default:
            return false;
        }

        return true;
    }

    private static async SendPlayerCard(messageInfo:IMessageInfo, player:Player, name:string) {
        if (name == null) {
            MessageService.SendMessage(messageInfo, 'Ik mis de naam van de kaart.', false);
            return;
        }

        const playerCard = player.FindCard(name);
        if (playerCard) {
            MessageService.SendEmbed(messageInfo, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
            return;
        }

        MessageService.SendMessage(messageInfo, 'Je hebt geen kaart met de naam \'' + name + '\'.', false, true);
    }

    private static async SendPlayerCardList(messageInfo:IMessageInfo, player:Player) {
        MessageService.SendEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(player, player.GetCards()));
    }

}