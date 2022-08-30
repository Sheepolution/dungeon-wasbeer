import { Utils } from '../Utils/Utils';
const { Model } = require('objection');

export default class EquipmentModel extends Model {

    static get tableName() {
        return 'equipments';
    }

    public static async New(playerId: string, name: string, cards: string) {
        const equipmentId = Utils.UUID();

        const equipment = await EquipmentModel.query()
            .insert({
                id: equipmentId,
                player_id: playerId,
                name: name,
                cards: cards,
                creation_date: Utils.GetNowString(),
            });

        return equipment;
    }
}