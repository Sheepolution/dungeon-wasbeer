import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class ChargeModel extends Model {

    static get tableName() {
        return 'charges';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'charges.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'charges.character_id',
                to: 'characters.id',
            }
        }
    };

    public static async New(battle: Battle, character: Character, characterArmor: number, roll: number, finalCharge: number) {
        const chargeId = Utils.UUID();

        const protection = await ChargeModel.query()
            .insert({
                id: chargeId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                character_armor: characterArmor,
                roll: roll,
                final_charge: finalCharge,
                charge_date: Utils.GetNowString(),
            });

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
}