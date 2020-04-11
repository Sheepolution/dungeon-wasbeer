import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import { Redis } from '../Providers/Redis';
import { Utils } from '../Utils/Utils';
import CardManager from '../Managers/CardManager';
import SettingsConstants from '../Constants/SettingsConstants';
import CardEmbeds from '../Embeds/CardEmbeds';
import RedisConstants from '../Constants/RedisConstants';
import MessageService from '../Services/MessageService';
import PlayerCard from '../Objects/PlayerCard';

export default class MessageHandler {

    private static readonly messagePointTimeoutPrefix = RedisConstants.REDIS_KEY + RedisConstants.MESSAGE_POINT_TIMEOUT_KEY;

    public static async OnMessage(messageInfo:IMessageInfo, player:Player) {
        if (messageInfo.member == null) {
            return;
        }

        const memberId = messageInfo.member.id;

        var messagePointTimeout = await Redis.get(MessageHandler.messagePointTimeoutPrefix + memberId);

        if (messagePointTimeout) {
            return;
        }

        player.AddMessagePoint();
        if (player.GetMessagePoints() % SettingsConstants.MESSAGE_POINT_AMOUNT_REWARDS.CARD == 0) {
            const cardModifyResult = await CardManager.GivePlayerCard(messageInfo, player);
            const playerCard = <PlayerCard>cardModifyResult.card;
            if (cardModifyResult.result) {
                MessageService.SendMessage(messageInfo, 'Je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
            } else {
                MessageService.SendMessage(messageInfo, 'Je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
            }
        }

        Redis.set(MessageHandler.messagePointTimeoutPrefix + memberId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.MESSAGE_POINT_TIMEOUT_MINUTES));
    }
}