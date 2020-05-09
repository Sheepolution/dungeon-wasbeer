import Player from './Player';
import Card from './Card';
import TradeModel from '../Models/TradeModel';

export default class Trade {

    protected id:string;
    private trader:Player;
    private other:Player;
    private traderCard:Card;
    private otherCard:Card;
    private tradeDate:Date;

    public static async STATIC_POST(trader:Player, other:Player, traderCard:Card, otherCard:Card) {
        return await TradeModel.New(trader, other, traderCard, otherCard);
    }

    public GetId() {
        return this.id;
    }
}