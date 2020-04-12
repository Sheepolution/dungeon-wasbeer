import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class MonsterModel extends Model {

    static get tableName() {
        return 'monsters';
    }

    public static async New(name:string, description:string, level:number, category:string, type:string, health:number, attack:number, imageUrl:string, creatorId:string, trx?:any) {
        const card_id = Utils.UUID();

        const card = await MonsterModel.query(trx)
            .insert({
                id:card_id,
                name: name,
                description: description,
                level: level,
                category: category,
                type: type,
                health: health,
                attack: attack,
                image_url: imageUrl,
                creator_id: creatorId,
                creation_date: Utils.GetNowString(),
            })

        return card;
    }
}