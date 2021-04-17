import Battle from './Battle';
import Character from './Character';
import ChargeModel from '../Models/ChargeModel';
import { Utils } from '../Utils/Utils';

export default class Charge {

    protected id: string;
    private battle: Battle;
    private character: Character;
    private roll: number;
    private chargeDate: Date;

    public static async FIND_CHARGES_DONE_BY_CHARACTER(character: Character) {
        const totalCharges = await ChargeModel.query().where({ character_id: character.GetId() }).count('id');
        return totalCharges[0].count || 0;
    }

    public static async GET_TOP_CHARGES_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ChargeModel.query()
            .join('characters', 'characters.id', '=', 'charges.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('players.id', 'name', 'discord_name')
            .groupBy('players.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_CHARGING_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ChargeModel.query()
            .join('characters', 'characters.id', '=', 'charges.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_charge as sumc')
            .orderBy('sumc', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle: Battle, character: Character, characterArmor: number, roll: number, finalCharge: number) {
        return await ChargeModel.New(battle, character, characterArmor, roll, finalCharge);
    }

    public async GET(id: string) {
        const model: ChargeModel = await ChargeModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data: any, trx?: any) {
        await ChargeModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model: ChargeModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.roll = model.roll;
        this.chargeDate = <Date>Utils.GetDateOrNull(model.charge_date);
    }

    public GetId() {
        return this.id;
    }
}