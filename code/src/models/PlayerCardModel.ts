import Card from '../Objects/Card';
import CardModel from './CardModel';
import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class PlayerCardModel extends Model {

    static get tableName() {
        return 'player_cards';
    }

    public static async New(cardId:string, playerId:string, amount:number = 1, trx?:any) {
        const player_card_id = Utils.UUID();

        const player_card = await PlayerCardModel.query(trx)
            .insert({
                id:player_card_id,
                player_id:playerId,
                card_id:cardId,
                amount: amount
            })

        return player_card;
    }

    public async GetCard() {
        const card = new Card();
        card.ApplyModel(await this.$relatedQuery('cards'));
        return card;
    }

    static relationMappings = {
        cards: {
            relation: Model.BelongsToOneRelation,
            modelClass: CardModel,
            join: {
                from: 'player_cards.card_id',
                to: 'cards.id'
            }
        }
    }

}