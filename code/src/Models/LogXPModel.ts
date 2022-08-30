import { Utils } from '../Utils/Utils';

const { Model } = require('objection');

export default class LogXPModel extends Model {

    static get tableName() {
        return 'logs_xp';
    }

    public static async New(battleId: string, characterId: string, xp: number, dateString: string, trx: any) {
        const logXPId = Utils.UUID();

        const log = await LogXPModel.query()
            .insert({
                id: logXPId,
                battle_id: battleId,
                character_id: characterId,
                xp: xp,
                log_date: dateString,
            }, trx);

        return log;
    }
}