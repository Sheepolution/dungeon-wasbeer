import { Utils } from '../Utils/Utils';
import Monster from '../Objects/Monster';
import MonsterModel from './MonsterModel';

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
        }
    }

    public static async New(monster:Monster) {
        const battleId = Utils.UUID();

        const battle = await BattleModel.query()
            .insert({
                id:battleId,
                active: true,
                monster_id: monster.GetId(),
                monster_health: monster.GetHealth()
            })

        return battle;
    }

    public async GetMonster() {
        const monster = new Monster();
        monster.ApplyModel(await this.$relatedQuery('monsters'));
        return monster;
    }
}