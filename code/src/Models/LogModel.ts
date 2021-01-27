import Player from '../Objects/Player';
import { Utils } from '../Utils/Utils';
import { LogType } from '../Enums/LogType';

const { Model } = require('objection');

export default class LogModel extends Model {

    static get tableName() {
        return 'logs';
    }

    public static async New(player: Player, subjectId: string, logType: LogType, description: string) {
        const logId = Utils.UUID();

        const log = await LogModel.query()
            .insert({
                id: logId,
                player_id: player.GetId(),
                subject_id: subjectId,
                type: logType,
                description: description,
                log_date: Utils.GetNowString(),
            })

        return log;
    }
}