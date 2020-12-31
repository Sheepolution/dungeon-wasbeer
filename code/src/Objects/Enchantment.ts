import Battle from './Battle';
import Character from './Character';
import EnchantmentModel from '../Models/EnchantmentModel';

export default class Enchantment {

    public static async FIND_ENCHANTMENTS_DONE_BY_CHARACTER(character:Character) {
        const totalEnchantments = await EnchantmentModel.query().where({character_id: character.GetId()}).count('id');
        return totalEnchantments[0].count || 0;
    }

    public static async FIND_ENCHANTMENTS_RECEIVED_BY_CHARACTER(character:Character) {
        const totalEnchantments = await EnchantmentModel.query().where({receiver_id: character.GetId()}).count('id')
        return totalEnchantments[0].count || 0;
    }

    public static async FIND_TOTAL_ENCHANTED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalEnchantments = await EnchantmentModel.query().where({battle_id: battle.GetId()}).whereRaw('??!=??', ['character_id', 'receiver_id']).groupBy('character_id').select('character_id').count('id as cnt');
        return totalEnchantments;
    }

    public static async GET_TOP_ENCHANTMENTS_DONE_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await EnchantmentModel.query()
            .join('characters', 'characters.id', '=', 'enchantments.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_ENCHANTMENTS_RECEIVED_LIST(battleId?:string) {
        var whereObj:any = {};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        var list = await EnchantmentModel.query()
            .join('characters', 'characters.id', '=', 'enchantments.receiver_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async STATIC_POST(battle:Battle, character:Character, receiver:Character) {
        return await EnchantmentModel.New(battle, character, receiver);
    }
}