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

    public static async GET_TOP_ALL_INSPIRES_DONE() {
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

    public static async GET_TOP_ALL_INSPIRES_GET() {
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

    public static async GET_TOP_INSPIRES_DONE(battleId?:string) {
        const list = await LogModel.query()
            .where('type', 'Inspire')
            .join('players', 'players.id', '=', 'logs.player_id')
            .join('battles', 'battles.id', '=', LogModel.raw('?', [battleId]))
            .select('discord_name')
            .whereRaw('??>??', ['logs.log_date', 'battles.start_date'])
            .whereRaw('??<??', ['logs.log_date', LogModel.raw('coalesce(battles.end_date, now())')])
            .groupBy('players.discord_name')
            .count('logs.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_INSPIRES_GET(battleId?:string) {
        const list = await LogModel.query()
            .where('type', 'Inspire')
            .join('characters', 'characters.id', '=', 'logs.subject_id')
            .join('players', 'players.id', '=', 'characters.player_id')
            .join('battles', 'battles.id', '=', LogModel.raw('?', [battleId]))
            .select('name', 'discord_name')
            .whereRaw('??>??', ['logs.log_date', 'battles.start_date'])
            .whereRaw('??<??', ['logs.log_date', LogModel.raw('coalesce(battles.end_date, now())')])
            .groupBy( 'characters.name', 'players.discord_name')
            .count('logs.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_CARD_TAKEN() {
        const list = await LogModel.query()
            .where('type', 'CardTaken')
            .join('players', 'players.id', '=', 'logs.player_id')
            .select('discord_name')
            .groupBy('players.discord_name')
            .count('logs.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async FIND_TOTAL_INSPIRED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const knex = LogModel.knex();
        var totalInspired = await knex.raw(`select mc.id as id, count(mc.id) as cnt from logs l
            join players p on p.id = l.player_id
            join characters mc on mc.id = p.character_id
            join characters yc on yc.id = l.subject_id
            where l.type = 'Inspire'
            and l.log_date > ? and l.log_date < ?
            and mc.id != yc.id
            group by mc.id`, [battle.GetStartDate(), battle.GetEndDate()]);

        return totalInspired.rows;
    }
}