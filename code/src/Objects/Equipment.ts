import Player from './Player';
import EquipmentModel from '../Models/EquipmentModel';

export default class Equipment {
    protected id: string;
    private player: Player;
    private name: string;
    private cardIds: Array<string>;
    private creationDate: string;

    public async GET(id: string) {
        const model: EquipmentModel = await EquipmentModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_BY_NAME(playerId: string, name: string) {
        const model: EquipmentModel = await EquipmentModel.query().where({ player_id: playerId, name: name });
        if (model.length > 0) {
            this.ApplyModel(model[0]);
            return true;
        }
        return false;
    }

    public async POST(playerId: string, name: string, cardIds: Array<string>) {
        const model = await EquipmentModel.New(playerId, name, cardIds.join(','));
        this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data: any, trx?: any) {
        await EquipmentModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public ApplyModel(model: EquipmentModel) {
        this.id = model.id;
        this.player = model.playerId;
        this.name = model.name;
        this.cardIds = model.cards.split(',');
        this.creationDate = model.creation_date;
    }

    public GetId() {
        return this.id;
    }

    public GetName() {
        return this.name;
    }

    public GetCardIds() {
        return this.cardIds;
    }

    public async SetCardIds(cards: Array<string>) {
        this.cardIds = cards;
        await this.UPDATE({
            cards: this.cardIds.join(',')
        });
    }
}