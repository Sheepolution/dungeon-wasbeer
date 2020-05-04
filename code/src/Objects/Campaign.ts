import Battle from './Battle';
import CampaignModel from './CampaignModel';
import { SessionType } from '../Enums/SessionType';
import Puzzle from './Puzzle';

export default class Campaign {

    protected id:string;
    private active:boolean;
    private sessionType:SessionType;
    private battle:Battle;
    private puzzle:Puzzle;

    public async GET(id:string) {
        const model:CampaignModel = await CampaignModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_ACTIVE() {
        const models = await CampaignModel.query().where('active', 1);
        const model = models[0];

        if (model) {
            await this.ApplyModel(model)
            return true;
        }

        return false;
    }

    public async POST(sessionType:SessionType, sessionId:string) {
        const model = await CampaignModel.New(sessionType, sessionId);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await CampaignModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:CampaignModel) {
        this.id = model.id;
        this.active = model.active;
        this.sessionType = await model.GetSessionType();

        if (this.sessionType == SessionType.Battle) {
            this.battle = await model.GetBattle();
        } else {
            this.puzzle = await model.GetPuzzle();
        }
    }

    public GetId() {
        return this.id;
    }

    public GetBattle() {
        return this.battle;
    }

    public GetPuzzle() {
        return this.puzzle;
    }

    public CompleteSession() {
        this.UPDATE({
            active: false
        })
    }

}