import Card from '../Objects/Card';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import SettingsConstants from '../Constants/SettingsConstants';
import IObjectModifyResult from '../Interfaces/IObjectModifyResult';
import { ICardModifier } from '../Interfaces/ICardModifier';
import { ClassType } from '../Enums/ClassType';

export default class CardManager {

    private static cardList:Array<Card>;

    public static async BuildCardList() {
        const cardList = new Array<Card>();

        const cardModels:any = await Card.GET_ALL();
        for (const cardModel of cardModels) {
            const card = new Card();
            await card.ApplyModel(cardModel);
            cardList.push(card);
        }

        this.cardList = cardList;
    }

    public static async GetCardList() {
        return this.cardList;
    }

    public static async GivePlayerCard(messageInfo:IMessageInfo, player:Player) {
        const card = await this.GetRandomCard();
        const playerCards = player.GetCards();
        const cardModifyResult:IObjectModifyResult = { object: card, result: false };

        //TODO: Generalize this
        const existingPlayerCard = playerCards.find(x => x.GetCard().GetId() == card.GetId());
        if (existingPlayerCard != null) {
            await existingPlayerCard.AddCard();
            return cardModifyResult;
        }

        const newPlayerCard = new PlayerCard(player);
        await newPlayerCard.POST(card.GetId(), player.GetId());

        player.GiveCard(newPlayerCard);

        cardModifyResult.result = true;
        return cardModifyResult;
    }

    public static async AddNewCard(name:string, description:string, rank:number, category:string, url:string, creatorId:string, modifiers?:Array<ICardModifier>, modifierClass?:ClassType) {
        const card = new Card();
        const cardModifyResult:IObjectModifyResult = { object: card, result: false };

        if (await card.FIND_BY_NAME(name)) {
            return cardModifyResult;
        }

        await card.POST(name, description, rank, category, url, creatorId, modifiers, modifierClass);

        cardModifyResult.result = true;
        return cardModifyResult;
    }

    public static async EditCard(originalName:string, name?:string, description?:string, rank?:number, category?:string, modifiers?:Array<ICardModifier>, modifierClass?:ClassType, imageUrl?:string) {
        const card = new Card();
        const cardModifyResult:IObjectModifyResult = { object: card, result: false };

        if (!await card.FIND_BY_NAME(originalName)) {
            return cardModifyResult;
        }

        await card.EditCard(name, description, rank, category, modifiers, modifierClass, imageUrl);

        cardModifyResult.result = true;
        return cardModifyResult;
    }

    private static async GetRandomCard() {
        const roll = Math.random() * 100;
        var rank = 1;

        for (const value of SettingsConstants.CARD_RANK_ROLL_VALUE) {
            if (roll > value) {
                break;
            }
            rank += 1;
        }

        const card = CardManager.cardList.filter(c => c.GetRank() == rank).randomChoice();

        return card;
    }
}