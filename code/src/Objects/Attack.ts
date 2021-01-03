import AttackModel from '../Models/AttackModel';
import Battle from './Battle';
import Character from './Character';

export default class Attack {

    protected id:string;
    private battle:Battle;
    private character:Character;
    private rollCharacterBase:number;
    private rollCharacterModifier:number;
    private rollMonsterBase:number;
    private rollMonsterModifier:number;
    private victory:boolean;
    private damage:number;
    private healthAfter:number;

    public static async FIND_VICTORIES_BY_CHARACTER(character:Character) {
        const victories = await AttackModel.query().where({character_id: character.GetId(), victory: 1}).count('id');
        return victories[0].count || 0;
    }

    public static async FIND_LOSSES_BY_CHARACTER(character:Character) {
        const losses = await AttackModel.query().where({character_id: character.GetId(), victory: 0}).count('id');
        return losses[0].count || 0;
    }

    public static async FIND_BATTLES_BY_CHARACTER(character:Character) {
        const battles = await AttackModel.query().where('character_id', character.GetId()).countDistinct('battle_id');
        return battles[0].count || 0;
    }

    public static async FIND_TOTAL_DAMAGE_DONE(character:Character) {
        const totalDamageDone = await AttackModel.query().where({character_id: character.GetId(), victory: 1}).sum('damage');
        return totalDamageDone[0].sum || 0;
    }

    public static async FIND_TOTAL_DAMAGE_TAKEN(character:Character) {
        const totalDamageTaken = await AttackModel.query().where({character_id: character.GetId(), victory: 0}).sum('damage');
        return totalDamageTaken[0].sum || 0;
    }

    public static async FIND_TOTAL_CRITS_DONE(character:Character) {
        const totalCritsDone = await AttackModel.query()
            .where({victory: true, character_id: character.GetId()})
            .andWhere((model:AttackModel) => {
                model.where({roll_character_base: 1})
                    .orWhere({roll_character_base: 20})
                    .orWhere({roll_monster_base: 1})
                    .orWhere({roll_monster_base: 20})
            }).count('id');

        return totalCritsDone[0].count || 0;
    }

    public static async FIND_TOTAL_CRITS_TAKEN(character:Character) {
        const totalCritsTaken = await AttackModel.query()
            .where({victory: false, character_id: character.GetId()})
            .andWhere((model:AttackModel) => {
                model.where({roll_character_base: 1})
                    .orWhere({roll_character_base: 20})
                    .orWhere({roll_monster_base: 1})
                    .orWhere({roll_monster_base: 20})
            }).count('id');

        return totalCritsTaken[0].count || 0;
    }

    public static async FIND_TOTAL_DAMAGE_GIVEN_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalDamageGivenCollection = await AttackModel.query().where({battle_id: battle.GetId(), victory: 1}).groupBy('character_id').select('character_id').sum('damage');
        return totalDamageGivenCollection;
    }

    public static async GET_TOP_BATTLES_LIST(victory?:boolean, battleId?:string) {
        var whereObj:any = {};
        if (victory != null) {
            whereObj.victory = victory;
        }

        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        const list = await AttackModel.query()
            .join('characters', 'characters.id', '=', 'attacks.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('characters.id', 'name', 'discord_name')
            .groupBy('characters.id', 'characters.name', 'players.discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_DAMAGE_LIST(victory:boolean, battleId?:string) {
        var whereObj:any = {victory: victory};
        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        const list = await AttackModel.query()
            .join('characters', 'characters.id', '=', 'attacks.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .sum('damage as sumd')
            .orderBy('sumd', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_CRIT_LIST(victory:boolean, battleId?:string) {
        var whereObj:any = {victory: victory};

        if (battleId != null) {
            whereObj.battle_id = battleId;
        }

        const list = await AttackModel.query()
            .join('characters', 'characters.id', '=', 'attacks.character_id')
            .join('players', 'characters.player_id', '=', 'players.id')
            .where(whereObj)
            .andWhere((model:AttackModel) => {
                model.where({roll_character_base: 1})
                    .orWhere({roll_character_base: 20})
                    .orWhere({roll_monster_base: 1})
                    .orWhere({roll_monster_base: 20})
            })
            .groupBy('characters.name', 'players.discord_name')
            .select('name', 'discord_name')
            .count('characters.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_MOST_LUCK_LIST(battleId?:string, unlucky:boolean = false) {
        const knex = AttackModel.knex();
        var averageRolls = await knex.raw(`select q.discord_name, q.name, q.res from (
            select count(c.id) as cnt, p.discord_name as discord_name, c.name as name, avg(roll_character_base) - avg(roll_monster_base) as res from attacks a
            join characters c on c.id = a.character_id
            join players p on p.character_id = c.id
            where roll_character_base not in (1, 20) and roll_monster_base not in (1, 20)
            ${battleId == null ? '' : `and a.battle_id = '${battleId}'`}
            group by p.discord_name, c.name) as q
            where q.cnt >= ${battleId == null ? '100' : '6'}
            order by q.res ${unlucky ? '' : 'desc'}
            limit 10;`);

        return averageRolls.rows;
    }

    public static async STATIC_POST(battle:Battle, character:Character, messageId:string, rollCharacterBase:number, rollCharacterModifier:number, rollCharacterModifierMax:number, rollMonsterBase:number, rollMonsterModifier:number, rollMonsterModifierMax:number, victory:boolean, damage:number, healthAfter:number) {
        return await AttackModel.New(battle, character, messageId, rollCharacterBase, rollCharacterModifier, rollCharacterModifierMax, rollMonsterBase, rollMonsterModifier, rollMonsterModifierMax, victory, damage, healthAfter);
    }

    public async GET(id:string) {
        const model:AttackModel = await AttackModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async UPDATE(data:any, trx?:any) {
        await AttackModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:AttackModel) {
        this.id = model.id;
        this.battle = await model.GetBattle();
        this.character = await model.GetCharacter();
        this.rollCharacterBase = model.roll_character_base;
        this.rollCharacterModifier = model.roll_character_mod;
        this.rollMonsterBase = model.roll_monster_base;
        this.rollMonsterModifier = model.roll_monster_mod;
        this.victory = model.victory;
        this.damage = model.damage;
        this.healthAfter = model.health_after;
    }

    public GetId() {
        return this.id;
    }
}