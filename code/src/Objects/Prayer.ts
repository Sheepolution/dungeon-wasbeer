import Battle from './Battle';
import Character from './Character';
import PrayerModel from '../Models/PrayerModel';
import { Utils } from '../Utils/Utils';

export default class Prayer {

    protected id: string;
    private battle: Battle;
    private character: Character;
    private roll: number;
    private prayDate: Date;

    public static async FIND_PRAYERS_DONE_BY_CHARACTER(character: Character) {
        const totalCharges = await PrayerModel.query().where({ character_id: character.GetId() }).count('id');
        return totalCharges[0].count || 0;
    }

    public static async GET_TOP_PRAYER_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await PrayerModel.query()
            .join('characters', 'characters.id', '=', 'prayers.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('players.id', 'name', 'discord_name')
            .groupBy('players.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_BLESSING_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await PrayerModel.query()
            .join('characters', 'characters.id', '=', 'prayers.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_blessing as sumb')
            .orderBy('sumb', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle: Battle, character: Character, characterWisdom: number, roll: number, finalBlessing: number) {
        return await PrayerModel.New(battle, character, characterWisdom, roll, finalBlessing);
    }

    public async GET(id: string) {
        const model: PrayerModel = await PrayerModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data: any, trx?: any) {
        await PrayerModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model: PrayerModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.roll = model.roll;
        this.prayDate = <Date>Utils.GetDateOrNull(model.pray_date);
    }

    public GetId() {
        return this.id;
    }
}