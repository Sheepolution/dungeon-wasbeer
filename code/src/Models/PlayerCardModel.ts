import Card from '../Objects/Card';
import CardModel from './CardModel';
import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class PlayerCardModel extends Model {

    static get tableName() {
        return 'player_cards';
    }

    static relationMappings = {
        cards: {
            relation: Model.BelongsToOneRelation,
            modelClass: CardModel,
            join: {
                from: 'player_cards.card_id',
                to: 'cards.id',
            }
        }
    }

    public static async New(cardId:string, playerId:string, amount:number = 1, trx?:any) {
        const playerCardId = Utils.UUID();

        const playerCard = await PlayerCardModel.query(trx)
            .insert({
                id:playerCardId,
                player_id:playerId,
                card_id:cardId,
                amount: amount,
                slotted: 0
            })

        return playerCard;
    }

    public async GetCard() {
        const card = new Card();
        card.ApplyModel(await this.$relatedQuery('cards'));
        return card;
    }
}