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

        //TODO: Generalize this
        const existingPlayerCard = playerCards.find(x => x.GetCard().GetId() == card.GetId());
        if (existingPlayerCard != null) {
            await existingPlayerCard.AddCard();
            Embedder.SendCardGetExtra(message, existingPlayerCard);
            return;
        }

        const newPlayerCard = new PlayerCard(player);
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
        const card_list = new Array<Card>();

        const cardModels:any = await Card.GET_ALL();
        for (const cardModel of cardModels) {
            const card = new Card();
            await card.ApplyModel(cardModel);
            card_list.push(card);
        }

        CardHandler.CardList = card_list;
    }
}