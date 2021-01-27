import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class EnchantmentModel extends Model {

    static get tableName() {
        return 'enchantments';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'enchantments.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'enchantments.character_id',
                to: 'characters.id',
            }
        },
        receiver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'enchantments.receiver_id',
                to: 'characters.id',
            }
        },
    }

    public static async New(battle: Battle, character: Character, receiver: Character) {
        const enchantmentId = Utils.UUID();

        const enchantment = await EnchantmentModel.query()
            .insert({
                id: enchantmentId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                receiver_id: receiver.GetId(),
                enchantment_date: Utils.GetNowString(),
            })

        return enchantment;
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