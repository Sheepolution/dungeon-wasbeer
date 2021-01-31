import Battle from './Battle';
import Character from './Character';
import ProtectModel from '../Models/ProtectionModel';
import { Utils } from '../Utils/Utils';

export default class Protect {

    protected id: string;
    private battle: Battle;
    private character: Character;
    private receiver: Character;
    private roll: number;
    private protectDate: Date;

    public static async FIND_PROTECTIONS_DONE_BY_CHARACTER(character: Character) {
        const totalProtections = await ProtectModel.query().where({ character_id: character.GetId() }).count('id');
        return totalProtections[0].count || 0;
    }

    public static async FIND_PROTECTIONS_RECEIVED_BY_CHARACTER(character: Character) {
        const totalProtectd = await ProtectModel.query().where({ receiver_id: character.GetId() }).count('id')
        return totalProtectd[0].count || 0;
    }

    public static async FIND_TOTAL_PROTECTED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle: Battle) {
        const totalProtected = await ProtectModel.query().where({ battle_id: battle.GetId() }).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').sum('final_protection');
        return totalProtected;
    }

    public static async GET_TOP_PROTECTIONS_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ProtectModel.query()
            .join('characters', 'characters.id', '=', 'protections.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('players.id', 'name', 'discord_name')
            .groupBy('players.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_PROTECTION_DONE_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ProtectModel.query()
            .join('characters', 'characters.id', '=', 'protections.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_protection as sump')
            .orderBy('sump', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_PROTECTIONS_RECEIVED_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ProtectModel.query()
            .join('characters', 'characters.id', '=', 'protections.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('characters.id', 'name', 'discord_name')
            .groupBy('characters.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_PROTECTION_RECEIVED_LIST(battleId?: string) {
        var whereObj: any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await ProtectModel.query()
            .join('characters', 'characters.id', '=', 'protections.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .sum('final_protection as sump')
            .orderBy('sump', 'desc')
            .limit(10);

        return list;
    }


    public static async STATIC_POST(battle: Battle, character: Character, receiver: Character, characterCharisma: number, roll: number, finalProtection: number) {
        return await ProtectModel.New(battle, character, receiver, characterCharisma, roll, finalProtection);
    }

    public async GET(id: string) {
        const model: ProtectModel = await ProtectModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data: any, trx?: any) {
        await ProtectModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model: ProtectModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.receiver = await model.GetReceiver();
        this.roll = model.roll;
        this.protectDate = <Date>Utils.ConvertDateToUtc(model.protect_date);
    }

    public GetId() {
        return this.id;
    }
}