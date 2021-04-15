import MonsterModel from '../Models/MonsterModel';
import { AttackType } from '../Enums/AttackType';

export default class Monster {
    protected id: string;
    private name: string;
    private description: string;
    private level: number;
    private category: string;
    private type: AttackType;
    private health: number;
    private strength: number;
    private attack: number;
    private attackDescription: string;
    private attackCritDescription: string;
    private imageUrl: string;
    private creatorId: string;
    private creationDate: string;
    private number: number;

    public static async GET_ALL() {
        const models = await MonsterModel.query();
        return models;
    }

    public async GET(id: string) {
        const model: MonsterModel = await MonsterModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_BY_NAME(name: string) {
        const models: MonsterModel = await MonsterModel.query().where('name', name);

        if (models.length == 0) {
            return false;
        }

        await this.ApplyModel(models[0]);
        return true;
    }

    public async POST(name: string, description: string, level: number, category: string, type: AttackType, health: number, strength: number, attack: number, attackDescription: string, attackCritDescription: string, imageUrl: string, creatorId: string, number: number) {
        const model = await MonsterModel.New(name, description, level, category, type.toString(), health, strength, attack, attackDescription, attackCritDescription, imageUrl, creatorId, number);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data: any, trx?: any) {
        await MonsterModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public ApplyModel(model: MonsterModel) {
        this.id = model.id;
        this.name = model.name;
        this.description = model.description;
        this.level = model.level;
        this.category = model.category;
        this.type = model.type;
        this.health = model.health;
        this.strength = model.strength;
        this.attack = model.attack;
        this.attackDescription = model.attack_description;
        this.attackCritDescription = model.attack_crit_description;
        this.imageUrl = model.image_url;
        this.creatorId = model.creator_id;
        this.creationDate = model.creationDate;
        this.number = model.number;
    }

    public EditMonster(name: string = this.name, description: string = this.description, level: number = this.level, category: string = this.category, type: AttackType = this.type, health: number = this.health, strength: number = this.strength, attack: number = this.attack, attackDescription: string = this.attackDescription, attackCritDescription: string = this.attackCritDescription, imageUrl: string = this.imageUrl) {
        this.name = name;
        this.description = description;
        this.level = level;
        this.category = category;
        this.type = type;
        this.health = health;
        this.strength = strength;
        this.attack = attack;
        this.attackDescription = attackDescription;
        this.attackCritDescription = attackCritDescription;
        this.imageUrl = imageUrl;

        this.UPDATE({
            name: this.name,
            description: this.description,
            level: this.level,
            category: this.category,
            type: this.type.toString(),
            health: this.health,
            attack: this.attack,
            strength: this.strength,
            attack_description: this.attackDescription,
            attack_crit_description: this.attackCritDescription,
            image_url: this.imageUrl,
        });
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

    public SetAttackRoll(attack: number) {
        this.attack = attack;
    }

    public GetAttackDescription() {
        return this.attackDescription;
    }

    public GetAttackCritDescription() {
        return this.attackCritDescription;
    }

    public GetAttackStrength(crit?: boolean) {
        return this.strength * (crit ? 2 : 1);
    }

    public SetAttackStrength(strength: number) {
        this.strength = strength;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    public GetNumber() {
        return this.number;
    }
}