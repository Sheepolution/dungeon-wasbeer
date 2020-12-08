import Player from './Player';
import { LogType } from '../Enums/LogType';
import LogModel from '../Models/LogModel';
import Character from './Character';
import Battle from './Battle';

export default class Log {

    protected id:string;

    public static async STATIC_POST(player:Player, subjectId:string, logType:LogType, description:string) {
        await LogModel.New(player, subjectId, logType, description);
    }

    public static async FIND_TOTAL_INSPIRES_BY_CHARACTER(character:Character) {
        const inspires = await LogModel.query().where({player_id: character.GetPlayer().GetId(), type:LogType.Inspire}).count('id');
        return inspires[0].count || 0;
    }

    public static async GET_TOP_INSPIRES_DONE() {
        const list = await LogModel.query()
            .where('type', 'Inspire')
            .join('players', 'players.id', '=', 'logs.player_id')
            .select('discord_name')
            .groupBy('players.discord_name')
            .count('logs.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_INSPIRES_GET() {
        const list = await LogModel.query()
            .where('type', 'Inspire')
            .join('characters', 'characters.id', '=', 'logs.subject_id')
            .join('players', 'players.id', '=', 'characters.player_id')
            .select('name', 'discord_name')
            .groupBy( 'characters.name', 'players.discord_name')
            .count('logs.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async FIND_TOTAL_INSPIRED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        var totalInspired = await LogModel.query()
            .join('players as p', 'p.id', '=', 'logs.player_id')
            .join('characters as mc', 'mc.id', '=', 'p.character_id')
            .join('characters as yc', 'yc.id', '=', 'logs.subject_id')
            .where('logs.log_date', '>', battle.GetStartDate())
            .where('logs.log_date', '<', battle.GetEndDate())
            .select('mc.id')
            .groupBy('mc.id')
            .count('mc.id as cnt');

        return totalInspired;
    }
}