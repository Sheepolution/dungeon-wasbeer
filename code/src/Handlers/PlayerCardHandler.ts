import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import MessageService from '../Services/MessageService';
import CardEmbeds from '../Embeds/CardEmbeds';
import { Utils } from '../Utils/Utils';
import { MessageReaction } from 'discord.js';
import PlayerManager from '../Managers/PlayerManager';
import ReactionManager from '../Managers/ReactionManager';
import { ReactionMessageType } from '../Enums/ReactionMessageType';
import SettingsConstants from '../Constants/SettingsConstants';
import { SortingType } from '../Enums/SortingType';

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
            case 'lijst-level':
            case 'kaarten-level':
            case 'lijstl':
            case 'kaartenl':
                this.SendPlayerCardList(messageInfo, player, SortingType.Rank);
                break;
            case 'lijst-cat':
            case 'kaarten-cat':
            case 'lijst-categorie':
            case 'kaarten-categorie':
            case 'lijstc':
            case 'kaartenc':
                this.SendPlayerCardList(messageInfo, player, SortingType.Category);
                break;
            case 'lijst-naam':
            case 'kaarten-naam':
            case 'lijstn':
            case 'kaartenn':
                this.SendPlayerCardList(messageInfo, player, SortingType.Name);
                break;
            default:
                return false;
        }

        return true;
    }

    public static async OnReaction(obj:any, reaction:MessageReaction) {
        const player = await PlayerManager.GetPlayer(obj.messageInfo.member.id);
        if (reaction.emoji.name == '⬅️') {
            obj.values.page -= 1;
        } else if (reaction.emoji.name == '➡️') {
            obj.values.page += 1;
        }

        await obj.message.edit(null, CardEmbeds.GetPlayerCardListEmbed(player, obj.values.page, obj.values.sorting));
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

    private static async SendPlayerCardList(messageInfo:IMessageInfo, player:Player, sorting?:SortingType) {

        const cards = player.GetCards().length;
        const page = cards > SettingsConstants.CARD_AMOUNT_SPLIT_PAGES ? 1 : undefined;

        const message = await MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(player, page, sorting));
        if (page == 1) {
            await message.react('⬅️')
            await Utils.Sleep(.5)
            await message.react('➡️')
            ReactionManager.AddMessage(message, messageInfo, ReactionMessageType.PlayerCardList, {sorting: sorting, page: 1});
        }
    }
}
