export default class SettingsConstants {
    public static readonly COLORS = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        MONSTER:'#ff0000',
        DEFAULT:'#f0529a',
    }

    public static readonly PREFIX = ';';

    public static readonly ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID || '';
    public static readonly MAIN_GUILD_ID = process.env.MAIN_GUILD_ID || '';
    public static readonly CARD_CHANNEL_ID = process.env.CARD_CHANNEL_ID || '';
    public static readonly DND_CHANNEL_ID = process.env.DND_CHANNEL_ID || '';

    public static readonly MESSAGE_POINT_TIMEOUT_MINUTES = 15;

    public static readonly MESSAGE_POINT_AMOUNT_REWARDS = {
        CARD: 8
    };

    public static readonly CARD_RANK_ROLL_VALUE = [
        55,
        25,
        9,
        1,
    ];

    public static readonly CLASS_BASE_STATS = {
        BARD: { armor: 0, charisma: 0, dexterity: 2, healing: 0, health: 100,  regeneration: 5, strength: 0, spell: 2, attack: 5 },
        CLERIC: { armor: 0, charisma: 0, dexterity: 2, healing: 5, health: 100, regeneration: 1, strength: 0, spell: 1, attack: 5 },
        WIZARD: { armor: 0, charisma: 0, dexterity: 1, healing: 0, health: 120, regeneration: 2, strength: 0, spell: 4, attack: 5 },
        PALADIN: { armor: 5, charisma: 0, dexterity: 2, healing: 0, health: 100, regeneration: 1, strength: 2, spell: 0, attack: 5 },
        FIGHTER: { armor: 2, charisma: 0, dexterity: 1, healing: 0, health: 100, regeneration: 1, strength: 5, spell: 0, attack: 5 },
        RANGER: { armor: 0, charisma: 0, dexterity: 5, healing: 0, health: 100, regeneration: 1, strength: 1, spell: 0, attack: 5 },
    };

    public static readonly STANDARD_DICE = 20;

}
