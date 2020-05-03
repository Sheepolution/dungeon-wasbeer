import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class MonsterModel extends Model {

    static get tableName() {
        return 'monsters';
    }

    public static async New(name:string, description:string, level:number, category:string, type:string, health:number, strength:number, attack:number, attackDescription:string, attackCritDescription:string, imageUrl:string, creatorId:string, trx?:any) {
        const cardId = Utils.UUID();

        const card = await MonsterModel.query(trx)
            .insert({
                id:cardId,
                name: name,
                description: description,
                level: level,
                category: category,
                type: type,
                health: health,
                strength: strength,
                attack: attack,
                attack_description: attackDescription,
                attack_crit_description: attackCritDescription,
                image_url: imageUrl,
                creator_id: creatorId,
                creation_date: Utils.GetNowString(),
            })

        return card;
    }
}