import Discord = require("discord.js");

export default class Constants {

    public static readonly Colors = {
        red:"#ff0000",
        blue:"#0000ff",
        green:"#00ff00",
        default:"#0AD1CF"
    }

    // Gameplay
    public static readonly Defaults = {
        Guild: {
            Prefix: ";"
        },
        Player: {
            Gold: 0
        }
    }
    // public static readonly StartingMoney = 100;
    // public static readonly StartingStamina = 100;

    public static readonly Emojis = {
        chicken:"<:chicken:602446447425880103>",
        cow: "<:cow_emoji2:602998554532904961>",
        sheep: "🐑"
    }

    // Money
    public static readonly MoneyAbbreviation = "G";

    public static readonly RedisKeys = {
        Redis: "MDW:",
        guildData: "guilddata:"
    }

    public static readonly Settings = {
        MessagePointTimeoutMinutes: 15,
        MessagePointAmountRewards: {
            Card: 8
        },
        CardRankRollValue: [
            55,
            25,
            10,
            3
        ]
    }
}