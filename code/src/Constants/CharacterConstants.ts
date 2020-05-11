export default class CharacterConstants {

    public static readonly BASE_COOLDOWN_DURATION = 30;

    public static readonly HEAL_MESSAGE_AMOUNT = 10;

    public static readonly RESET_CHARACTER_TIMER_DURATION = 5;

    public static readonly EQUIPMENT_SPACE_PER_LEVEL = [
        3,        4,        4,        5,        5,
        6,        6,        7,        7,        9,
        9,        10,       10,       11,       11,
        12,       12,       13,       13,       15,
    ]

    public static readonly HEALTH_ADDITION_PER_LEVEL = [
        0,        5,        10,       15,       20,
        25,       30,       35,       40,       45,
        50,       55,       60,       65,       70,
        75,       80,       85,       90,       100,
    ]

    public static readonly XP_PER_LEVEL = [
        0,        50,        150,        450,
        1100,     2400,      3900,       5700,
        8000,     11000,     14500,      16500,
        22000,    29000,     37500,      47000,
        57000,    68000,     82000,      100000
    ]

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
        BARD: { armor: 0, charisma: 0, dexterity: 2, healing: 0, health: 100,  regeneration: 5, strength: 0, spell: 6, attack: 5 },
        CLERIC: { armor: 0, charisma: 0, dexterity: 3, healing: 5, health: 100, regeneration: 1, strength: 0, spell: 3, attack: 5 },
        WIZARD: { armor: 0, charisma: 0, dexterity: 1, healing: 0, health: 120, regeneration: 2, strength: 0, spell: 10, attack: 5 },
        PALADIN: { armor: 5, charisma: 0, dexterity: 2, healing: 5, health: 100, regeneration: 1, strength: 3, spell: 0, attack: 2 },
        FIGHTER: { armor: 2, charisma: 0, dexterity: 4, healing: 0, health: 90, regeneration: 2, strength: 5, spell: 0, attack: 5 },
        RANGER: { armor: 0, charisma: 0, dexterity: 8, healing: 0, health: 100, regeneration: 1, strength: 1, spell: 0, attack: 5 },
    };

    public static readonly CLASS_ATTACK_MESSAGES = {
        BARD: [
            'Je speelt een liedje. Je bent alleen niet zo goed en doet je tegenstander pijn aan zijn oren. Je doet [damage] damage.',
        ],
        CLERIC: [
            'Bla bla je doet schade enzo [damage].',
        ],
        WIZARD: [
            'Je doet een spreuk',
        ],
        PALADIN: [
            'Je slaat met je zwaard.',
        ],
        FIGHTER: [
            'Je slaat met je twee zwaarden.'
        ],
        RANGER: [
            'Je schiet een pijl',
        ]
    }

    public static readonly CLASS_ATTACK_CRIT_MESSAGES = {
        BARD: [
            'Bard Crit',
        ],
        CLERIC: [
            'cleric crit',
        ],
        WIZARD: [
            'Wizard spreuk crit',
        ],
        PALADIN: [
            'Paladin crit',
        ],
        FIGHTER: [
            'Fighter crit'
        ],
        RANGER: [
            'Ranger crit',
        ]
    }
}