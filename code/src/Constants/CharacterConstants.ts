export default class CharacterConstants {

    public static readonly CHARACTER_DIED = 'https://cdn.discordapp.com/attachments/694331679204180029/703293328552362014/unknown.png';

    public static readonly CHARACTER_IMAGE = {
        BARD: '',
        CLERIC: '',
        WIZARD: 'https://cdn.discordapp.com/attachments/694331679204180029/704816613853233184/wizard.png',
        PALADIN: '',
        FIGHTER: '',
        RANGER: '',
    }

    public static readonly CLASS_BASE_STATS = {
        BARD: { armor: 0, charisma: 0, dexterity: 2, healing: 0, health: 100,  regeneration: 5, strength: 0, spell: 2, attack: 5 },
        CLERIC: { armor: 0, charisma: 0, dexterity: 2, healing: 5, health: 100, regeneration: 1, strength: 0, spell: 1, attack: 5 },
        WIZARD: { armor: 0, charisma: 0, dexterity: 1, healing: 0, health: 120, regeneration: 2, strength: 0, spell: 4, attack: 5 },
        PALADIN: { armor: 5, charisma: 0, dexterity: 2, healing: 0, health: 100, regeneration: 1, strength: 2, spell: 0, attack: 5 },
        FIGHTER: { armor: 2, charisma: 0, dexterity: 1, healing: 0, health: 100, regeneration: 1, strength: 5, spell: 0, attack: 5 },
        RANGER: { armor: 0, charisma: 0, dexterity: 5, healing: 0, health: 100, regeneration: 1, strength: 1, spell: 0, attack: 5 },
    };
}