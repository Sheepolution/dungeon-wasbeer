import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class CardModel extends Model {

    static get tableName() {
        return 'cards';
    }

    public static async New(name:string, description:string, rank:number, category:string, imageUrl:string, creatorId:string, special:boolean = false, modifier?:string, modifierAmount?:number, trx?:any) {
        const card_id = Utils.UUID();

        const card = await CardModel.query(trx)
            .insert({
                id:card_id,
                name: name,
                description: description,
                category: category,
                rank: rank,
                image_url: imageUrl,
                creator_id: creatorId,
                creation_date: Utils.GetNowString(),
                special: special,
                modifier: modifier,
                modifier_amount: modifierAmount
            })

        return card;
    }
}