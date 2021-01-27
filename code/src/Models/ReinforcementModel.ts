import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class ReinforcementsModel extends Model {

    static get tableName() {
        return 'reinforcements';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'reinforcements.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'reinforcements.character_id',
                to: 'characters.id',
            }
        }
    }

    public static async New(battle: Battle, character: Character, receiver: Character) {
        const reinforcementId = Utils.UUID();

        const reinforcement = await ReinforcementsModel.query()
            .insert({
                id: reinforcementId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                reinforcement_date: Utils.GetNowString(),
            })

        return reinforcement;
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