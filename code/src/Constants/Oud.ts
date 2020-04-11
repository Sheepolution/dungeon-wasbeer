export default class ConstantsOud {


    // Gameplay
    public static readonly Defaults = {
        Guild: {
            Prefix: ';',
        },
        Player: {
            Gold: 0,
        },
    }
    // public static readonly StartingMoney = 100;
    // public static readonly StartingStamina = 100;

    public static readonly Emojis = {
        Stars:  [
            '',
            '<:star1:695779662781218837>',
            '<:star2:695779663196323840>',
            '<:star3:695779663208775680>',
            '<:star4:695778388660584509>',
            '<:star5:695778014537187370>',
        ],
        Status: {
            good: '✅',
            bad: '❌',
        },
    }

    public static readonly Icons = {
        Snacc: 'https://cdn.discordapp.com/attachments/694331679204180029/695789904671539250/food.png',
        Cosplay: 'https://cdn.discordapp.com/attachments/694331679204180029/695791356089466950/cosplay.png',
        Chonky: '',
        Fashion: '',
        Baby: '',
        Feestdagen: '',
        Vrienden: '',
        Strijders: '',
    }

    // Money
    public static readonly MoneyAbbreviation = 'G';

    public static readonly RedisKeys = {
        Redis: 'MDW:',
        guildData: 'guilddata:',
    };

}