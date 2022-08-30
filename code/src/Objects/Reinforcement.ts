import Battle from './Battle';
import Character from './Character';
import ReinforcementModel from '../Models/ReinforcementModel';

export default class Reinforcement {

    protected id: string;

    public static async FIND_REINFORCEMENTS_DONE_BY_CHARACTER(character: Character) {
        const totalPerceptions = await ReinforcementModel.query().where({ character_id: character.GetId() }).count('id');
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_REINFORCEMENTS_RECEIVED_BY_CHARACTER(character: Character) {
        const totalPerceptions = await ReinforcementModel.query().where({ receiver_id: character.GetId() }).count('id');
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_TOTAL_REINFORCEMENTS_FOR_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle: Battle) {
        const totalPerceptions = await ReinforcementModel.query().where({ battle_id: battle.GetId() }).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').count('id as cnt');
        return totalPerceptions;
    }

    public static async GET_TOP_REINFORCEMENTS_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ReinforcementModel.query()
            .join('characters', 'characters.id', '=', 'reinforcements.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_REINFORCEMENTS_RECEIVED_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ReinforcementModel.query()
            .join('characters', 'characters.id', '=', 'reinforcements.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle: Battle, character: Character, receiver: Character) {
        return await ReinforcementModel.New(battle, character, receiver);
    }

    public async UPDATE(data: any, trx?: any) {
        await ReinforcementModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public ApplyModel(model: ReinforcementModel) {
        this.id = model.id;
    }

    public GetId() {
        return this.id;
    }
}