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
import { LogType } from '../Enums/LogType';
import LogService from '../Services/LogService';

export default class MessageHandler {

    private static readonly messagePointTimeoutPrefix = RedisConstants.REDIS_KEY + RedisConstants.MESSAGE_POINT_TIMEOUT_KEY;
    private static readonly characterUpdateTimeoutPrefix = RedisConstants.REDIS_KEY + RedisConstants.CHARACTER_UPDATE_TIMEOUT_KEY;

    public static async OnMessage(messageInfo:IMessageInfo, player:Player) {
        if (messageInfo.member == null) {
            return;
        }

        const character = player.GetCharacter();
        if (character != null) {
            const characterId = character.GetId();
            const characterUpdateTimeout = await Redis.get(MessageHandler.characterUpdateTimeoutPrefix + characterId);
            if (!characterUpdateTimeout) {
                character.GetHealthFromMessage();
                character.IncreaseXPFromMessage();
            }

            Redis.set(characterUpdateTimeout + characterId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.CHARACTER_POINT_TIMEOUT_MINUTES));
        }

        const content = messageInfo.message?.content;
        if (content) {
            const contentLower = content.toLowerCase();
            if ((contentLower.startsWith('kaart') || contentLower.includes(' kaart ')) && content.length <= 20) {
                this.OnBegging(messageInfo, player);
                return;
            }
        }

        const memberId = messageInfo.member.id;

        var messagePointTimeout = await Redis.get(MessageHandler.messagePointTimeoutPrefix + memberId);

        if (messagePointTimeout) {
            return;
        }

        player.AddMessagePoint();

        if (player.GetMessagePoints() % SettingsConstants.MESSAGE_POINT_AMOUNT_REWARDS.CARD == 0) {
            const cardModifyResult = await CardManager.GivePlayerCard(messageInfo, player);
            const playerCard = <PlayerCard>cardModifyResult.object;
            messageInfo.channel = BotManager.GetCardChannel();
            if (cardModifyResult.result) {
                MessageService.ReplyMessage(messageInfo, 'Je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                LogService.Log(player, playerCard.GetCardId(), LogType.CardReceived, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen.`);
            } else {
                MessageService.ReplyMessage(messageInfo, 'Je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                LogService.Log(player, playerCard.GetCardId(), LogType.CardReceived, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen, en heeft daar nu ${playerCard.GetAmount()} van.`);
            }
        }

        Redis.set(MessageHandler.messagePointTimeoutPrefix + memberId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.MESSAGE_POINT_TIMEOUT_MINUTES));
    }

    public static OnBegging(messageInfo:IMessageInfo, player:Player) {
        const playerCards = player.GetCards();
        if (playerCards.length == 0) {
            return;
        }

        const unequipedCards = playerCards.filter(c => !c.IsEquipped() && !c.IsUsedInTrade());
        if (unequipedCards.length > 0) {
            const playerCard = playerCards.randomChoice();
            playerCard.RemoveOne();
            messageInfo.channel = BotManager.GetCardChannel();
            MessageService.ReplyMessage(messageInfo, 'Zij die bedelen worden gestraft. Deze kaart pak ik gewoon weer van je af. Dat zal je leren!', false, true, CardEmbeds.GetCardEmbed(playerCard.GetCard()));
            LogService.Log(player, playerCard.GetCardId(), LogType.CardTaken, `${player.GetDiscordName()} heeft gebedeld met het bericht '${messageInfo.message?.content}' en waardoor de kaart '${playerCard.GetCard().GetName()}' is afgepakt.`);
        }
    }
}
