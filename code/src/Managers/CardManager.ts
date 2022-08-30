import Card from '../Objects/Card';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import SettingsConstants from '../Constants/SettingsConstants';
import IObjectModifyResult from '../Interfaces/IObjectModifyResult';
import { ICardModifier } from '../Interfaces/ICardModifier';
import { ClassType } from '../Enums/ClassType';
import { Message, MessageReaction, User } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import ReactionManager from './ReactionManager';
import { ReactionMessageType } from '../Enums/ReactionMessageType';
import PlayerManager from './PlayerManager';
import Character from '../Objects/Character';

export default class CardManager {

    private static cardList: Array<Card>;

    private static legendaryCardsAmount: number;
    private static exclusiveCardsAmount: number;

    public static async BuildCardList() {
        const cardList = new Array<Card>();

        const cardModels: any = await Card.GET_ALL();
        for (const cardModel of cardModels) {
            const card = new Card();
            await card.ApplyModel(cardModel);
            cardList.push(card);
        }

        this.cardList = cardList;

        this.legendaryCardsAmount = this.cardList.filter(c => c.GetRank() == 6).length;
        this.exclusiveCardsAmount = this.cardList.filter(c => c.GetCategory() == 'Exclusief').length;
    }

    public static GetCardList() {
        return this.cardList;
    }

    public static GetAmountOfNormalCards() {
        return this.cardList.length - this.legendaryCardsAmount - this.exclusiveCardsAmount;
    }

    public static async GivePlayerCard(player: Player) {
        const card = await this.GetRandomCard();
        const playerCards = player.GetCards();
        const cardModifyResult: IObjectModifyResult = { object: card, result: false };

        //TODO: Generalize this
        const existingPlayerCard = playerCards.find(x => x.GetCard().GetId() == card.GetId());
        if (existingPlayerCard != null) {
            await existingPlayerCard.AddCard();
            cardModifyResult.object = existingPlayerCard;
            return cardModifyResult;
        }

        const newPlayerCard = new PlayerCard(player);
        await newPlayerCard.POST(card.GetId(), player.GetId());

        player.GiveCard(newPlayerCard);

        cardModifyResult.object = newPlayerCard;
        cardModifyResult.result = true;
        return cardModifyResult;
    }

    public static OnCardMessage(cardMessage: Message, playerCard: PlayerCard) {
        cardMessage.react(EmojiConstants.STATUS.GOOD);
        ReactionManager.AddMessage(cardMessage, ReactionMessageType.PlayerCardGet, undefined, { cardId: playerCard.GetCard().GetId() });
    }

    public static async OnReaction(obj: any, reaction: MessageReaction, user: User) {
        if (reaction.emoji.toString() == EmojiConstants.STATUS.GOOD) {
            var player: Player = await PlayerManager.GetPlayer(user.id);
            if (player != null) {
                var playerCards: Array<PlayerCard> = player.GetCards();
                if (!playerCards.find((c => c.GetCard().GetId() == obj.values.cardId))) {
                    reaction.users.remove(user.id);
                }
            }
        }
    }

    public static async AddNewCard(name: string, description: string, rank: number, category: string, url: string, creatorId: string, modifiers?: Array<ICardModifier>, modifierClass?: ClassType) {
        const card = new Card();
        const cardModifyResult: IObjectModifyResult = { object: card, result: false };

        if (await card.FIND_BY_NAME(name)) {
            return cardModifyResult;
        }

        await card.POST(name, description, rank, category, url, creatorId, modifiers, modifierClass);

        cardModifyResult.result = true;
        return cardModifyResult;
    }

    public static async EditCard(originalName: string, name?: string, description?: string, rank?: number, category?: string, modifiers?: Array<ICardModifier>, modifierClass?: ClassType, imageUrl?: string) {
        const card = new Card();
        const cardModifyResult: IObjectModifyResult = { object: card, result: false };

        if (!await card.FIND_BY_NAME(originalName)) {
            return cardModifyResult;
        }

        await card.EditCard(name, description, rank, category, modifiers, modifierClass, imageUrl);

        cardModifyResult.result = true;
        return cardModifyResult;
    }

    public static async TakeEquippedCard(character: Character) {
        const player = character.GetPlayer();
        const playerCards = player.GetCards();
        if (playerCards.length == 0) {
            return;
        }

        const equippedCards = playerCards.filter(c => c.IsEquipped());

        if (equippedCards.length == 0) {
            return false;
        }

        const playerCard = equippedCards.randomChoice();
        await playerCard.TakeOne();
        await character.ForceUnequip(playerCard);
        return playerCard;
    }

    public static async GiveBackTakenCard(character: Character) {
        const player = character.GetPlayer();
        const playerCards = player.GetTakenCards();
        if (playerCards.length == 0) {
            return;
        }

        const playerCard = playerCards.randomChoice();
        await playerCard.GiveOneBack();
        return playerCard;
    }

    public static async ResetTakenCards() {
        await PlayerCard.ResetTaken();
    }

    private static GetRandomCard() {
        const roll = Math.random() * 100;
        var rank = 1;

        for (const value of SettingsConstants.CARD_RANK_ROLL_VALUE) {
            if (roll > value) {
                break;
            }
            rank += 1;
        }

        const card = CardManager.cardList.filter(c => c.GetRank() == rank && c.GetCategory() != 'Exclusief').randomChoice();

        return card;
    }
}
