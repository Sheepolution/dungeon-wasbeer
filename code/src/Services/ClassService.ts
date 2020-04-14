import { ClassType } from '../Enums/ClassType';
import EmojiConstants from '../Constants/EmojiConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IModifierStats from '../Interfaces/IModifierStats';

export default class ClassService {

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
                return SettingsConstants.CLASS_BASE_STATS.BARD;
            case ClassType.Cleric:
                return SettingsConstants.CLASS_BASE_STATS.CLERIC;
            case ClassType.Fighter:
                return SettingsConstants.CLASS_BASE_STATS.FIGHTER;
            case ClassType.Paladin:
                return SettingsConstants.CLASS_BASE_STATS.PALADIN;
            case ClassType.Ranger:
                return SettingsConstants.CLASS_BASE_STATS.RANGER;
            case ClassType.Wizard:
                return SettingsConstants.CLASS_BASE_STATS.WIZARD;
        }
    }

    public static GetEmptyModifierStats():IModifierStats {
        return {
            armor: 0,
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