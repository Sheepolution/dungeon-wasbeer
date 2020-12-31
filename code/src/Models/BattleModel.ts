import { Utils } from '../Utils/Utils';
import Monster from '../Objects/Monster';
import MonsterModel from './MonsterModel';
import IntimidationsModel from './IntimidationModel';
import Intimidation from '../Objects/Intimidation';

const { Model } = require('objection');

export default class BattleModel extends Model {

    static get tableName() {
        return 'battles';
    }

    static relationMappings = {
        monsters: {
            relation: Model.BelongsToOneRelation,
            modelClass: MonsterModel,
            join: {
                from: 'battles.monster_id',
                to: 'monsters.id',
            }
        },
        intimidations: {
            relation: Model.BelongsToOneRelation,
            modelClass: IntimidationsModel,
            join: {
                from: 'battles.intimidation_id',
                to: 'intimidations.id',
            }
        }
    }

    public static async New(monster:Monster) {
        const battleId = Utils.UUID();

        const battle = await BattleModel.query()
            .insert({
                id:battleId,
                active: true,
                monster_id: monster.GetId(),
                monster_health: monster.GetHealth(),
                start_date: Utils.GetNowString(),
            })

        return battle;
    }

    public async GetMonster() {
        const monster = new Monster();
        monster.ApplyModel(await this.$relatedQuery('monsters'));
        return monster;
    }

    public async GetIntimidation() {
        if (this.intimidation_id == null) {
            return;
        }

        const intimidation = new Intimidation();
        intimidation.ApplyModel(await this.$relatedQuery('intimidations'));
        return intimidation;
    }
}