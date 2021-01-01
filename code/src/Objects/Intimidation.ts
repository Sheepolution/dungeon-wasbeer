import Battle from './Battle';
import Character from './Character';
import IntimidationModel from '../Models/IntimidationModel';

export default class Intimidation {

    protected id:string;

    public static async FIND_INTIMIDATIONS_DONE_BY_CHARACTER(character:Character) {
        const totalPerceptions = await IntimidationModel.query().where({character_id: character.GetId()}).count('id');
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_INTIMIDATIONS_RECEIVED_BY_CHARACTER(character:Character) {
        const totalPerceptions = await IntimidationModel.query().where({receiver_id: character.GetId()}).count('id')
        return totalPerceptions[0].count || 0;
    }

    public static async FIND_TOTAL_INTIMIDATIONS_FOR_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalPerceptions = await IntimidationModel.query().where({battle_id: battle.GetId()}).whereRaw('??!=??', ['character_id', 'claimer_id']).groupBy('character_id').select('character_id').count('id as cnt');
        return totalPerceptions;
    }

    public static async GET_TOP_INTIMIDATIONS_DONE_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await IntimidationModel.query()
            .join('characters', 'characters.id', '=', 'intimidations.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_INTIMIDATIONS_CLAIMED_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await IntimidationModel.query()
            .join('characters', 'characters.id', '=', 'intimidations.claimer_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle:Battle, character:Character) {
        return await IntimidationModel.New(battle, character);
    }

    public async UPDATE(data:any, trx?:any) {
        await IntimidationModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:IntimidationModel) {
        this.id = model.id;
    }

    public GetId() {
        return this.id;
    }

    public async SetClaimer(claimer:Character) {
        await this.UPDATE({
            claimer_id: claimer.GetId()
        })
    }
}