import BotManager from '../Managers/BotManager';

export default class SettingsConstants {
    public static readonly COLORS = {
        BAD:'#ff0000',
        GOOD:'#00ff00',
        DEFAULT:'#f0529a',
    }

    public static readonly PREFIX = ';';

    public static readonly ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID || '';
    public static readonly MAIN_GUILD_ID = process.env.MAIN_GUILD_ID || '';
    public static readonly MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || '';

    public static readonly MESSAGE_POINT_TIMEOUT_MINUTES = 15;


    public static readonly MESSAGE_POINT_AMOUNT_REWARDS: {
        CARD: 4
    };

    public static readonly CARD_RANK_ROLL_VALUE: [
        55,
        25,
        9,
        1,
    ];
}