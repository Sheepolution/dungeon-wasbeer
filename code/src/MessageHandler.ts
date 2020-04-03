import { Message, TextChannel } from "discord.js";
import { Redis, RedisAsync } from "./Redis";
import IMessageInfo from "./IMessageInfo";
import { Utils } from "./Utils";
import Card from "./Card";
import CardModel from "./models/CardModel";
import PlayerCard from "./PlayerCard";
import Player from "./Player";
import Embedder from "./Embedder";
import DungeonWasbeer from "./DungeonWasbeer";
import Constants from "./Constants";
import CardHandler from "./CardHandler";

export default class MessageHandler {

    private static readonly messagePointTimeoutPrefix = Constants.RedisKeys.Redis + "messagePointTimeout:";
    
    public static async OnMessage(message:IMessageInfo, player:Player) {
        if (message.member == null) {
            return;
        }

        const member_id = message.member.id;
        
        var messagePointTimeout = await Redis.get(MessageHandler.messagePointTimeoutPrefix + member_id);

        if (messagePointTimeout) {
            return;
        }

        player.AddMessagePoint();
        if (player.GetMessagePoints() % Constants.Settings.MessagePointAmountRewards.Card == 0) {
            CardHandler.GiveMemberCard(message, player);
        }

        Redis.set(MessageHandler.messagePointTimeoutPrefix + member_id, "1", "EX", Utils.GetMinutesInSeconds(Constants.Settings.MessagePointTimeoutMinutes));
    }
}