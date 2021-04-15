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
import Card from '../Objects/Card';
import { CardFilterType } from '../Enums/CardFilterType';
import CardService from '../Services/CardService';

export default class PlayerCardHandler {

    public static OnCommand(messageInfo: IMessageInfo, player: Player, command: string, args: Array<string>, content: string) {
        switch (command) {
            case 'exchange':
            case 'inruilen':
                this.ExchangeCard(messageInfo, player, content);
                break;
            case 'graaf':
            case 'graven':
            case 'dig':
                this.Dig(messageInfo, player);
                break;
            case 'kaart':
                this.SendPlayerCard(messageInfo, player, content);
                break;
            case 'lijst':
            case 'kaarten':
                this.SendPlayerCardList(messageInfo, player, undefined, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-level':
            case 'kaarten-level':
            case 'lijstl':
            case 'kaartenl':
                this.SendPlayerCardList(messageInfo, player, SortingType.Rank, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-cat':
            case 'kaarten-cat':
            case 'lijst-categorie':
            case 'kaarten-categorie':
            case 'lijstc':
            case 'kaartenc':
                this.SendPlayerCardList(messageInfo, player, SortingType.Category, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-naam':
            case 'kaarten-naam':
            case 'lijstn':
            case 'kaartenn':
                this.SendPlayerCardList(messageInfo, player, SortingType.Name, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-class':
            case 'kaarten-class':
            case 'lijstcl':
            case 'kaartencl':
                this.SendPlayerCardList(messageInfo, player, SortingType.Class, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-buffs':
            case 'kaarten-buffs':
            case 'lijst-buff':
            case 'kaarten-buff':
            case 'lijstb':
            case 'kaartenb':
                this.SendPlayerCardList(messageInfo, player, SortingType.Buff, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-dubbel':
            case 'kaarten-dubbel':
            case 'lijstd':
            case 'kaartend':
                this.SendPlayerCardList(messageInfo, player, SortingType.Amount, args[0], args[1], args[2], args[3]);
                break;
            case 'lijst-seizoen':
            case 'kaarten-seizoen':
            case 'lijsts':
            case 'kaartens':
                this.SendPlayerCardList(messageInfo, player, SortingType.Season, args[0], args[1], args[2], args[3]);
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
            case 'tetris-guy':
                this.GiveTetrisCard(messageInfo, player, args[0]);
                break;
            default:
                return false;
        }

        return true;
    }

    public static async OnReaction(obj: any, reaction: MessageReaction) {
        if (reaction.emoji.name == '⬅️') {
            obj.values.page -= 1;
        } else if (reaction.emoji.name == '➡️') {
            obj.values.page += 1;
        }

        if (obj.values.ownerList) {
            await obj.message.edit(null, CardEmbeds.GetPlayerCardOwnerListEmbed(obj.values.card, obj.values.ownerList, obj.values.page));
        } else {
            const cardList = PlayerCardService.GetPlayerCardList(obj.values.player, obj.values.sorting, obj.values.otherPlayer, obj.values.filterType, obj.values.filterValue);
            await obj.message.edit(null, CardEmbeds.GetPlayerCardListEmbed(cardList, obj.values.player, obj.values.page, obj.values.otherPlayer, obj.values.filterType, obj.values.filterValue));
        }
    }

    private static async Dig(messageInfo: IMessageInfo, player: Player) {
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

        if (message == null) {
            return;
        }

        baseText = `<@${player.GetDiscordId()}> ${baseText}`;

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
                    if (cardMessage != null) {
                        CardManager.OnCardMessage(cardMessage, playerCard);
                        LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes.`);
                    }
                } else {
                    var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je plakt de stukjes aan elkaar, je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                    if (cardMessage != null) {
                        CardManager.OnCardMessage(cardMessage, playerCard);
                        LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes, en heeft daar nu ${playerCard.GetAmount()} van.`);
                    }
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

    private static async GiveTetrisCard(messageInfo: IMessageInfo, player: Player, mention: string) {
        const discordId = player.GetDiscordId();
        var isNeill = false;
        if (discordId == SettingsConstants.TETRIS_GUYS.NEILL) {
            isNeill = true;
        } else if (discordId != SettingsConstants.TETRIS_GUYS.RUBEN) {
            return;
        }

        if (mention == null) {
            MessageService.ReplyMessage(messageInfo, 'Wie geef je de Tetris Guy kaart? Mention deze persoon.');
            return;
        }

        const receiverId = DiscordUtils.GetMemberId(mention);
        if (receiverId == null) {
            MessageService.ReplyMessage(messageInfo, 'Wie geef je de Tetris Guy kaart? Mention deze persoon.');
            return;
        }

        const receiver = await PlayerManager.GetPlayer(receiverId);
        if (receiver == null) {
            MessageService.ReplyMessage(messageInfo, 'Ik kan deze persoon niet vinden.');
            return;
        }

        const cards = CardManager.GetCardList().filter(c => isNeill ? c.GetId() == 'bb919b33-b93d-4c11-bdb1-fdffe05fddc8' : c.GetId() == '307bbb74-8b8f-48d9-942d-92cb69f56464');
        if (cards.length == 0) {
            return;
        }

        const card = cards[0];

        const playerCards = receiver.GetCards();

        const existingPlayerCard = playerCards.find((x: PlayerCard) => x.GetCard().GetId() == card.GetId());
        if (existingPlayerCard != null) {
            MessageService.ReplyMessage(messageInfo, `Deze persoon heeft jouw kaart al ${isNeill ? 'Neill' : 'Ruben'}.`);
            return;
        }

        const newPlayerCard = new PlayerCard(receiver);
        await newPlayerCard.POST(card.GetId(), receiver.GetId());

        receiver.GiveCard(newPlayerCard);

        MessageService.ReplyMessage(messageInfo, `Wow! ${receiver.GetDiscordName()} heeft nu een exclusieve Tetris kaart! ${isNeill ? 'Crazy!' : 'Nice!'}`);
    }

    private static async ExchangeCard(messageInfo: IMessageInfo, player: Player, cardName: string) {
        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = player.FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        const amount = playerCard.GetAmount();
        if (amount < SettingsConstants.CARD_EXCHANGE_AMOUNT) {
            MessageService.ReplyMessage(messageInfo, `Je hebt de kaart '${playerCard.GetCard().GetName()}' maar ${amount} keer. Je moet een kaart minimaal ${SettingsConstants.CARD_EXCHANGE_AMOUNT} keer hebben om deze in te ruilen voor een nieuwe kaart.`);
            return;
        }

        await playerCard.RemoveAmount(SettingsConstants.CARD_EXCHANGE_AMOUNT - 1);

        const cardModifyResult = await CardManager.GivePlayerCard(player);
        const newCard = <PlayerCard>cardModifyResult.object;
        messageInfo.channel = BotManager.GetCardChannel();
        if (cardModifyResult.result) {
            var cardMessage = await MessageService.ReplyMessage(messageInfo, `Je ruilt ${SettingsConstants.CARD_EXCHANGE_AMOUNT - 1} van je kaarten in, en daarvoor krijg je een nieuwe kaart!`, undefined, true, CardEmbeds.GetCardEmbed(newCard.GetCard(), newCard.GetAmount()));
            if (cardMessage != null) {
                CardManager.OnCardMessage(cardMessage, newCard);
                LogService.Log(player, newCard.GetCardId(), LogType.CardReceivedExchange, `${player.GetDiscordName()} heeft de kaart '${newCard.GetCard().GetName()}' gekregen voor het inruilen van dubbele kaarten.`);
            }
        } else {
            var cardMessage = await MessageService.ReplyMessage(messageInfo, `Je ruilt ${SettingsConstants.CARD_EXCHANGE_AMOUNT - 1} van je kaarten in, en daarvoor krijg je een extra kaart!`, undefined, true, CardEmbeds.GetCardEmbed(newCard.GetCard(), newCard.GetAmount()));
            if (cardMessage != null) {
                CardManager.OnCardMessage(cardMessage, newCard);
                LogService.Log(player, newCard.GetCardId(), LogType.CardReceivedExchange, `${player.GetDiscordName()} heeft de kaart '${newCard.GetCard().GetName()}' gekregen voor het inruilen van dubbele kaarten, en heeft daar nu ${newCard.GetAmount()} van.`);
            }
        }
    }

    private static SendPlayerCard(messageInfo: IMessageInfo, player: Player, cardName: string) {
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

    private static async SendPlayerCardList(messageInfo: IMessageInfo, player: Player, sorting?: SortingType, filterType?: string, filterValue?: string, other?: string, lesserGreater?: string) {

        var otherPlayer;
        var requester = player;
        var cardFilter = CardFilterType.None;

        if (filterType != null) {
            var id = DiscordUtils.GetMemberId(filterType);
            if (id != null) {
                other = filterType;
                lesserGreater = filterValue;
                filterType = undefined;
                filterValue = undefined;
            } else {
                cardFilter = CardService.GetFilterType(filterType);
            }

            if (other != null) {
                if (lesserGreater != null) {
                    if (!(lesserGreater == '<' || lesserGreater == '>')) {
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
                            player = otherPlayer;
                            otherPlayer = requester;
                        }
                    }
                }
            }
        }

        const cardList = PlayerCardService.GetPlayerCardList(player, sorting, otherPlayer, cardFilter, filterValue);

        const cards = cardList.length;
        const page = cards > SettingsConstants.CARD_AMOUNT_SPLIT_PAGES ? 1 : undefined;

        const message = await MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardListEmbed(cardList, player, page, otherPlayer, cardFilter, filterValue));

        if (message == null) {
            return;
        }

        if (page == 1) {
            await message.react('⬅️');
            await Utils.Sleep(.5);
            await message.react('➡️');
            ReactionManager.AddMessage(message, ReactionMessageType.PlayerCardList, messageInfo, { page: 1, requester: requester, player: player, sorting: sorting, filterType: cardFilter, filterValue: filterValue, otherPlayer: otherPlayer, lesserGreater: lesserGreater });
        }
    }

    private static async SendPlayerCardOwnersList(messageInfo: IMessageInfo, player: Player, searchKey: string) {
        if (searchKey == null || searchKey.length == 0) {
            MessageService.ReplyMessage(messageInfo, 'Geef de naam van de kaart mee waarvan je de eigenaren wilt zien', false, true);
            return;
        }

        const cards = CardService.FindCards(searchKey);
        if (cards == null || cards.length == 0) {
            this.SendCardNotFound(messageInfo, searchKey);
            return;
        }

        var finalCard: Card | null = null;
        var finalOwnerList: any = null;

        for (const card of cards) {
            const cardName = card.GetName();

            const ownerList = await PlayerCard.GET_OWNERS_OF_CARD(cardName);

            if (ownerList.length > 0) {
                finalCard = card;
                finalOwnerList = ownerList;
                break;
            }
        }

        if (finalCard == null) {
            this.SendCardNotFound(messageInfo, searchKey);
            return;
        }

        const page = finalOwnerList.length > SettingsConstants.CARD_AMOUNT_SPLIT_PAGES ? 1 : undefined;

        finalOwnerList.sort((a: any, b: any) => b.amount - a.amount);

        const message = await MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetPlayerCardOwnerListEmbed(finalCard, finalOwnerList, page));

        if (message == null) {
            return;
        }

        if (page == 1) {
            await message.react('⬅️');
            await Utils.Sleep(.5);
            await message.react('➡️');
            ReactionManager.AddMessage(message, ReactionMessageType.PlayerCardList, messageInfo, { page: 1, card: finalCard, ownerList: finalOwnerList });
        }

    }

    private static SendCardNotFound(messageInfo: IMessageInfo, name: string) {
        MessageService.ReplyMessage(messageInfo, `Ik heb geen kaart kunnen vinden met de naam ${name}`, false, true);
    }
}
