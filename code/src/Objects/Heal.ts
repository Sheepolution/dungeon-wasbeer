import Battle from './Battle';
import Character from './Character';
import HealModel from '../Models/HealModel';
import { Utils } from '../Utils/Utils';

export default class Heal {

    protected id:string;
    private battle:Battle;
    private character:Character;
    private receiver:Character;
    private receiverHealth:number;
    private characterHealing:number;
    private roll:number;
    private finalHealing:number;
    private healDate:Date;

    public static async FIND_HEALS_DONE_BY_CHARACTER(character:Character) {
        const totalHeals = await HealModel.query().where({character_id: character.GetId()}).count('id');
        return totalHeals[0].count || 0;
    }

    public static async FIND_HEALING_DONE_BY_CHARACTER(character:Character) {
        const totalHealed = await HealModel.query().where({character_id: character.GetId()}).sum('final_healing');
        return totalHealed[0].sum || 0;
    }

    public static async FIND_HEALS_RECEIVED_BY_CHARACTER(character:Character) {
        const totalHealed = await HealModel.query().where({receiver_id: character.GetId()}).count('id')
        return totalHealed[0].count || 0;
    }

    public static async FIND_HEALING_RECEIVED_BY_CHARACTER(character:Character) {
        const totalHealed = await HealModel.query().where({receiver_id: character.GetId()}).sum('final_healing');
        return totalHealed[0].sum || 0;
    }

    public static async FIND_TOTAL_HEALED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalHealed = await HealModel.query().where({battle_id: battle.GetId()}).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').sum('final_healing');
        return totalHealed;
    }

    public static async GET_TOP_HEALS_DONE_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await HealModel.query()
            .join('characters', 'characters.id', '=', 'heals.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_HEALING_DONE_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await HealModel.query()
            .join('characters', 'characters.id', '=', 'heals.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_healing as sumh')
            .orderBy('sumh', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_HEALS_RECEIVED_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await HealModel.query()
            .join('characters', 'characters.id', '=', 'heals.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_HEALING_RECEIVED_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await HealModel.query()
            .join('characters', 'characters.id', '=', 'heals.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_healing as sumh')
            .orderBy('sumh', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle:Battle, character:Character, receiver:Character, receiverHealth:number, characterHealing:number, roll:number, finalHealing:number) {
        return await HealModel.New(battle, character, receiver, receiverHealth, characterHealing, roll, finalHealing);
    }

    public async GET(id:string) {
        const model:HealModel = await HealModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data:any, trx?:any) {
        await HealModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:HealModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.receiver = await model.GetReceiver();
        this.receiverHealth = model.receiver_health;
        this.characterHealing = model.character_healing;
        this.roll = model.roll;
        this.finalHealing = model.final_healing;
        this.healDate = <Date> Utils.ConvertDateToUtc(model.heal_date);
    }

    public GetId() {
        return this.id;
    }
}