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

    public static GetMaxModifierStats(classType:ClassType) {
        const stats = this.GetClassModifierStats(classType);
        const base = CharacterConstants.CLASS_BASE_STATS.BASE;
        const max = CharacterConstants.CLASS_BASE_STATS.MAX;

        return {
            armor: max.armor + (stats.armor - base.armor),
            attack:max.attack + (stats.attack - base.attack),
            dexterity: max.dexterity + (stats.dexterity - base.dexterity),
            healing: max.healing + (stats.healing - base.healing),
            health: max.health + (stats.health - base.health),
            regeneration: max.regeneration + (stats.regeneration - base.regeneration),
            strength: max.strength + (stats.strength - base.strength),
            spell: max.spell + (stats.spell - base.spell),
        }
    }

    public static GetEmptyModifierStats(n:number = 0):IModifierStats {
        return {
            armor: n,
            attack: n,
            dexterity: n,
            healing: n,
            health: n,
            regeneration: n,
            strength: n,
            spell: n,
        }
    }

    public static GetSummedUpModifierStats(a:IModifierStats, b:IModifierStats, classType:ClassType) {
        const max = this.GetMaxModifierStats(classType);
        return {
            armor: Math.max(0, Math.min(a.armor + b.armor, max.armor)),
            attack: Math.max(0, Math.min(a.attack + b.attack, max.attack)),
            dexterity: Math.min(a.dexterity + b.dexterity, max.dexterity),
            healing: Math.max(0, Math.min(a.healing + b.healing, max.healing)),
            health: Math.max(0, Math.min(a.health + b.health, max.health)),
            regeneration: Math.max(0, Math.min(a.regeneration + b.regeneration, max.regeneration)),
            strength: Math.max(0, Math.min(a.strength + b.strength, max.strength)),
            spell: Math.max(0, Math.min(a.spell + b.spell, max.spell)),
        }
    }
}