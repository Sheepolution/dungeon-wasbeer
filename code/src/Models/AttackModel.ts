import { Utils } from '../Utils/Utils';
import BattleModel from './BattleModel';
import CharacterModel from './CharacterModel';
import Battle from '../Objects/Battle';
import Character from '../Objects/Character';

const { Model } = require('objection');

export default class AttackModel extends Model {

    static get tableName() {
        return 'attacks';
    }

    static relationMappings = {
        battles: {
            relation: Model.BelongsToOneRelation,
            modelClass: BattleModel,
            join: {
                from: 'attacks.battle_id',
                to: 'battles.id',
            }
        },
        character: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'attacks.character_id',
                to: 'characters.id',
            }
        }
    }

    public static async New(battle:Battle, character:Character, messageId:string, rollCharacterBase:number, rollCharacterModifier:number, rollCharacterModifierMax:number, rollMonsterBase:number, rollMonsterModifier:number, rollMonsterModifierMax:number, victory:boolean, damage:number, healthAfter:number) {
        const attackId = Utils.UUID();
        const modifierStats = character.GetFullModifierStats();

        const attack = await AttackModel.query()
            .insert({
                id: attackId,
                battle_id: battle.GetId(),
                character_id: character.GetId(),
                message_id: messageId,
                roll_character_base: rollCharacterBase,
                roll_character_mod: rollCharacterModifier,
                roll_character_mod_max: rollCharacterModifierMax,
                roll_monster_base: rollMonsterBase,
                roll_monster_mod: rollMonsterModifier,
                roll_monster_mod_max: rollMonsterModifierMax,
                victory: victory ? 1 : 0,
                damage: damage,
                health_after: healthAfter,
                attack_date: Utils.GetNowString(),
                character_attack: modifierStats.attack,
                monster_attack: battle.GetMonsterAttackRoll(),
                character_strength: modifierStats.strength,
                monster_strength: battle.GetMonsterAttackStrength(),
                character_armor: modifierStats.armor,
                inspiration: character.GetInspiration(),
                enchanted: character.IsEnchanted(),
                reinforced: character.IsReinforced(),
                protection: character.GetProtection(),
            })

        return attack;
    }

    public async GetBattle() {
        const battle = new Battle();
        battle.ApplyModel(await this.$relatedQuery('battles'));
        return battle;
    }

    public async GetCharacter() {
        const character = new Character();
        character.ApplyModel(await this.$relatedQuery('characters'));
        return character;
    }
}