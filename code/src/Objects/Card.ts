import CardModel from '../Models/CardModel';
import { ICardModifier } from '../Interfaces/ICardModifier';
import { ClassType } from '../Enums/ClassType';
import CardService from '../Services/CardService';

export default class Card {
    protected id:string;
    private name:string;
    private description:string;
    private rank:number;
    private category:string
    private special:boolean;
    private modifiers:Array<ICardModifier>;
    private modifierClass:ClassType;
    private imageUrl:string;
    private creatorId:string;
    private creationDate:string;

    public static async GET_ALL() {
        const models = await CardModel.query();
        return models;
    }

    public async GET(id:string) {
        const model:CardModel = await CardModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_BY_NAME(name:string) {
        const models:CardModel = await CardModel.query().where('name', name);

        if (models.length == 0) {
            return false;
        }

        await this.ApplyModel(models[0]);
        return true;
    }

    public async POST(name:string, description:string, rank:number, category:string, imageUrl:string, creatorId:string, modifiers?:Array<ICardModifier>, modifierClass?:ClassType) {
        const model = await CardModel.New(name, description, rank, category, imageUrl, creatorId, modifiers, modifierClass);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await CardModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:CardModel) {
        this.id = model.id;
        this.name = model.name;
        this.description = model.description;
        this.rank = model.rank;
        this.category = model.category;
        this.imageUrl = model.image_url;
        this.creatorId = model.creator_id;
        this.creationDate = model.creationDate;
        this.special = model.special
        this.modifiers = model.GetModifiers();
        this.modifierClass = model.GetModifierClass();
    }

    public async EditCard(name?:string, description?:string, rank?:number, category?:string, modifiers?:Array<ICardModifier>, modifierClass?:ClassType, imageUrl?:string) {
        this.name = name || this.name;
        this.description = description || this.description;
        this.rank = rank || this.rank;
        this.category = category || this.category;
        this.modifiers = modifiers || this.modifiers;
        this.modifierClass = modifierClass || this.modifierClass;
        this.imageUrl = imageUrl || this.imageUrl;

        this.UPDATE({
            name: this.name,
            description: this.description,
            rank: this.rank,
            category: this.category,
            modifiers: CardService.ParseModifierArrayToDataString(this.modifiers),
            modifier_class: this.modifierClass?.toString(),
            image_url: this.imageUrl,
        })
    }

    public GetId() {
        return this.id;
    }

    public GetName() {
        return this.name;
    }

    public GetDescription() {
        return this.description;
    }

    public GetCategory() {
        return this.category;
    }

    public GetRank() {
        return this.rank;
    }

    public GetRankString() {
        return ':star:'.repeat(this.rank);
    }

    public GetModifiers() {
        return this.modifiers;
    }

    public GetModifierClass() {
        return this.modifierClass;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }
}