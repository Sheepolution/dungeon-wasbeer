import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class InspireModel extends Model {

    static get tableName() {
        return 'inspires';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'inspires.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'inspires.character_id',
                to: 'characters.id',
            }
        },
        receiver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'inspires.receiver_id',
                to: 'characters.id',
            }
        },
    }

    public static async New(battle:Battle, character:Character, receiver:Character, characterCharisma:number, roll:number, finalInspiration:number) {
        const inspireId = Utils.UUID();

        const inspire = await InspireModel.query()
            .insert({
                id: inspireId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                character_charisma: characterCharisma,
                roll: roll,
                final_inspiration: finalInspiration,
                inspire_date: Utils.GetNowString(),
            })

        return inspire;
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