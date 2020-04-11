import CardModel from '../Models/CardModel';

export default class Card {
    protected id:string;
    private name:string;
    private description:string;
    private rank:number;
    private category:string
    private special:boolean;
    private modifier:string;
    private modifierAmount:string;
    private imageUrl:string;
    private creatorId:string;
    private creationDate:string;

    constructor() {
    }

    public static async GET_ALL()
    {
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

    public async POST(name:string, description:string, rank:number, category:string, imageUrl:string, creatorId:string) {
        const model = await CardModel.New(name, description, rank, category, imageUrl, creatorId);
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
        this.special = model.special;
        this.modifier = model.modifier;
        this.modifierAmount = model.modifier;
    }

    public async EditCard(name?:string, description?:string, rank?:number, category?:string) {
        this.name = name || this.name;
        this.description = description || this.description;
        this.rank = rank || this.rank;
        this.category = category || this.category;

        this.UPDATE({
            name: this.name,
            description: this.description,
            rank: this.rank,
            category: this.category,
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

    public GetImageUrl() {
        return this.imageUrl;
    }
}