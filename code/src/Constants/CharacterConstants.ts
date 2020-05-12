export default class CharacterConstants {

    public static readonly BASE_COOLDOWN_DURATION = 30;

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
        BARD: { armor: 5, charisma: 0, dexterity: 5, healing: 0, health: 100,  regeneration: 3, strength: 0, spell: 20, attack: 2 },
        CLERIC: { armor: 5, charisma: 0, dexterity: 8, healing: 15, health: 100, regeneration: 1, strength: 0, spell: 5, attack: 3 },
        WIZARD: { armor: 0, charisma: 0, dexterity: 4, healing: 0, health: 120, regeneration: 1, strength: 0, spell: 30, attack: 4 },
        PALADIN: { armor: 10, charisma: 0, dexterity: 5, healing: 10, health: 100, regeneration: 1, strength: 10, spell: 0, attack: 5 },
        FIGHTER: { armor: 5, charisma: 0, dexterity: 0, healing: 0, health: 90, regeneration: 1, strength: 15, spell: 0, attack: 8 },
        RANGER: { armor: 5, charisma: 0, dexterity: 10, healing: 0, health: 100, regeneration: 1, strength: 5, spell: 0, attack: 8 },
    };

    public static readonly CLASS_ATTACK_MESSAGES = {
        BARD: [
            'Je stemt je muziekinstrument, schraapt je keel en begint te pingelen. Het monster irriteert zich er mateloos aan en neemt [damage] damage.',
        ],
        CLERIC: [
            'De goden zijn met je vandaag. Je mompelt een spreuk en doet [damage] damage.',
        ],
        WIZARD: [
            'Je kijkt het monster in de ogen aan en mompelt snel een spreuk. Oef, dat vond het monster niet prettig! De spreuk doet [damage] damage.',
        ],
        PALADIN: [
            'Voordat je je wapen boven je hoofd tilt zeg je nog snel een schietgebedje en je haalt uit. Het schietgebedje heeft geholpen, want je raakt het monster voor [damage] damage.',
        ],
        FIGHTER: [
            'Met een soepele beweging haal je uit met je zwaard. Dit raakt het monster voor [damage] damage.'
        ],
        RANGER: [
            'Een wasbeer met een arendsoog. Je spant de boog en schiet je pijl op het monster af. De pijl raakt het monster voor [damage] damage.',
        ]
    }

    public static readonly CLASS_ATTACK_CRIT_MESSAGES = {
        BARD: [
            '‘Anyway here’s Wonderwall’ zeg je terwijl je je instrument erbij pakt. Je begint KEIHARD te spelen. Het monster schrikt zich een ongeluk. Bloed gutst uit de oren van het schepsel en je doet [damage] damage.',
        ],
        CLERIC: [
            'Je merkt het meteen, de divine energy stroomt met flinke snelheid door je aderen! Je voelt dat je krachten verdubbeld zijn. Je schreeuwt de heilige woorden en je haalt uit met [damage] damage.',
        ],
        WIZARD: [
            'Je hebt van te voren goed je spellbook gelezen en je herinnert je opeens een enorm krachtige spreuk! Je pakt met beide handen je staf beet, richt op het monster en schreeuwt de magische woorden naar hem! De spreuk komt hard aan en doet [damage] damage.',
        ],
        PALADIN: [
            'Je slaat met je wapen op je schild om het monster te intimideren. Je voelt aan alles, je bent gezegend en nu is het moment om te strijden. Met een mokerslag haal je uit naar het monster en je doet [damage] damage!',
        ],
        FIGHTER: [
            'Je sprint als een bezetene op het monster af. Deze heeft je te laat door en je ziet de verbazing in de ogen wanneer je het monster een kopstoot geeft. Terwijl het monster verdwaasd kijkt hef je je zwaard en haalt met volle kracht uit. Je doet [damage] damage.'
        ],
        RANGER: [
            'Je ziet dat het monster op je af wilt komen en terwijl je ziet dat deze aanstalte maakt, gaat voor jou alles in slow motion te werken. In een fractie van een seconde heb je je boog al gespannen staan en op het monster gericht. Met een vlotte beweging zoeft de pijl met een flinke snelheid op het monster af en doorboord deze voor [damage] damage!',
        ]
    }
}