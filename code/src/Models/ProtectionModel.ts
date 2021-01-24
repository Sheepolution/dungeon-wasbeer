import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class ProtectionModel extends Model {

    static get tableName() {
        return 'protections';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'protections.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'protections.character_id',
                to: 'characters.id',
            }
        },
        receiver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'protections.receiver_id',
                to: 'characters.id',
            }
        },
    }

    public static async New(battle:Battle, character:Character, receiver:Character, characterArmor:number, roll:number, finalProtection:number) {
        const protectionId = Utils.UUID();

        const protection = await ProtectionModel.query()
            .insert({
                id: protectionId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                character_armor: characterArmor,
                roll: roll,
                final_protection: finalProtection,
                protection_date: Utils.GetNowString(),
            })

        return protection;
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