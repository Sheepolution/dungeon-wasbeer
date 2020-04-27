import MonsterModel from '../Models/MonsterModel';
import { AttackType } from '../Enums/AttackType';

export default class Monster {
    protected id:string;
    private name:string;
    private description:string;
    private level:number;
    private category:string;
    private type:string;
    private health:number;
    private strength:number;
    private attack:number;
    private imageUrl:string;
    private creatorId:string;
    private creationDate:string;

    public static async GET_ALL() {
        const models = await MonsterModel.query();
        return models;
    }

    public async GET(id:string) {
        const model:MonsterModel = await MonsterModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_BY_NAME(name:string) {
        const models:MonsterModel = await MonsterModel.query().where('name', name);

        if (models.length == 0) {
            return false;
        }

        await this.ApplyModel(models[0]);
        return true;
    }

    public async POST(name:string, description:string, level:number, category:string, type:AttackType, health:number, strength:number, attack:number, imageUrl:string, creatorId:string) {
        const model = await MonsterModel.New(name, description, level, category, type.toString(), health, strength, attack, imageUrl, creatorId);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await MonsterModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:MonsterModel) {
        this.id = model.id;
        this.name = model.name;
        this.description = model.description;
        this.level = model.level;
        this.category = model.category;
        this.type = model.type;
        this.health = model.health;
        this.strength = model.strength;
        this.attack = model.attack;
        this.imageUrl = model.image_url;
        this.creatorId = model.creator_id;
        this.creationDate = model.creationDate;
    }

    public async EditMonster(name?:string, description?:string, level?:number, category?:string, type?:AttackType, health?:number, strength?:number, attack?:number, imageUrl?:string) {
        this.name = name || this.name;
        this.description = description || this.description;
        this.level = level || this.level;
        this.category = category || this.category;
        this.type = type || this.type;
        this.health = health || this.health;
        this.strength = strength || this.strength;
        this.attack = attack || this.attack;
        this.imageUrl = imageUrl || this.imageUrl;

        this.UPDATE({
            name: this.name,
            description: this.description,
            level: this.level,
            category: this.category,
            type: this.type.toString(),
            health: this.health,
            attack: this.attack,
            imageUrl: this.imageUrl,
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

    public GetType() {
        return this.type;
    }

    public GetLevel() {
        return this.level;
    }

    public GetLevelString() {
        return ':star:'.repeat(this.level);
    }

    public GetHealth() {
        return this.health;
    }

    public GetAttackRoll() {
        return this.attack;
    }

    public GetAttackStrength(crit?:boolean) {
        return this.strength * (crit ? 2 : 1);
    }

    public GetImageUrl() {
        return this.imageUrl;
    }
}