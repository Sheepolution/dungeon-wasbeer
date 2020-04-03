import Card from "./Card";
import PlayerCardModel from "./models/PlayerCardModel";
import CardModel from "./models/CardModel";

export default class PlayerCard {
    protected id:string;
    private card:Card;
    private amount:number;

    constructor() {
    }

    public async GET(id:string) {
        const model:PlayerCardModel = await PlayerCardModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public static async GET_ALL()
    {
        const models = await PlayerCardModel.query();
        return models;
    }

    public async FIND_SPECIFIC(cardId:string, playerId:string) {
        const models:PlayerCardModel = await PlayerCardModel.query().where('player_id', playerId).where('card_id', cardId);
        if (models.length == 0) {
            return false;
        }
        
        await this.ApplyModel(models[0]);
        return true;
    }

    public static async FIND_BY_PLAYER_ID(playerId:string) {
        const models:PlayerCardModel = await PlayerCardModel.query().where('player_id', playerId);
        return models;
    }

    public async POST(cardId:string, playerId:string) {
        const model = await PlayerCardModel.New(cardId, playerId);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await PlayerCardModel.query(trx)
        .findById(this.id)
        .patch(data);
    }

    public async ApplyModel(model:PlayerCardModel) {
        this.id = model.id;
        this.card = await model.GetCard();
        this.amount = model.amount;
    }

    public GetId() {
        return this.id;
    }

    public async AddCard() {
        this.amount += 1;
        const data = { amount: this.amount };
        await this.UPDATE(data)
    }

    public GetCard() {
        return this.card;
    }

    public GetAmount() {
        return this.amount;
    }
}