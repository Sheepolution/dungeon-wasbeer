import Player from '../Objects/Player';
import Card from '../Objects/Card';
import { Utils } from '../Utils/Utils';

const { Model } = require('objection');

export default class TradeModel extends Model {

    static get tableName() {
        return 'trades';
    }

    public static async New(trader: Player, other: Player, traderCard: Card, otherCard: Card) {
        const tradeId = Utils.UUID();

        const trade = await TradeModel.query()
            .insert({
                id: tradeId,
                trader_id: trader.GetId(),
                other_id: other.GetId(),
                trader_card_id: traderCard.GetId(),
                other_card_id: otherCard.GetId(),
                trade_date: Utils.GetNowString(),
            })

        return trade;
    }
}