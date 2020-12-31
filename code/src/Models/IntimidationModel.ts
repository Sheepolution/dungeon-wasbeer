import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class IntimidationsModel extends Model {

    static get tableName() {
        return 'intimidations';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'intimidations.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'intimidations.character_id',
                to: 'characters.id',
            }
        }
    }

    public static async New(battle:Battle, character:Character) {
        const intimidationId = Utils.UUID();

        const intimidation = await IntimidationsModel.query()
            .insert({
                id: intimidationId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                intimidation_date: Utils.GetNowString(),
            })

        return intimidation;
    }

    public async GetBattle() {
        const battle = new Battle();
        battle.ApplyModel(await this.$relatedQuery('battles'));
        return battle;
    }

    public async GetCharacter() {
        const character = new Character();
        character.ApplyModel(await this.$relatedQuery('character'));
        return character;
    }
}