import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class PerceptionsModel extends Model {

    static get tableName() {
        return 'perceptions';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'perceptions.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'perceptions.character_id',
                to: 'characters.id',
            }
        },
        receiver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'perceptions.receiver_id',
                to: 'characters.id',
            }
        },
    }

    public static async New(battle: Battle, character: Character, receiver: Character, oldCooldown: number, newCooldown: number) {
        const perceptionId = Utils.UUID();

        const perception = await PerceptionsModel.query()
            .insert({
                id: perceptionId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                old_cooldown: oldCooldown,
                new_cooldown: newCooldown,
                perception_date: Utils.GetNowString(),
            })

        return perception;
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

    public async GetReceiver() {
        const receiver = new Character();
        receiver.ApplyModel(await this.$relatedQuery('receiver'));
        return receiver;
    }
}