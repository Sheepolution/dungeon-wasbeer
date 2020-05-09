import Player from './Player';
import { LogType } from '../Enums/LogType';
import LogModel from '../Models/LogModel';

export default class Log {

    protected id:string;

    public static async STATIC_POST(player:Player, subjectId:string, logType:LogType, description:string) {
        await LogModel.New(player, subjectId, logType, description);
    }
}