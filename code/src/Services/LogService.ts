import Player from '../Objects/Player';
import { LogType } from '../Enums/LogType';
import MessageService from './MessageService';
import Log from '../Objects/Log';
import LogXP from '../Objects/LogXP';

export default class LogService {
    public static async Log(player:Player, subjectId:string, logType:LogType, description:string) {
        await Log.STATIC_POST(player, subjectId, logType, description);

        if (logType.startsWith('Attack')) {
            logType.replace('Attack', 'Attack ');
        }

        MessageService.SendMessageToLogChannel(`${player.GetId()} - ${logType} - ${description}`);
    }

    public static async LogXP(battleId:string, characterId:string, xp:number, dateString:string, trx:any) {
        await LogXP.STATIC_POST(battleId, characterId, xp, dateString, trx);
    }
}