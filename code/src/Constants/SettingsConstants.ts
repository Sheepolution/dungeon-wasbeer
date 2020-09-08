export default class SettingsConstants {
    public static readonly COLORS = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        MONSTER:'#ff0000',
        DEFAULT:'#f0529a',
    }

    public static readonly PREFIX = ';';

    public static readonly BOT_ID = process.env.BOT_ID || '';
    public static readonly ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID || '';
    public static readonly MAIN_GUILD_ID = process.env.MAIN_GUILD_ID || '';
    public static readonly CARD_CHANNEL_ID = process.env.CARD_CHANNEL_ID || '';
    public static readonly DND_CHANNEL_ID = process.env.DND_CHANNEL_ID || '';
    public static readonly CHAT_CHANNEL_ID = process.env.CHAT_CHANNEL_ID || '';
    public static readonly LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

    public static readonly MESSAGE_POINT_TIMEOUT_MINUTES = 15;
    public static readonly CHARACTER_POINT_TIMEOUT_MINUTES = 5;

    public static readonly CARD_AMOUNT_SPLIT_PAGES = 15;

    public static readonly CARD_PIECES_NEEDED = 7;
    public static readonly CARD_PIECES_DIG_COOLDOWN_MINUTES_MIN = 60 * 1;
    public static readonly CARD_PIECES_DIG_COOLDOWN_MINUTES_MAX = 60 * 8;

    public static readonly CARD_PIECE_FIND_CHANCE = [
        50,
        15,
    ];

    public static readonly CARD_AMOUNT_REWARD_REACH_INCREASE = [
        10,
        50,
        100,
    ];

    public static readonly MESSAGE_POINT_AMOUNT_REWARDS = {
        CARD: [
            4,
            8,
            16,
            24
        ]
    };

    public static readonly CARD_RANK_ROLL_VALUE = [
        38,
        14,
        5,
        1,
        0.1,
    ];

    public static readonly REWARD_POINTS_MULTIPLIER = 50;
    public static readonly DAMAGE_REWARD_POINTS_MULTIPLIER = 1;
    public static readonly HEALING_REWARD_POINTS_MULTIPLIER = .5;
    public static readonly INSPIRE_REWARD_POINTS = 10;

    public static readonly STANDARD_DICE = 20;

    public static readonly LORE_MAX_LENGTH = 1500;
}
