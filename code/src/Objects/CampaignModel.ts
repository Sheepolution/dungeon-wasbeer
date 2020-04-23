import { Utils } from '../Utils/Utils';
import Battle from './Battle';
import { SessionType } from '../Enums/SessionType';
import BattleModel from '../Models/BattleModel';

const { Model } = require('objection');

export default class CampaignModel extends Model {

    static get tableName() {
        return 'campaign';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'campaign.session_id',
                to: 'battles.id',
            }
        }
    }

    public static async New(sessionType:SessionType, sessionId:string) {
        const campaignId = Utils.UUID();

        const campaign = await CampaignModel.query()
            .insert({
                id:campaignId,
                active: 1,
                session_type: sessionType,
                session_id: sessionId
            })

        return campaign;
    }

    public GetSessionType() {
        return (<any>SessionType)[this.session_type];
    }

    public async GetBattle() {
        const battle = new Battle();
        battle.ApplyModel(await this.$relatedQuery('battles'));
        return battle;
    }
}