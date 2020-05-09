import { ClassType } from '../Enums/ClassType';
import EmojiConstants from '../Constants/EmojiConstants';
import IModifierStats from '../Interfaces/IModifierStats';
import CharacterConstants from '../Constants/CharacterConstants';

export default class CharacterService {

    public static GetClassEmoji(classType:ClassType) {
        switch (classType) {
            case ClassType.Bard:
                return EmojiConstants.CLASSES.BARD;
            case ClassType.Cleric:
                return EmojiConstants.CLASSES.CLERIC;
            case ClassType.Fighter:
                return EmojiConstants.CLASSES.FIGHTER;
            case ClassType.Paladin:
                return EmojiConstants.CLASSES.PALADIN;
            case ClassType.Ranger:
                return EmojiConstants.CLASSES.RANGER;
            case ClassType.Wizard:
                return EmojiConstants.CLASSES.WIZARD
        }
    }

    public static GetClassModifierStats(classType:ClassType) {
        switch (classType) {
            case ClassType.Bard:
                return CharacterConstants.CLASS_BASE_STATS.BARD;
            case ClassType.Cleric:
                return CharacterConstants.CLASS_BASE_STATS.CLERIC;
            case ClassType.Fighter:
                return CharacterConstants.CLASS_BASE_STATS.FIGHTER;
            case ClassType.Paladin:
                return CharacterConstants.CLASS_BASE_STATS.PALADIN;
            case ClassType.Ranger:
                return CharacterConstants.CLASS_BASE_STATS.RANGER;
            case ClassType.Wizard:
                return CharacterConstants.CLASS_BASE_STATS.WIZARD;
        }
    }

    public static GetClassImage(classType:ClassType) {
        switch (classType) {
            case ClassType.Bard:
                return CharacterConstants.CHARACTER_IMAGE.BARD;
            case ClassType.Cleric:
                return CharacterConstants.CHARACTER_IMAGE.CLERIC;
            case ClassType.Fighter:
                return CharacterConstants.CHARACTER_IMAGE.FIGHTER;
            case ClassType.Paladin:
                return CharacterConstants.CHARACTER_IMAGE.PALADIN;
            case ClassType.Ranger:
                return CharacterConstants.CHARACTER_IMAGE.RANGER;
            case ClassType.Wizard:
                return CharacterConstants.CHARACTER_IMAGE.WIZARD;
        }
    }

    public static GetClassAttackDescription(classType:ClassType, crit?:boolean) {
        switch (classType) {
            case ClassType.Bard:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.BARD : CharacterConstants.CLASS_ATTACK_MESSAGES.BARD
            case ClassType.Cleric:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.CLERIC : CharacterConstants.CLASS_ATTACK_MESSAGES.CLERIC
            case ClassType.Fighter:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.FIGHTER : CharacterConstants.CLASS_ATTACK_MESSAGES.FIGHTER
            case ClassType.Paladin:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.PALADIN : CharacterConstants.CLASS_ATTACK_MESSAGES.PALADIN
            case ClassType.Ranger:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.RANGER : CharacterConstants.CLASS_ATTACK_MESSAGES.RANGER
            case ClassType.Wizard:
                return crit ? CharacterConstants.CLASS_ATTACK_CRIT_MESSAGES.WIZARD : CharacterConstants.CLASS_ATTACK_MESSAGES.WIZARD
        }
    }

    public static GetEmptyModifierStats():IModifierStats {
        return {
            armor: 0,
            attack: 0,
            charisma: 0,
            dexterity: 0,
            healing: 0,
            health: 0,
            regeneration: 0,
            strength: 0,
            spell: 0,
        }
    }

    public static GetSummedUpModifierStats(a:IModifierStats, b:IModifierStats) {
        return {
            armor: a.armor + b.armor,
            attack: a.attack + b.attack,
            charisma: a.charisma + b.charisma,
            dexterity: a.dexterity + b.dexterity,
            healing: a.healing + b.healing,
            health: a.health + b.health,
            regeneration: a.regeneration + b.regeneration,
            strength: a.strength + b.strength,
            spell: a.spell + b.spell,
        }
    }
}