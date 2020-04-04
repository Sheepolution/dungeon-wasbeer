import Discord = require("discord.js");
import GameManager from "./GameManager";
import IMessageInfo from "./IMessageInfo";
import CardHandler from "./CardHandler";

interface Regexes {
    mention:RegExp,
    channel:RegExp,
    emoji:RegExp
}

export default class DungeonWasbeer {

    public static mainChannel:Discord.TextChannel;

    public static client:Discord.Client;
    private static readonly regexes:Regexes = {
        mention: /<@!?([0-9]*)>/,
        channel: /<#!?([0-9]*)>/,
        emoji: /<:[0-z]+:([0-9]+)>/
    }

    private static game:GameManager;

    constructor() {
    }

    public static Init() {
        DungeonWasbeer.client = new Discord.Client();
        DungeonWasbeer.game = new GameManager();
        const client = DungeonWasbeer.client;


        client.on('ready', async function () { await DungeonWasbeer.EventReady() });

        client.on("message", async function (message) { await DungeonWasbeer.EventMessage(message) });

        client.login(process.env.TOKEN);
    }

    public static OnReady() {
        this.HandleRedisStorage();
        CardHandler.BuildCardList();
    }

    static async EventReady () {
        console.log("Dungeon Wasbeer: Connected");
        DungeonWasbeer.mainChannel = <Discord.TextChannel> await DungeonWasbeer.client.channels.fetch(process.env.MAIN_CHANNEL_ID || "");
        DungeonWasbeer.OnReady();
    }

    static async EventMessage (message:Discord.Message) {
        if (message.author.bot) {
            return;
        }

        if (message.guild == null) {
            return;
        }

        await DungeonWasbeer.game.OnMessage(message);
    }

    static IsId = function (id:string) {
        return id.match(/^[0-9]{17,20}$/) != null;
    }
    
    static async HandleRedisStorage() {
    }

    // GET ////////////////////////

    static GetClient() {
        return DungeonWasbeer.client;
    }

    static GetMemberId = function (id:string) {
        if (DungeonWasbeer.IsId(id)) { return id; }
        var match = id.match(DungeonWasbeer.regexes.mention);
        if (match) {
            return match[1];
        }
        return null;
    }

    static GetChannelId = function (id:string) {
        if (DungeonWasbeer.IsId(id)) { return id; }
        var match = id.match(DungeonWasbeer.regexes.channel);
        if (match) {
            return match[1];
        }
        return null;
    }

    // FIND ////////////////////////

    static async FindMemberById(qMember:string, guild:Discord.Guild) {
        // fetchMembers DOES call API, even when cached.
        // TODO
        await guild.members.fetch();

        const id = DungeonWasbeer.GetMemberId(qMember);
        if (id) {
            const foundMember = guild.members.cache.get(id);
            if (foundMember != null) {
                return foundMember;
            }
        }
    }

    static async FindMember(qMember:string, guild:Discord.Guild) {
        await guild.members.fetch();

        const foundMember = await this.FindMemberById(qMember, guild);
        if (foundMember) {
            return foundMember;
        }
        
        const lowerMember = qMember.toLowerCase();
        return guild.members.cache.find(member => {
            return member.displayName.toLowerCase() == lowerMember || member.user.username.toLowerCase() == lowerMember;
        });
    }

    static async FindMessage(qMessage:string, channel:Discord.TextChannel) {
        return channel.messages.fetch(qMessage);
    }

    static async FindUser(userId:string) {
        return await this.client.users.fetch(userId);
    }

    static FindChannel(qChannel:string, guild?:Discord.Guild):Discord.Channel|undefined {
        const id = DungeonWasbeer.GetChannelId(qChannel);
        if (id) {
            const foundChannel = DungeonWasbeer.client.channels.cache.get(id);
            if (foundChannel != null) {
                return foundChannel;
            }
        }

        if (guild) {
            return guild.channels.cache.find(channel => channel.name.toLowerCase() == qChannel.toLowerCase());
        }
        return undefined;
    }

    static FindGuild(guildId:string) {
        return this.client.guilds.cache.get(guildId);
    }


    static IsMemberAdmin(member:Discord.GuildMember) {
        return member.hasPermission("ADMINISTRATOR");
    }

    // SEND ////////////////////////

    public static SendEmbed(embed:Discord.MessageEmbed, channel:Discord.Channel, content?:string) {
        // channel = (<Discord.TextChannel>channel).guild == process.env.TEST_GUILD_CHANNEL ? channel : DungeonWasbeer.mainChannel;
        return content ? DungeonWasbeer.mainChannel.send(content, embed) : DungeonWasbeer.mainChannel.send(embed)
    }

    public static SendMessage(channel:Discord.TextChannel, message:string, embed?:Discord.MessageEmbed) {
        if (embed) {
            this.SendEmbed(embed, DungeonWasbeer.mainChannel, message)
            return;
        }

        DungeonWasbeer.mainChannel.send(message);
    }

    public static ReplyMessage(channel:Discord.TextChannel, member:Discord.GuildMember, message:string, embed?:Discord.MessageEmbed) {
        const reply = `<@${member.user}> ${message}`;

        if (embed) {
            this.SendEmbed(embed, DungeonWasbeer.mainChannel, reply)
            return;
        }

        DungeonWasbeer.mainChannel.send(reply);
    }


    // CREATE //////////////////////


    // UTILS ///////////////////////

    public static ParseMessageToInfo(message:Discord.Message, member:Discord.GuildMember) {
        const info:IMessageInfo = {
            member: member,
            channel: message.channel,
            message: message
        };

        return info;
    }

    public static ParseChannelMentionsToIds(channels:Array<string>) {
        const ret = new Array<string>();
        for (let i = 0; i < channels.length; i++) {
            const id = DungeonWasbeer.GetChannelId(channels[i]);
            if (id) {
                ret.push(id);
            }
        }
        return ret;
    }
}