export default class SettingsConstants {
    public static readonly COLORS = {
        BAD: '#ff0000',
        GOOD: '#00ff00',
        MONSTER: '#ff0000',
        DEFAULT: '#f0529a',
    };

    public static readonly PREFIX = ';';

    public static readonly BOT_ID = process.env.BOT_ID || '';
    public static readonly ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID || '';
    public static readonly MAIN_GUILD_ID = process.env.MAIN_GUILD_ID || '';
    public static readonly CARD_CHANNEL_ID = process.env.CARD_CHANNEL_ID || '';
    public static readonly DND_CHANNEL_ID = process.env.DND_CHANNEL_ID || '';
    public static readonly ART_CHANNEL_ID = process.env.ART_CHANNEL_ID || '';
    public static readonly SPOILERS_CHANNEL_ID = process.env.SPOILERS_CHANNEL_ID || '';
    public static readonly CHAT_CHANNEL_ID = process.env.CHAT_CHANNEL_ID || '';
    public static readonly FOCUS_CHANNEL_ID = process.env.FOCUS_CHANNEL_ID || '';
    public static readonly SUDOKU_CHANNEL_ID = process.env.SUDOKU_CHANNEL_ID || '';
    public static readonly LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';
    public static readonly FOCUS_ROLE_ID = process.env.FOCUS_ROLE_ID || '';

    // Sheep, Wout, Juul, Nova, Iris, Gerrit, Toet, Stees, Julia, Konijn
    public static readonly CAN_RESTART_BOT_IDS = [
        '180335273500999680',
        '232613576198586368',
        '168505309298425856',
        '272439626575249408',
        '142325429762654208',
        '298079976912191488',
        '432614355360808971',
        '525327535827976199',
        '388676650113695744',
        '484313248032882708',
    ];

    public static readonly TETRIS_GUYS = {
        NEILL: '100595585718943744',
        RUBEN: '331576018726813697',
    };

    public static readonly MESSAGE_POINT_TIMEOUT_MINUTES = 15;
    public static readonly CHARACTER_POINT_TIMEOUT_MINUTES = 5;

    public static readonly CARD_AMOUNT_SPLIT_PAGES = 15;

    public static readonly CARD_EXCHANGE_AMOUNT = 5;

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
    ];

    public static readonly MESSAGE_POINT_AMOUNT_REWARDS = {
        CARD: [
            4,
            8,
            12,
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
    public static readonly ABILITY_REWARD_POINTS = 10;
    public static readonly DAMAGE_REWARD_POINTS_MULTIPLIER = 1;
    public static readonly HEALING_REWARD_POINTS_MULTIPLIER = .75;
    public static readonly INSPIRE_REWARD_POINTS_MULITPLIER = .75;
    public static readonly PROTECTION_REWARD_POINTS_MULITPLIER = .75;

    public static readonly STANDARD_DICE = 20;

    public static readonly LORE_MAX_LENGTH = 1500;

    public static readonly MONSTER_PICK_CHANCE = 10;
}
