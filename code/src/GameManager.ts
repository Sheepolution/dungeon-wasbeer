import Player from "./Player";
import { Message, TextChannel, GuildMember, Guild } from "discord.js";
import Embedder from "./Embedder";
import { Redis, RedisAsync } from "./Redis";
import IMessageInfo from "./IMessageInfo";
import DungeonWasbeer from "./DungeonWasbeer";
import Constants from "./Constants";
import { Utils } from "./Utils";
import CommandHandler from "./CommandHandler";
import CardHandler from "./CardHandler";

export default class GameManager {

    private commandHandler:CommandHandler;
    private players:any;
    private cacheRefreshInterval:any;

    constructor() {
        this.players = {};
        this.commandHandler = new CommandHandler(this);
        var that = this;
        this.cacheRefreshInterval = setInterval(() => { that.RefreshCache() }, 1000 * 60 * 5);
    }

    public async GetPlayer(discordId:string, message:IMessageInfo, discordDisplayName:string) { 
        // Check for cache
        var player = this.GetCachedPlayer(discordId);
        if (player) {
            this.CachePlayer(discordId, player);
            return player;
        }

        // Find and create the player
        player = new Player();
        const success = await player.GET(discordId);
        
        if (success){
            this.CachePlayer(discordId, player);
            player.UpdateDiscordName(discordDisplayName);
            return player;
        }

        return null;
    }

    public async CreateNewPlayer(command:IMessageInfo) {
        const discord_id = command.member.id;
        const player = new Player();
        await player.POST(discord_id, command.member.displayName);
        this.CachePlayer(discord_id, player)
        return player;
    }

    public CachePlayer(discordId:string, player:Player) {
        this.players[discordId] = {time: 60, player: player}
    }

    public GetCachedPlayer(discordId:string) {
        const data = this.players[discordId];
        if (data) {
            return data.player;
        }
    }

    public RefreshCache() {
        for (const key in this.players) {
            const element = this.players[key];
            element.time -= 1;
            if (element.time <= 0) {
                delete this.players[key];
            }
        }
    }

    public async OnMessage(message:Message) {
        if (message.guild == null) {
            return;
        }

        if (message.member == null) {
            return;
        }

        const message_info:IMessageInfo = DungeonWasbeer.ParseMessageToInfo(message, message.member);

        var player = await this.GetPlayer(message.member.id, message_info, message.member.displayName);

        if (player == null) {
            player = await this.CreateNewPlayer(message_info);
            await CardHandler.GiveMemberCard(message_info, player);
        }

        var content = message.content.trim();

        var prefix = Constants.Defaults.Guild.Prefix;
        
        if (content.startsWith(prefix)) {
            if (message.channel.id != process.env.MAIN_CHANNEL_ID) {
                return;
            }

            const words = content.split(" ");
            const command = words[0].substr(prefix.length);
            words.shift();
            const args = words;
            content = content.slice(content.indexOf(" ")).trim();
            this.commandHandler.OnCommand(message_info, player, content, command, args);
        }
        else {
            if (message_info.message?.guild != process.env.MAIN_CHANNEL_ID) {
                return;
            }
            this.commandHandler.HandleNormalMessage(message_info, player)
        }
    }

    public async RefreshAllCache() {
        this.players = {};
        CardHandler.BuildCardList();
    }
}