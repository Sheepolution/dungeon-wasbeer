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

    public static readonly STANDARD_DICE = 20;

}
