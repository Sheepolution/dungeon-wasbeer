import Player from './Player';
import { LogType } from '../Enums/LogType';
import LogModel from '../Models/LogModel';
import Character from './Character';

export default class Log {

    protected id:string;

    public static async STATIC_POST(player:Player, subjectId:string, logType:LogType, description:string) {
        await LogModel.New(player, subjectId, logType, description);
    }

    public static async FIND_TOTAL_INSPIRES_BY_CHARACTER(character:Character) {
        const inspires = await LogModel.query().where({player_id: character.GetPlayer().GetId(), type:LogType.Inspire}).count('id');
        return inspires[0].count || 0;
    }
}