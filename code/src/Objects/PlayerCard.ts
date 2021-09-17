import Card from './Card';
import Player from './Player';
import PlayerCardModel from '../Models/PlayerCardModel';

export default class PlayerCard {
    protected id: string;
    private card: Card;
    private amount: number;
    private equipped: number;
    private taken: number;
    private player: Player;
    private isUsedInTrade: boolean;

    constructor(player: Player) {
        this.player = player;
    }

    public static async GET_OWNERS_OF_CARD(name: string) {
        const list = await PlayerCardModel.query()
            .join('players', 'players.id', '=', 'player_cards.player_id')
            .join('cards', 'cards.id', '=', 'player_cards.card_id')
            .select('players.discord_name', 'player_cards.amount', 'player_cards.equipped', 'player_cards.taken')
            .where('cards.name', '=', name)
            .orderBy('player_cards.amount');

        return list;
    }

    public static async ResetTaken() {
        await PlayerCardModel.query().patch({taken: 0});
    }

    public async GET(id: string) {
        const model: PlayerCardModel = await PlayerCardModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(cardId: string, playerId: string) {
        const model = await PlayerCardModel.New(cardId, playerId);
        await this.ApplyModel(model);
        return this;
    }

    public async DELETE() {
        await PlayerCardModel.query().deleteById(this.id);
    }

    public async UPDATE(data: any, trx?: any) {
        await PlayerCardModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model: PlayerCardModel) {
        this.id = model.id;
        this.card = await model.GetCard();
        this.amount = model.amount;
        this.equipped = model.equipped;
        this.taken = model.taken || 0;
    }

    public GetId() {
        return this.id;
    }

    public async AddCard() {
        this.amount += 1;
        await this.UPDATE({ amount: this.amount });
    }

    public async RemoveOne() {
        this.amount -= 1;

        if (this.amount > 0) {
            await this.UPDATE({ amount: this.amount });
            return false;
        }

        await this.DELETE();
        this.player.RemoveCard(this);
        return true;
    }

    public async RemoveAmount(amount: number) {
        this.amount -= amount;

        if (this.amount > 0) {
            await this.UPDATE({ amount: this.amount });
            return false;
        }

        await this.DELETE();
        this.player.RemoveCard(this);
        return true;
    }

    public async TakeOne() {
        this.taken += 1;
        await this.UPDATE({ taken: this.taken });
    }

    public GetCard() {
        return this.card;
    }

    public GetCardId() {
        return this.card.GetId();
    }

    public GetAmount() {
        return this.amount - this.taken;
    }

    public CanBeTraded() {
        return this.equipped != 1 || this.amount > 1;
    }

    public IsEquipped() {
        return this.equipped == 1;
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

    public async SetEquipped(equipped: boolean) {
        this.equipped = equipped ? 1 : 0;
        await this.UPDATE({ equipped: this.equipped });
    }
}