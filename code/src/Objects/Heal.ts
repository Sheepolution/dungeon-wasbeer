import Battle from './Battle';
import Character from './Character';
import AttackModel from '../Models/AttackModel';
import HealModel from '../Models/HealModel';

export default class Heal {

    protected id:string;
    private battle:Battle;
    private character:Character;
    private receiver:Character;
    private receiverHealth:number;
    private characterHealing:number;
    private roll:number;
    private finalHealing:number;

    public static async FIND_HEALS_BY_CHARACTER(character:Character) {
        const totalHeals = await HealModel.query().where({character_id: character.GetId()}).count('id');
        return totalHeals[0].count || 0;
    }

    public static async FIND_HEALED_BY_CHARACTER(character:Character) {
        const totalHealed = await HealModel.query().where({character_id: character.GetId()}).sum('final_healing');
        return totalHealed[0].sum || 0;
    }

    public static async FIND_TOTAL_HEALED_IN_BATTLE_FOR_ALL_CHARACTERS(battle:Battle) {
        const totalHealed = await HealModel.query().where({battle_id: battle.GetId()}).groupBy('character_id').select('character_id').sum('final_healing');
        return totalHealed;
    }

    public static async STATIC_POST(battle:Battle, character:Character, receiver:Character, receiverHealth:number, characterHealing:number, roll:number, finalHealing:number) {
        return await HealModel.New(battle, character, receiver, receiverHealth, characterHealing, roll, finalHealing);
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
        this.receiver = await model.GetReceiver();
        this.receiverHealth = model.receiver_health;
        this.characterHealing = model.character_healing;
        this.roll = model.roll;
        this.finalHealing = model.final_healing;
    }

    public GetId() {
        return this.id;
    }
}