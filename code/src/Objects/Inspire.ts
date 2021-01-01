import Battle from './Battle';
import Character from './Character';
import InspireModel from '../Models/InspireModel';
import { Utils } from '../Utils/Utils';

export default class Inspire {

    protected id:string;
    private battle:Battle;
    private character:Character;
    private receiver:Character;
    private roll:number;
    private inspireDate:Date;

    public static async FIND_INSPIRES_DONE_BY_CHARACTER(character:Character) {
        const totalInspires = await InspireModel.query().where({character_id: character.GetId()}).count('id');
        return totalInspires[0].count || 0;
    }

    public static async FIND_INSPIRES_RECEIVED_BY_CHARACTER(character:Character) {
        const totalInspired = await InspireModel.query().where({receiver_id: character.GetId()}).count('id')
        return totalInspired[0].count || 0;
    }

    public static async FIND_TOTAL_INSPIRED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalHealed = await InspireModel.query().where({battle_id: battle.GetId()}).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').sum('final_inspiration');
        return totalHealed;
    }

    public static async GET_TOP_INSPIRES_DONE_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await InspireModel.query()
            .join('characters', 'characters.id', '=', 'inspires.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('players.id', 'name', 'discord_name')
            .groupBy('players.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_INSPIRES_RECEIVED_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await InspireModel.query()
            .join('characters', 'characters.id', '=', 'inspires.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('players.id', 'name', 'discord_name')
            .groupBy('players.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle:Battle, character:Character, receiver:Character, characterCharisma:number, roll:number, finalInspiration:number) {
        return await InspireModel.New(battle, character, receiver, characterCharisma, roll, finalInspiration);
    }

    public async GET(id:string) {
        const model:InspireModel = await InspireModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data:any, trx?:any) {
        await InspireModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:InspireModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.receiver = await model.GetReceiver();
        this.roll = model.roll;
        this.inspireDate = <Date> Utils.ConvertDateToUtc(model.inspire_date);
    }

    public GetId() {
        return this.id;
    }
}