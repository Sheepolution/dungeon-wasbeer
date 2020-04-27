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
import BotManager from '../Managers/BotManager';

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

        const content = messageInfo.message?.content;
        if (content) {
            const contentLower = content.toLowerCase();
            if (contentLower.includes('kaart') && content.length <= 20) {
                this.OnBegging(messageInfo, player);
                return;
            }
        }

        player.AddMessagePoint();
        if (player.GetMessagePoints() % SettingsConstants.MESSAGE_POINT_AMOUNT_REWARDS.CARD == 0) {
            const cardModifyResult = await CardManager.GivePlayerCard(messageInfo, player);
            const playerCard = <PlayerCard>cardModifyResult.object;
            messageInfo.channel = BotManager.GetCardChannel();
            if (cardModifyResult.result) {
                MessageService.ReplyMessage(messageInfo, 'Je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
            } else {
                MessageService.ReplyMessage(messageInfo, 'Je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
            }
        }

        Redis.set(MessageHandler.messagePointTimeoutPrefix + memberId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.MESSAGE_POINT_TIMEOUT_MINUTES));
    }

    public static OnBegging(messageInfo:IMessageInfo, player:Player) {
        const playerCards = player.GetCards();
        if (playerCards.length == 0) {
            return;
        }

        const unequipedCards = playerCards.filter(c => !c.IsEquipped());
        if (unequipedCards.length > 0) {
            const playerCard = playerCards.randomChoice();
            playerCard.RemoveOne();
            messageInfo.channel = BotManager.GetCardChannel();
            MessageService.SendMessageToCardChannel('Zij die bedelen worden gestraft. Deze kaart pak ik gewoon weer van je af. Dat zal je leren!');
        }
    }
}