import CardManager from './CardManager';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import { Utils } from '../Utils/Utils';
import MessageService from '../Services/MessageService';
import { ClassType } from '../Enums/ClassType';
import Character from '../Objects/Character';
import PlayerCard from '../Objects/PlayerCard';
import BotManager from './BotManager';
import CardEmbeds from '../Embeds/CardEmbeds';
import { LogType } from '../Enums/LogType';
import LogService from '../Services/LogService';

export default class PlayerManager {

    private static players: any = {};
    private static cacheRefreshInterval: any = setInterval(() => { PlayerManager.ProcessPlayerCache(); }, Utils.GetMinutesInMiliSeconds(5));
    private static readonly classNames = Object.keys(ClassType);

    public static async GetOrCreatePlayer(messageInfo: IMessageInfo) {
        var player = await this.GetPlayer(messageInfo.member.id, messageInfo.member.displayName);
        if (player == null) {
            player = await this.CreateNewPlayer(messageInfo);

            // New player, give them their first card.
            const cardModifyResult = await CardManager.GivePlayerCard(player);
            const playerCard = <PlayerCard>cardModifyResult.object;
            messageInfo.channel = BotManager.GetCardChannel();
            if (cardModifyResult.result) {
                MessageService.ReplyMessage(messageInfo, 'Je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                LogService.Log(player, playerCard.GetCardId(), LogType.CardReceived, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen.`);
            }
        }
        return player;
    }

    public static ResetPlayerCache() {
        this.players = {};
    }

    public static async GetPlayerById(playerId: string) {
        const cachedPlayer: any = Object.values(this.players).find((e: any) => e.player.GetId() == playerId);
        if (cachedPlayer) {
            return cachedPlayer.player;
        }

        const player = new Player();
        await player.GET(playerId, true);
        return player;
    }

    public static async GetPlayer(discordId: string, discordDisplayName?: string) {
        // Check for cache
        var player = this.GetCachedPlayer(discordId);
        if (player) {
            this.CachePlayer(discordId, player);
            return player;
        }

        // Find and create the player
        player = new Player();
        const success = await player.GET(discordId);

        if (success) {
            this.CachePlayer(discordId, player);
            if (discordDisplayName) {
                player.UpdateDiscordName(discordDisplayName);
            }
            return player;
        }

        return null;
    }

    public static GetCharacterFromPlayer(messageInfo: IMessageInfo, player: Player) {
        const character = player.GetCharacter();
        if (character == null) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog geen character aangemaakt. Kies een van de volgende classes met \`;class\`:\n${this.classNames.join(', ')}`, false);
            return;
        }

        return character;
    }

    public static GetCachePlayerCharacterByCharacterId(characterId: string) {
        for (const player of this.players) {
            const character = player.GetCharacter();
            if (character != null) {
                if (character.GetId() == characterId) {
                    return character;
                }
            }
        }
    }

    public static GetAllCachedCharacters() {
        const characters = new Array<Character>();
        for (const id in this.players) {
            if ({}.hasOwnProperty.call(this.players, id)) {
                const playerInfo = this.players[id];
                const character = playerInfo.player.GetCharacter();
                if (character) {
                    characters.push(character);
                }
            }
        }

        return characters;
    }

    private static async CreateNewPlayer(messageInfo: IMessageInfo) {
        const discordId = messageInfo.member.id;
        const player = new Player();
        await player.POST(discordId, messageInfo.member.displayName);
        this.CachePlayer(discordId, player);
        LogService.Log(player, player.GetId(), LogType.NewPlayer, `${player.GetDiscordName()} is een nieuwe speler.`);
        return player;
    }

    private static CachePlayer(discordId: string, player: Player) {
        this.players[discordId] = { time: 60, player: player };
    }

    private static GetCachedPlayer(discordId: string) {
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