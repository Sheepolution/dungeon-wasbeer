import CardManager from './CardManager';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import { Utils } from '../Utils/Utils';

export default class PlayerManager {

    private static players:any = {};
    private static cacheRefreshInterval:any = setInterval(() => { PlayerManager.ProcessPlayerCache() }, Utils.GetMinutesInMiliSeconds(5));

    public static async GetOrCreatePlayer(messageInfo:IMessageInfo) {
        var player = await this.GetPlayer(messageInfo.member.id, messageInfo.member.displayName);
        if (player == null) {
            player = await this.CreateNewPlayer(messageInfo);

            // New player, give them their first card.
            await CardManager.GivePlayerCard(messageInfo, player);
        }
        return player;
    }

    public static ResetPlayerCache() {
        this.players = {};
    }

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

    private static async CreateNewPlayer(messageInfo:IMessageInfo) {
        const discordId = messageInfo.member.id;
        const player = new Player();
        await player.POST(discordId, messageInfo.member.displayName);
        this.CachePlayer(discordId, player)
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
}