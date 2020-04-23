import Monster from './Monster';
import BattleModel from '../Models/BattleModel';

export default class Battle {

    protected id:string;
    private active:boolean;
    private monster:Monster;
    private monsterHealth:number;

    public async GET(id:string) {
        const model:BattleModel = await BattleModel.query().findById(id);
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
        this.active = model.active != 0;
        this.monster = await model.GetMonster();
        this.monsterHealth = model.monsterHealth;
    }

    public GetId() {
        return this.id;
    }

}