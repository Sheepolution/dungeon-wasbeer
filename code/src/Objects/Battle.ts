import Monster from './Monster';
import BattleModel from '../Models/BattleModel';

export default class Battle {

    protected id:string;
    private active:boolean;
    private monster:Monster;
    private monsterHealth:number;
    private startDate:Date;
    private endDate:Date;

    public async GET(id:string) {
        const model:BattleModel = await BattleModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async GET_LATEST() {
        const model:BattleModel = await BattleModel.query().orderBy('start_date', 'desc').first();
        await this.ApplyModel(model);
    }

    public async POST(monster:Monster) {
        const model = await BattleModel.New(monster);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await BattleModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:BattleModel) {
        this.id = model.id;
        this.active = model.active;
        this.monster = await model.GetMonster();
        this.monsterHealth = model.monster_health;
        this.startDate = model.start_date;
        this.endDate = model.end_date;
    }

    public GetId() {
        return this.id;
    }

    public GetMonster() {
        return this.monster;
    }

    public GetMaxMonsterHealth() {
        return this.monster.GetHealth();
    }

    public GetCurrentMonsterHealth() {
        return this.monsterHealth;
    }

    public GetMonsterAttackStrength(crit?:boolean) {
        return this.monster.GetAttackStrength(crit);
    }

    public GetMonsterAttackRoll() {
        return this.monster.GetAttackRoll();
    }

    public GetMonsterAttackDescription() {
        return this.monster.GetAttackDescription();
    }

    public GetMonsterAttackCritDescription() {
        return this.monster.GetAttackCritDescription();
    }

    public async DealDamageToMonster(damage:number) {
        this.monsterHealth = Math.max(0, this.monsterHealth - damage);
        await this.UPDATE({monster_health: this.monsterHealth})
        return damage;
    }

    public IsMonsterDead() {
        return this.monsterHealth <= 0;
    }

    public async Complete() {
        this.UPDATE({
            active: false
        })
    }
}