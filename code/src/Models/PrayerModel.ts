import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class PrayerModel extends Model {

    static get tableName() {
        return 'prayers';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'prayers.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'prayers.character_id',
                to: 'characters.id',
            }
        }
    }

    public static async New(battle: Battle, character: Character, characterHealing: number, roll: number, finalBlessing: number) {
        const prayerId = Utils.UUID();

        const prayer = await PrayerModel.query()
            .insert({
                id: prayerId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                character_healing: characterHealing,
                roll: roll,
                final_blessing: finalBlessing,
                pray_date: Utils.GetNowString(),
            })

        return prayer;
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