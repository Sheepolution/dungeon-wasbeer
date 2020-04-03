import IMessageInfo from "./IMessageInfo";
import Card from "./Card";
import PlayerCard from "./PlayerCard";
import Player from "./Player";
import Embedder from "./Embedder";
import Constants from "./Constants";

export default class CardHandler {

    public static CardList:Array<Card>;

    public static async GiveMemberCard(message:IMessageInfo, player:Player) {
        const card = await this.GetRandomCard(message);
        const playerCards = player.GetCards();
        const existingPlayerCard = playerCards.find(x => x.GetId() == card.GetId());
        if (existingPlayerCard != null) {
            await existingPlayerCard.AddCard();
            Embedder.SendCardGetExtra(message, existingPlayerCard);
            return;
        }

        const newPlayerCard = new PlayerCard();
        await newPlayerCard.POST(card.GetId(), player.GetId());

        player.GiveCard(newPlayerCard);

        Embedder.SendCardGet(message, newPlayerCard);
    }

    private static async GetRandomCard(message:IMessageInfo) {
        const roll = Math.random() * 100;
        var rank = 1;

        for (const value of Constants.Settings.CardRankRollValue) {
            if (roll > value) {
                break;
            }
            rank += 1;
        }

        const card = CardHandler.CardList.filter(c => c.GetRank() == rank).randomChoice();

        return card;
    }

    public static async BuildCardList() {
        const cardList = new Array<Card>();

        const cardModels:any = await Card.GET_ALL();
        for (const cardModel of cardModels) {
            const card = new Card();
            await card.ApplyModel(cardModel);
            cardList.push(card);
        }

        CardHandler.CardList = cardList;
    }
}