import CardModel from '../Models/CardModel';
import { ICardModifier } from '../Interfaces/ICardModifier';
import { ClassType } from '../Enums/ClassType';
import CardService from '../Services/CardService';
import { ModifierType } from '../Enums/ModifierType';
import IModifierStats from '../Interfaces/IModifierStats';
import CharacterService from '../Services/CharacterService';

export default class Card {
    protected id:string;
    private name:string;
    private description:string;
    private rank:number;
    private category:string
    private modifiers:Array<ICardModifier>;
    private modifierClass:ClassType;
    private modifierStats:IModifierStats;
    private season:number;
    private imageUrl:string;
    private creatorId:string;
    private creationDate:string;

    public static async GET_ALL() {
        const models = await CardModel.query().where({active: true})
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
        this.creationDate = model.creation_date;
        this.modifiers = model.GetModifiers();
        this.modifierClass = model.GetModifierClass();
        this.modifierStats = this.CalculateModifierStats();
        this.season = model.season;
    }

    public async EditCard(name:string = this.name, description:string = this.description, rank:number = this.rank, category:string = this.category, modifiers:Array<ICardModifier> = this.modifiers, modifierClass:ClassType = this.modifierClass, imageUrl:string = this.imageUrl) {
        this.name = name;
        this.description = description;
        this.rank = rank;
        this.category = category;
        this.modifiers = modifiers;
        this.modifierClass = modifierClass;
        this.imageUrl = imageUrl;

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

    public HasBuffs() {
        return this.modifiers.length > 0;
    }

    public GetModifiers() {
        return this.modifiers;
    }

    public GetModifierClass() {
        return this.modifierClass;
    }

    public GetModifierStats() {
        return this.modifierStats;
    }

    public GetSeason() {
        return this.season;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    private CalculateModifierStats() {
        const modifierStats = CharacterService.GetEmptyModifierStats();
        for (const modifier of this.modifiers) {
            switch (modifier.modifier) {
                case ModifierType.Armor:
                    modifierStats.armor = modifier.value;
                    break;
                case ModifierType.Attack:
                    modifierStats.attack = modifier.value;
                    break;
                case ModifierType.Dexterity:
                    modifierStats.dexterity = modifier.value;
                    break;
                case ModifierType.Healing:
                    modifierStats.healing = modifier.value;
                    break;
                case ModifierType.Health:
                    modifierStats.health = modifier.value;
                    break;
                case ModifierType.Regeneration:
                    modifierStats.regeneration = modifier.value;
                    break;
                case ModifierType.Spell:
                    modifierStats.spell = modifier.value;
                    break;
                case ModifierType.Strength:
                    modifierStats.strength = modifier.value;
                    break;
            }
        }

        return modifierStats;
    }
}