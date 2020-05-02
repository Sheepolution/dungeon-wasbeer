import Battle from './Battle';
import Character from './Character';
import AttackModel from '../Models/AttackModel';

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

    public static async FIND_TOTAL_DAMAGE_GIVEN(character:Character) {
        const totalDamageGiven = await AttackModel.query().where({character_id: character.GetId(), victory: 1}).sum('damage');
        return totalDamageGiven[0].sum || 0;
    }

    public static async FIND_TOTAL_DAMAGE_TAKEN(character:Character) {
        const totalDamageTaken = await AttackModel.query().where({character_id: character.GetId(), victory: 0}).sum('damage');
        return totalDamageTaken[0].sum || 0;
    }

    public static async FIND_TOTAL_DAMAGE_GIVEN_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalDamageGivenCollection = await AttackModel.query().where({battle_id: battle.GetId(), victory: 1}).groupBy('character_id').select('character_id').sum('damage');
        return totalDamageGivenCollection;
    }

    public static async STATIC_POST(battle:Battle, character:Character, messageId:string, rollCharacterBase:number, rollCharacterModifier:number, rollCharacterModifierMax:number, rollMonsterBase:number, rollMonsterModifier:number, rollMonsterModifierMax:number, victory:boolean, damage:number, healthAfter:number) {
        await AttackModel.New(battle, character, messageId, rollCharacterBase, rollCharacterModifier, rollCharacterModifierMax, rollMonsterBase, rollMonsterModifier, rollMonsterModifierMax, victory, damage, healthAfter);
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
        this.rollCharacterBase = model.roll_player_base;
        this.rollCharacterModifier = model.roll_player_mod;
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