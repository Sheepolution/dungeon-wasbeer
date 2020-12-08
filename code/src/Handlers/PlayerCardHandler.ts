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
import CardManager from '../Managers/CardManager';
import LogService from '../Services/LogService';
import PlayerCard from '../Objects/PlayerCard';
import BotManager from '../Managers/BotManager';
import { LogType } from '../Enums/LogType';
import DiscordUtils from '../Utils/DiscordUtils';
import PlayerCardService from '../Services/PlayerCardService';

export default class PlayerCardHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>, content:string) {
        switch (command) {
            case 'graaf':
            case 'graven':
            case 'dig':
                this.Dig(messageInfo, player);
                break;

            case 'kaart':
                this.SendPlayerCard(messageInfo, player, args[0]);
                break;
            case 'lijst':
            case 'kaarten':
                this.SendPlayerCardList(messageInfo, player, undefined, args[0], args[1]);
                break;
            case 'lijst-level':
            case 'kaarten-level':
            case 'lijstl':
            case 'kaartenl':
                this.SendPlayerCardList(messageInfo, player, SortingType.Rank, args[0], args[1]);
                break;
            case 'lijst-cat':
            case 'kaarten-cat':
            case 'lijst-categorie':
            case 'kaarten-categorie':
            case 'lijstc':
            case 'kaartenc':
                this.SendPlayerCardList(messageInfo, player, SortingType.Category, args[0], args[1]);
                break;
            case 'lijst-naam':
            case 'kaarten-naam':
            case 'lijstn':
            case 'kaartenn':
                this.SendPlayerCardList(messageInfo, player, SortingType.Name, args[0], args[1]);
                break;
            case 'lijst-class':
            case 'kaarten-class':
            case 'lijstcl':
            case 'kaartencl':
                this.SendPlayerCardList(messageInfo, player, SortingType.Class, args[0], args[1]);
                break;
            case 'lijst-buffs':
            case 'kaarten-buffs':
            case 'lijst-buff':
            case 'kaarten-buff':
            case 'lijstb':
            case 'kaartenb':
                this.SendPlayerCardList(messageInfo, player, SortingType.Buff, args[0], args[1]);
                break;
            case 'lijst-dubbel':
            case 'kaarten-dubbel':
            case 'lijstd':
            case 'kaartend':
                this.SendPlayerCardList(messageInfo, player, SortingType.Amount, args[0], args[1]);
                break;
            case 'lijst-eigenaar':
            case 'lijst-eigenaren':
            case 'lijst-owners':
            case 'lijst-owner':
            case 'lijste':
            case 'kaarten-eigenaar':
            case 'kaarten-eigenaren':
            case 'kaarten-owner':
            case 'kaarten-owners':
            case 'kaartene':
                this.SendPlayerCardOwnersList(messageInfo, player, content);
                break;
            default:
                return false;
        }

        return true;
    }

    public static async OnReaction(obj:any, reaction:MessageReaction) {
        if (reaction.emoji.name == '⬅️') {
            obj.values.page -= 1;
        } else if (reaction.emoji.name == '➡️') {
            obj.values.page += 1;
        }

        if (obj.values.ownerList) {
            await obj.message.edit(null, CardEmbeds.GetPlayerCardOwnerListEmbed(obj.values.cardName, obj.values.ownerList, obj.values.page));
        } else {
            const cardList = PlayerCardService.GetPlayerCardList(obj.values.player, obj.values.sorting, obj.values.otherPlayer)
            await obj.message.edit(null, CardEmbeds.GetPlayerCardListEmbed(cardList, obj.values.player, obj.values.page, obj.values.otherPlayer));
        }
    }

    private static async Dig(messageInfo:IMessageInfo, player:Player) {
        if (await player.HasDigWaitCooldown()) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt nog geen uur geleden gegraven. Eventjes wachten voordat je weer op zoek gaat naar een kaartstukje.');
            return;
        }

        var hasDigCooldown = await player.HasDigCooldown();

        const roll = Math.random() * 100;
        var category = 1;
        for (const value of SettingsConstants.CARD_PIECE_FIND_CHANCE) {
            if (roll > value) {
                break;
            }
            category += 1;
        }

        if (category > 1 && hasDigCooldown) {
            category += 1;
        }

        var currentCardPieces = player.GetCardPieces();

        var baseText = 'Je graaft in de vuilnisbak';
        if (currentCardPieces == 1) {
            baseText = 'Je graaft in de vuilnisbak met één kaartstukje op zak';
        } else if (currentCardPieces > 1) {
            baseText = `Je graaft in de vuilnisbak met ${currentCardPieces} kaartstukjes op zak`;
        }

        const needed = SettingsConstants.CARD_PIECES_NEEDED;

        var message = await MessageService.ReplyMessage(messageInfo, `${baseText}...`);
        baseText = `<@${player.GetDiscordId()}> ${baseText}`

        await Utils.Sleep(Utils.Random(2, 6));

        player.SetDigCooldown();

        if (category == 1) {
            await player.AddCardPiece();
            await message.edit(`${baseText} en vindt een stukje van een kaart!\nJe hebt er nu ${player.GetCardPieces()} van de ${needed}!`);
            LogService.Log(player, player.GetId(), LogType.PieceFound, `${player.GetDiscordName()} heeft gegraven en een kaartstukje gevonden.`);
            var pieces = player.GetCardPieces();
            if (pieces >= needed) {
                await Utils.Sleep(3);
                const cardModifyResult = await CardManager.GivePlayerCard(player);
                const playerCard = <PlayerCard>cardModifyResult.object;
                messageInfo.channel = BotManager.GetCardChannel();
                if (cardModifyResult.result) {
                    var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je plakt de stukjes aan elkaar, je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes.`);
                } else {
                    var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je plakt de stukjes aan elkaar, je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes, en heeft daar nu ${playerCard.GetAmount()} van.`);
                }
                await player.TakeAllCardPieces();
            }
        } else if (category == 2 || player.GetCardPieces() == 0) {
            message.edit(`${baseText} en vindt helemaal niks.\nJe hebt er nu nog steeds ${player.GetCardPieces()} van de ${needed}.`);
            LogService.Log(player, player.GetId(), LogType.PieceNothing, `${player.GetDiscordName()} heeft gegraven maar geen kaartstukje gevonden.`);
        } else if (category == 3) {
            await player.TakeCardPiece();
            message.edit(`${baseText} maar verliest een kaartstukje tijdens het zoeken!\nJe hebt er nu nog maar ${player.GetCardPieces()} van de ${needed}!`);
            LogService.Log(player, player.GetId(), LogType.PieceLost, `${player.GetDiscordName()} heeft gegraven en een kaartstukje verloren.`);
        } else {
            await player.TakeAllCardPieces();
            message.edit(`${baseText} maar verliest al je kaartstukjes tijdens het zoeken!\nNu heb je er 0 van de ${needed}!`);
            LogService.Log(player, player.GetId(), LogType.PieceLost, `${player.GetDiscordName()} heeft gegraven en alle kaartstukjes verloren.`);
        }
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

    private static async SendPlayerCardList(messageInfo:IMessageInfo, player:Player, sorting?:SortingType, other?:string, lesserGreater?:string) {

        var otherPlayer;
        var requester = player;

        if (other != null) {
            if (lesserGreater != null) {
                if (! (lesserGreater == '<' || lesserGreater == '>')) {
                    lesserGreater = undefined;
                }
            }

            var id = DiscordUtils.GetMemberId(other);
            if (id != null) {
                otherPlayer = await PlayerManager.GetPlayer(id);
                if (otherPlayer != null) {
                    if (lesserGreater == undefined) {
                        player = otherPlayer;
                        otherPlayer = undefined;
                    } else if (lesserGreater == '>') {
                        player = otherPlayer
                        otherPlayer = requester;
                    }
                }
            }
        }

        const cardList = PlayerCardService.GetPlayerCardList(player, sorting, otherPlayer)

        const cards = cardList.length;
        const page = cards > SettingsConstants.CARD_AMOUNT_SPLIT_PAGES ? 1 : undefined;

        const message = await MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(cardList, player, page, otherPlayer));
        if (page == 1) {
            await message.react('⬅️')
            await Utils.Sleep(.5)
            await message.react('➡️')
            ReactionManager.AddMessage(message, ReactionMessageType.PlayerCardList, messageInfo, {page: 1, requester: requester, player: player, otherPlayer: otherPlayer, lesserGreater: lesserGreater});
        }
    }

    private static async SendPlayerCardOwnersList(messageInfo:IMessageInfo, player:Player, cardName:string) {
        if (cardName == null || cardName.length == 0) {
            MessageService.ReplyMessage(messageInfo, 'Geef de naam van de kaart mee waarvan je de eigenaren wilt zien', false, true);
        }

        const card = PlayerCardService.FindCard(cardName);
        if (card == null) {
            this.SendCardNotFound(messageInfo, cardName);
            return;
        }

        cardName = card.GetName();

        const ownerList = await PlayerCard.GET_OWNERS_OF_CARD(cardName);

        if (ownerList.length == 0) {
            this.SendCardNotFound(messageInfo, cardName);
            return;
        }

        const page = ownerList.length > SettingsConstants.CARD_AMOUNT_SPLIT_PAGES ? 1 : undefined;

        ownerList.sort((a:any, b:any) => b.amount - a.amount);

        const message = await MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardOwnerListEmbed(cardName, ownerList, page));

        if (page == 1) {
            await message.react('⬅️')
            await Utils.Sleep(.5)
            await message.react('➡️')
            ReactionManager.AddMessage(message, ReactionMessageType.PlayerCardList, messageInfo, {page: 1, cardName: cardName, ownerList: ownerList});
        }

    }

    private static async SendCardNotFound(messageInfo:IMessageInfo, name:string) {
        MessageService.ReplyMessage(messageInfo, `Ik heb geen kaart kunnen vinden met de naam ${name}`, false, true);
    }
}
