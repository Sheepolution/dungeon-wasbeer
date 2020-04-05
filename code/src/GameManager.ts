import Player from "./Player";
import { Message } from "discord.js";
import IMessageInfo from "./IMessageInfo";
import DungeonWasbeer from "./DungeonWasbeer";
import Constants from "./Constants";
import CommandHandler from "./CommandHandler";
import CardHandler from "./CardHandler";

export default class GameManager {

    private static players:any = {};
    private static cacheRefreshInterval:any = setInterval(() => { GameManager.ProcessPlayerCache() }, 1000 * 60 * 5);

    public static async GetPlayer(discordId:string, discordDisplayName?:string) { 
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
            if (discordDisplayName) {
                player.UpdateDiscordName(discordDisplayName);
            }
            return player;
        }

        return null;
    }

    private static async CreateNewPlayer(command:IMessageInfo) {
        const discord_id = command.member.id;
        const player = new Player();
        await player.POST(discord_id, command.member.displayName);
        this.CachePlayer(discord_id, player)
        return player;
    }

    private static CachePlayer(discordId:string, player:Player) {
        this.players[discordId] = {time: 60, player: player}
    }

    private static GetCachedPlayer(discordId:string) {
        const data = this.players[discordId];
        if (data) {
            return data.player;
        }
    }

    private static ProcessPlayerCache() {
        for (const key in this.players) {
            const element = this.players[key];
            element.time -= 1;
            if (element.time <= 0) {
                delete this.players[key];
            }
        }
    }

    public static async OnMessage(message:Message) {
        if (message.guild == null) {
            return;
        }

        if (message.member == null) {
            return;
        }

        const message_info:IMessageInfo = DungeonWasbeer.ParseMessageToInfo(message, message.member);

        var player = await this.GetPlayer(message.member.id, message.member.displayName);

        if (player == null) {
            player = await this.CreateNewPlayer(message_info);
            await CardHandler.GiveMemberCard(message_info, player);
        }

        var content = message.content.trim();

        var prefix = Constants.Defaults.Guild.Prefix;
        
        if (content.startsWith(prefix)) {
            if (message.guild.id == DungeonWasbeer.mainGuildId && message.channel.id != DungeonWasbeer.mainChannelId) {
                return;
            }

            const words = content.split(" ");
            const command = words[0].substr(prefix.length).toLowerCase();
            words.shift();
            const args = words;
            content = content.slice(content.indexOf(" ")).trim();
            CommandHandler.OnCommand(message_info, player, content, command, args);
        }
        else {
            if (message_info.message?.guild?.id != DungeonWasbeer.mainGuildId) {
                return;
            }
            CommandHandler.HandleNormalMessage(message_info, player)
        }
    }

    public static async RefreshAllCache() {
        this.players = {};
        CardHandler.BuildCardList();
    }
}