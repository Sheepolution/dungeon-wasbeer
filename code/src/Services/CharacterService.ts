import { ClassType } from '../Enums/ClassType';
import EmojiConstants from '../Constants/EmojiConstants';
import IModifierStats from '../Interfaces/IModifierStats';
import CharacterConstants from '../Constants/CharacterConstants';

export default class CharacterService {

    public static GetClassIconEmoji(classType:ClassType) {
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

    public static GetClassIconImage(classType:ClassType) {
        switch (classType) {
            case ClassType.Bard:
                return CharacterConstants.ICON_IMAGE.BARD;
            case ClassType.Cleric:
                return CharacterConstants.ICON_IMAGE.CLERIC;
            case ClassType.Fighter:
                return CharacterConstants.ICON_IMAGE.FIGHTER;
            case ClassType.Paladin:
                return CharacterConstants.ICON_IMAGE.PALADIN;
            case ClassType.Ranger:
                return CharacterConstants.ICON_IMAGE.RANGER;
            case ClassType.Wizard:
                return CharacterConstants.ICON_IMAGE.WIZARD;
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
            charisma:max.charisma + (stats.charisma - base.charisma),
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
            charisma: n,
            dexterity: n,
            healing: n,
            health: n,
            regeneration: n,
            strength: n,
            spell: n,
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
            spell: a.spell + b.spell
        }
    }

    public static GetMultipliedModifierStats(a:IModifierStats, b:IModifierStats) {
        return {
            armor: Math.max(a.armor + 1, Math.ceil(a.armor * b.armor)),
            attack: Math.max(a.attack + 1, Math.ceil(a.attack * b.attack)),
            charisma: Math.max(a.charisma, Math.ceil(a.charisma * b.charisma)),
            dexterity: Math.max(a.dexterity + 1, Math.ceil(a.dexterity * b.dexterity)),
            healing: Math.max(a.healing + 1, Math.ceil(a.healing * b.healing)),
            health: Math.max(a.health, Math.ceil(a.health * b.health)),
            regeneration: Math.max(a.regeneration + 1, Math.ceil(a.regeneration * b.regeneration)),
            strength: Math.max(a.strength + 1, Math.ceil(a.strength * b.strength)),
            spell: Math.max(a.spell + 1, Math.ceil(a.spell * b.spell)),
        }
    }
}