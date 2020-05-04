export default class CharacterConstants {

    public static readonly BASE_COOLDOWN_DURATION = 60;

    public static readonly HEAL_MESSAGE_AMOUNT = 10;

    public static readonly CHARACTER_DIED = 'https://cdn.discordapp.com/attachments/694331679204180029/703293328552362014/unknown.png';

    public static readonly CHARACTER_IMAGE = {
        BARD: 'https://cdn.discordapp.com/attachments/694331679204180029/706117088141639751/BardWasbeer.png',
        CLERIC: 'https://cdn.discordapp.com/attachments/694331679204180029/706139923786498079/ClericWasbeer.png',
        WIZARD: 'https://cdn.discordapp.com/attachments/694331679204180029/704816613853233184/wizard.png',
        PALADIN: 'https://cdn.discordapp.com/attachments/694331679204180029/706120168862121994/PaladinWasbeer.png',
        FIGHTER: 'https://cdn.discordapp.com/attachments/694331679204180029/706146775828004884/FighterWasbeer.png',
        RANGER: 'https://cdn.discordapp.com/attachments/694331679204180029/706131465150267452/RangerWasbeer2.png',
    }

    public static readonly CLASS_BASE_STATS = {
        BARD: { armor: 0, charisma: 0, dexterity: 2, healing: 0, health: 100,  regeneration: 5, strength: 0, spell: 20, attack: 5 },
        CLERIC: { armor: 0, charisma: 0, dexterity: 2, healing: 5, health: 100, regeneration: 1, strength: 0, spell: 1, attack: 5 },
        WIZARD: { armor: 0, charisma: 0, dexterity: 1, healing: 0, health: 120, regeneration: 2, strength: 0, spell: 4, attack: 5 },
        PALADIN: { armor: 5, charisma: 0, dexterity: 2, healing: 5, health: 100, regeneration: 1, strength: 20, spell: 0, attack: 5 },
        FIGHTER: { armor: 2, charisma: 0, dexterity: 1, healing: 0, health: 100, regeneration: 1, strength: 5, spell: 0, attack: 5 },
        RANGER: { armor: 0, charisma: 0, dexterity: 5, healing: 0, health: 100, regeneration: 1, strength: 1, spell: 0, attack: 5 },
    };
}