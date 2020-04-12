import { Utils } from '../Utils/Utils';
import CardService from '../Services/CardService';
import { ModifierType } from '../Enums/ModifierType';
import { ICardModifier } from '../Interfaces/ICardModifier';
import { ClassType } from '../Enums/ClassType';
const { Model } = require('objection');

export default class CardModel extends Model {

    static get tableName() {
        return 'cards';
    }

    public static async New(name:string, description:string, rank:number, category:string, imageUrl:string, creatorId:string, modifiers?:Array<ICardModifier>, modifierClass?:ClassType, trx?:any) {
        const cardId = Utils.UUID();

        const card = await CardModel.query(trx)
            .insert({
                id:cardId,
                name: name,
                description: description,
                category: category,
                rank: rank,
                image_url: imageUrl,
                creator_id: creatorId,
                creation_date: Utils.GetNowString(),
                special: false,
                modifiers: CardService.ParseModifierArrayToDataString(modifiers),
                modifier_class: modifierClass,
            })

        return card;
    }

    public GetModifiers() {
        return CardService.ParseModifierStringToArray(this.modifiers) ?? [];
    }

    public GetModifierClass() {
        return (<any>ClassType)[this.modifier_class];
    }
}