import Battle from './Battle';
import Character from './Character';
import PerceptionModel from '../Models/PerceptionModel';

export default class Perception {

    public static async FIND_PERCEPTIONS_DONE_BY_CHARACTER(character: Character) {
        const totalPerceptions = await PerceptionModel.query().where({ character_id: character.GetId() }).count('id');
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_PERCEPTIONS_RECEIVED_BY_CHARACTER(character: Character) {
        const totalPerceptions = await PerceptionModel.query().where({ receiver_id: character.GetId() }).count('id')
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_TOTAL_PERCEPT_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle: Battle) {
        const totalPerceptions = await PerceptionModel.query().where({ battle_id: battle.GetId() }).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').count('id as cnt');
        return totalPerceptions;
    }

    public static async GET_TOP_PERCEPTIONS_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await PerceptionModel.query()
            .join('characters', 'characters.id', '=', 'perceptions.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_PERCEPTIONS_RECEIVED_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await PerceptionModel.query()
            .join('characters', 'characters.id', '=', 'perceptions.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle: Battle, character: Character, receiver: Character, oldCooldown: number, newCooldown: number) {
        return await PerceptionModel.New(battle, character, receiver, oldCooldown, newCooldown);
    }
}