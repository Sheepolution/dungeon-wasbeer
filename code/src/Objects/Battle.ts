import BattleModel from '../Models/BattleModel';
import Monster from './Monster';
import { Utils } from '../Utils/Utils';

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
        var strength = this.monster.GetAttackStrength();
        if (this.monster.GetId() == '7e476ee1-c32a-426b-b278-a03d6f85f164') {
            var missing = Math.ceil(this.monster.GetHealth() / 1000) - Math.ceil(this.monsterHealth / 1000);
            strength += missing * 3;
        }

        return strength * (crit ? 2 : 1);
    }

    public GetMonsterAttackRoll() {
        var attackRoll = this.monster.GetAttackRoll();
        if (this.monster.GetId() == '7e476ee1-c32a-426b-b278-a03d6f85f164') {
            var missing = Math.ceil(this.monster.GetHealth() / 1000) - Math.ceil(this.monsterHealth / 1000);
            attackRoll += missing * 2;
        }

        return attackRoll;
    }

    public GetMonsterImageUrl() {
        if (this.monster.GetId() == '7e476ee1-c32a-426b-b278-a03d6f85f164') {
            var missing = Math.ceil(this.monster.GetHealth() / 1000) - Math.ceil(this.monsterHealth / 1000);
            switch (missing) {
                case 0: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643201971617804/2_heads.png';
                case 1: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643221142863904/3_heads.png';
                case 2: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643229779853332/4_heads.png';
                case 3: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643237874860113/5_heads.png';
                case 4: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643247000748072/6_heads.png';
                case 5:
                case 6:
                case 7:
                case 8:
                case 9: return 'https://cdn.discordapp.com/attachments/698616506862272602/769643255964893224/7_heads.png';
            }
        }
        return this.monster.GetImageUrl();
    }

    public GetMonsterAttackDescription() {
        return this.monster.GetAttackDescription();
    }

    public GetMonsterAttackCritDescription() {
        return this.monster.GetAttackCritDescription();
    }

    public GetStartDate() {
        return this.startDate;
    }

    public GetEndDate() {
        return this.endDate;
    }

    public async DealDamageToMonster(damage:number) {
        this.monsterHealth = Math.max(0, this.monsterHealth - damage);
        await this.UPDATE({monster_health: this.monsterHealth})
        return damage;
    }

    public IsMonsterDead() {
        return this.monsterHealth <= 0;
    }

    public async HealMonster(amount:number) {
        this.monsterHealth = Math.min(this.monster.GetHealth(), this.monsterHealth + amount);
        await this.UPDATE({monster_health: this.monsterHealth})
    }

    public async Complete() {
        await this.UPDATE({
            active: false,
            end_date: Utils.GetNowString(),
        })
    }
}