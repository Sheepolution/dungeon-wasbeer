import Card from './Card';
import Player from './Player';
import PlayerCardModel from '../Models/PlayerCardModel';

export default class PlayerCard {
    protected id:string;
    private card:Card;
    private amount:number;
    private slotted:number;
    private deleted:boolean;
    private player:Player;
    private isUsedInTrade:boolean;

    constructor(player:Player) {
        this.player = player;
    }

    public async GET(id:string) {
        const model:PlayerCardModel = await PlayerCardModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(cardId:string, playerId:string) {
        const model = await PlayerCardModel.New(cardId, playerId);
        await this.ApplyModel(model);
        return this;
    }

    public async DELETE() {
        await PlayerCardModel.query().deleteById(this.id);
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
        this.slotted = model.slotted;
    }

    public GetId() {
        return this.id;
    }

    public async AddCard() {
        this.amount += 1;
        const data = { amount: this.amount };
        await this.UPDATE(data);
    }

    public async RemoveOne() {
        this.amount -= 1;

        if (this.amount > 0) {
            const data = { amount: this.amount };
            await this.UPDATE(data);
            return;
        }

        await this.DELETE();
        this.player.RemoveCard(this);
    }

    public GetCard() {
        return this.card;
    }

    public GetCardId() {
        return this.card.GetId();
    }

    public GetAmount() {
        return this.amount;
    }

    public CanBeTraded() {
        return this.slotted != 1 || this.amount > 1;
    }

    public IsInSlot() {
        return this.slotted == 1;
    }

    public StartUsingInTrade() {
        this.isUsedInTrade = true;
    }

    public StopUsingInTrade() {
        this.isUsedInTrade = false;
    }

    public IsUsedInTrade() {
        return this.isUsedInTrade;
    }

    public async SetSlotted(slot:boolean) {
        this.slotted = slot ? 1 : 0;
        await this.UPDATE({slotted: this.slotted});
    }
}