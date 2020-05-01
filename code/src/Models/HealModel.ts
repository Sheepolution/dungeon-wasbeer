import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class HealModel extends Model {

    static get tableName() {
        return 'heals';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'heals.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'heals.character_id',
                to: 'characters.id',
            }
        },
        receiver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'heals.receiver_id',
                to: 'characters.id',
            }
        },
    }

    public static async New(battle:Battle, character:Character, receiver:Character, receiverHealth:number, characterHealing:number, roll:number, finalHealing:number) {
        const healId = Utils.UUID();

        const heal = await HealModel.query()
            .insert({
                id: healId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                receiver_health: receiverHealth,
                character_healing: characterHealing,
                roll: roll,
                final_healing: finalHealing,
            })

        return heal;
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