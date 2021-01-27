import EmojiConstants from './EmojiConstants';

export default class CharacterConstants {

    public static readonly BASE_COOLDOWN_DURATION = 30;

    public static readonly RESET_CHARACTER_TIMER_DURATION = 5;

    public static readonly MAX_LEVEL = 20;

    public static readonly EQUIPMENT_SPACE_PER_LEVEL = [
        3, 4, 4, 5, 5,
        6, 6, 7, 7, 9,
        9, 10, 10, 11, 11,
        12, 12, 13, 13, 15,
    ]

    public static readonly HEALTH_ADDITION_PER_LEVEL = [
        0, 25, 50, 75, 100,
        125, 150, 175, 200, 225,
        250, 275, 300, 325, 350,
        350, 375, 400, 425, 500,
    ]

    public static readonly XP_PER_LEVEL = [
        0, 50, 150, 450,
        1100, 2400, 3900, 5700,
        8000, 11000, 14500, 16500,
        22000, 29000, 37500, 47000,
        57000, 68000, 82000, 100000
    ]

    public static readonly CHARACTER_DIED = 'https://media.discordapp.net/attachments/694331679204180029/703293328552362014/unknown.png';

    public static readonly INSPIRE_STAT_MULTIPLIER = 1.2;

    public static readonly HEALTH_DEXTERITY_PENALTY_MAX = 15;

    public static readonly CHARACTER_IMAGE = {
        BARD: 'https://media.discordapp.net/attachments/694331679204180029/706117088141639751/BardWasbeer.png',
        CLERIC: 'https://media.discordapp.net/attachments/694331679204180029/706139923786498079/ClericWasbeer.png',
        WIZARD: 'https://media.discordapp.net/attachments/694331679204180029/704816613853233184/wizard.png',
        PALADIN: 'https://media.discordapp.net/attachments/694331679204180029/706120168862121994/PaladinWasbeer.png',
        FIGHTER: 'https://media.discordapp.net/attachments/694331679204180029/706146775828004884/FighterWasbeer.png',
        RANGER: 'https://media.discordapp.net/attachments/694331679204180029/706131465150267452/RangerWasbeer2.png',
    }

    public static readonly ICON_IMAGE = {
        BARD: 'https://media.discordapp.net/attachments/694331679204180029/708768518551633930/BardIcon.png',
        CLERIC: 'https://media.discordapp.net/attachments/694331679204180029/708768545294778388/ClericIcon.png',
        WIZARD: 'https://media.discordapp.net/attachments/694331679204180029/708768674164768808/WizardIcon.png',
        PALADIN: 'https://media.discordapp.net/attachments/694331679204180029/708776075877941278/PaladinIcon.png',
        FIGHTER: 'https://media.discordapp.net/attachments/694331679204180029/708768574516232333/FighterIcon.png',
        RANGER: 'https://media.discordapp.net/attachments/694331679204180029/708768639108513822/RangerIcon.png',
    }

    public static readonly CLASS_BASE_STATS = {
        BASE: { armor: 5, dexterity: 5, wisdom: 10, health: 200, regeneration: 3, strength: 10, spell: 8, attack: 5, charisma: 10 },
        MAX: { armor: 90, dexterity: 20, wisdom: 50, health: 1000, regeneration: 15, strength: 50, spell: 50, attack: 50, charisma: 50 },
        BARD: { armor: 2, dexterity: 2, wisdom: 0, health: 200, regeneration: 4, strength: 0, spell: 13, attack: 2, charisma: 10 },
        CLERIC: { armor: 5, dexterity: 7, wisdom: 10, health: 200, regeneration: 3, strength: 0, spell: 5, attack: 3, charisma: 0 },
        WIZARD: { armor: 0, dexterity: 0, wisdom: 0, health: 250, regeneration: 3, strength: 0, spell: 18, attack: 2, charisma: 0 },
        PALADIN: { armor: 10, dexterity: 5, wisdom: 5, health: 200, regeneration: 3, strength: 10, spell: 0, attack: 5, charisma: 0 },
        FIGHTER: { armor: 5, dexterity: 0, wisdom: 0, health: 180, regeneration: 1, strength: 13, spell: 0, attack: 7, charisma: 0 },
        RANGER: { armor: 5, dexterity: 8, wisdom: 0, health: 200, regeneration: 3, strength: 8, spell: 0, attack: 8, charisma: 0 },
    };

    public static readonly CLASS_ATTACK_MESSAGES = {
        BARD: [
            '"Je stemt je muziekinstrument, schraapt je keel en begint te pingelen. De [monster] irriteert zich er mateloos aan en neemt [damage] damage."',
        ],
        CLERIC: [
            '"De goden zijn met je vandaag. Je mompelt een spreuk en doet [damage] damage."',
        ],
        WIZARD: [
            '"Je kijkt de [monster] in de ogen aan en mompelt snel een spreuk. Oef, dat vond de [monster] niet prettig! De spreuk doet [damage] damage."',
        ],
        PALADIN: [
            '"Voordat je je wapen boven je hoofd tilt zeg je nog snel een schietgebedje en je haalt uit. Het schietgebedje heeft geholpen, want je raakt de [monster] voor [damage] damage."',
        ],
        FIGHTER: [
            '"Met een soepele beweging haal je uit met je zwaard. Dit raakt de [monster] voor [damage] damage."'
        ],
        RANGER: [
            '"Een wasbeer met een arendsoog. Je spant de boog en schiet je pijl op de [monster] af. De pijl raakt de [monster] voor [damage] damage."',
        ]
    }

    public static readonly CLASS_ATTACK_CRIT_MESSAGES = {
        BARD: [
            '"‘Anyway here’s Wonderwall’ zeg je terwijl je je instrument erbij pakt. Je begint KEIHARD te spelen. De [monster] schrikt zich een ongeluk. Bloed gutst uit de oren van het schepsel en je doet [damage] damage."',
        ],
        CLERIC: [
            '"Je merkt het meteen, de divine energy stroomt met flinke snelheid door je aderen! Je voelt dat je krachten verdubbeld zijn. Je schreeuwt de heilige woorden en je haalt uit met [damage] damage naar de [monster]."',
        ],
        WIZARD: [
            '"Je hebt van te voren goed je spellbook gelezen en je herinnert je opeens een enorm krachtige spreuk! Je pakt met beide handen je staf beet, richt op de [monster] en schreeuwt de magische woorden naar hem! De spreuk komt hard aan en doet [damage] damage."',
        ],
        PALADIN: [
            '"Je slaat met je wapen op je schild om de [monster] te intimideren. Je voelt aan alles, je bent gezegend en nu is het moment om te strijden. Met een mokerslag haal je uit naar de [monster] en je doet [damage] damage!"',
        ],
        FIGHTER: [
            '"Je sprint als een bezetene op de [monster] af. Deze heeft je te laat door en je ziet de verbazing in de ogen wanneer je de [monster] een kopstoot geeft. Terwijl de [monster] verdwaasd kijkt hef je je zwaard en haalt met volle kracht uit. Je doet [damage] damage."'
        ],
        RANGER: [
            '"Je ziet dat de [monster] op je af wilt komen en terwijl je ziet dat deze aanstalte maakt, gaat voor jou alles in slow motion te werken. In een fractie van een seconde heb je je boog al gespannen staan en op de [monster] gericht. Met een vlotte beweging zoeft de pijl met een flinke snelheid op de [monster] af en doorboort deze voor [damage] damage!"',
        ]
    }

    public static readonly HEAL_MESSAGE = '"[jij] healt [naam] en krijgt daardoor [health] health terug."';
    public static readonly HEAL_FAIL_MESSAGE = '"[jij] healt per ongeluk een steen. Er gebeurt weinig."';
    public static readonly INSPIRE_MESSAGE = `"[jij] speelt prachtige muziek en inspireert [naam] voor een [inspiratie]% stat boost tot na het volgende gevecht." ${EmojiConstants.DNW_STATES.INSPIRED}`;
    public static readonly INSPIRE_FAIL_MESSAGE = '"[jij] speelt een hoop valse noten en wordt gevraagd te stoppen. Dit was alles behalve inspirerend."';
    public static readonly PROTECTION_MESSAGE = `"[jij] gaat voor [naam] staan met een schild, wat een [bescherming] armor boost geeft tot na het volgende gevecht." ${EmojiConstants.DNW_STATES.PROTECTED}`;
    public static readonly PROTECTION_FAIL_MESSAGE = '"[jij] rent naar [naam] voor bescherming, maar struikelt onderweg en heeft moeite overeind komen in het harnas."';
    public static readonly CHARGE_MESSAGE = `"[jij] doet voor de aanval zoveel mogelijk armor uit. Het verschil in gewicht zorgt voor [charge] meer strength. Ten aanval!" ${EmojiConstants.DNW_STATES.CHARGED}`;
    public static readonly CHARGE_FAIL_MESSAGE = '"[jij] probeert het harnas los te maken, maar lukt het maar niet om dat knoopje op de rug los te maken. Nouja, dan maar niet."';
    public static readonly PRAY_MESSAGE = `"[jij] gaat op de knieën zitten en bidt naar de hemel. Uit het niets schijnt er een zonnestraal op [jij], die een blessing krijgt van [blessing]." ${EmojiConstants.DNW_STATES.BLESSED}`;
    public static readonly PRAY_FAIL_MESSAGE = '"[jij] probeert te bidden, maar er gebeurt niks. Komt het misschien door die vunzige gedachten van laatst?"';
    public static readonly ENCHANTMENT_MESSAGE = `"[jij] gebruikt een spreuk om de attack roll van [naam] te verdubbelen in het volgende gevecht." ${EmojiConstants.DNW_STATES.ENCHANTED}`;
    public static readonly PERCEPTION_MESSAGE = '"[jij] doet een perception check om [naam] te informeren over de situatie en de gevechtscooldown te halveren van [voor] naar [na]."👁️';
    public static readonly REINFORCEMENT_MESSAGE = `"[jij] voorziet [naam] van een extra wapen. Het verschil in attack rolls wordt toegevoegd aan de strength in het volgende gevecht." ${EmojiConstants.DNW_STATES.REINFORCED}`;
}