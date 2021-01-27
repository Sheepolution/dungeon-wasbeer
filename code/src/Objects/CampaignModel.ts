import { Utils } from '../Utils/Utils';
import Battle from './Battle';
import { SessionType } from '../Enums/SessionType';
import BattleModel from '../Models/BattleModel';
import Puzzle from './Puzzle';
import PuzzleModel from '../Models/PuzzleModel';

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
        },
        puzzles: {
            relation: Model.BelongsToOneRelation,
            modelClass: PuzzleModel,
            join: {
                from: 'campaign.session_id',
                to: 'puzzles.id',
            }
        }
    }

    public static async New(sessionType: SessionType, sessionId: string) {
        const campaignId = Utils.UUID();

        const campaign = await CampaignModel.query()
            .insert({
                id: campaignId,
                active: true,
                session_type: sessionType,
                session_id: sessionId,
                start_date: Utils.GetNowString(),
                end_date: null,
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

    public async GetPuzzle() {
        const puzzle = new Puzzle();
        puzzle.ApplyModel(await this.$relatedQuery('puzzles'));
        return puzzle;
    }
}