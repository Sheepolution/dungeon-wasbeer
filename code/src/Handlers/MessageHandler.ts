import ArtHandler from './ArtHandler';
import BotManager from '../Managers/BotManager';
import CardEmbeds from '../Embeds/CardEmbeds';
import CardManager from '../Managers/CardManager';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { LogType } from '../Enums/LogType';
import { Redis } from '../Providers/Redis';
import { Utils } from '../Utils/Utils';

export default class MessageHandler {

    private static readonly messagePointTimeoutPrefix = RedisConstants.REDIS_KEY + RedisConstants.MESSAGE_POINT_TIMEOUT_KEY;
    private static readonly characterUpdateTimeoutPrefix = RedisConstants.REDIS_KEY + RedisConstants.CHARACTER_UPDATE_TIMEOUT_KEY;

    public static async OnMessage(messageInfo: IMessageInfo, player: Player) {
        if (messageInfo.member == null) {
            return;
        }

        if (messageInfo.message?.channel.id == SettingsConstants.ART_CHANNEL_ID) {
            this.OnPostingArt(messageInfo);
        }

        if (messageInfo.message?.channel.id == SettingsConstants.FOCUS_CHANNEL_ID) {
            await messageInfo.message.delete().catch();
            return;
        }

        const content = messageInfo.message?.content;

        if (content) {
            if (content.startsWith('<') && content.endsWith('>')) {
                return;
            }

            if (content.startsWith('-') || content.startsWith('.')) {
                return;
            }

            const contentLower = content.toLowerCase();

            if (contentLower.includes('kaard') || contentLower.includes('picard')) {
                return;
            }

            if ((contentLower.startsWith('kaart') || contentLower.includes(' kaart ')) && content.length <= 20) {
                this.OnBegging(messageInfo, player);
                return;
            }

            if (contentLower.startsWith('even een punt pakken')) {
                for (let i = 0; i < 5; i++) {
                    this.OnBegging(messageInfo, player);
                    await Utils.Sleep(5)
                }
                return;
            }

            if (content.length <= 6) {
                return;
            }
        }

        const character = player.GetCharacter();
        if (character != null) {
            const characterId = character.GetId();
            const characterUpdateTimeout = await Redis.get(MessageHandler.characterUpdateTimeoutPrefix + characterId);
            if (!characterUpdateTimeout) {
                character.GetHealthFromMessage();
            }

            Redis.set(MessageHandler.characterUpdateTimeoutPrefix + characterId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.CHARACTER_POINT_TIMEOUT_MINUTES));
        }

        const memberId = messageInfo.member.id;

        var messagePointTimeout = await Redis.get(MessageHandler.messagePointTimeoutPrefix + memberId);

        if (messagePointTimeout) {
            return;
        }

        player.AddMessagePoint();

        const cardAmount = player.GetCards().length;

        var pointRewardIndex = 0;

        for (const value of SettingsConstants.CARD_AMOUNT_REWARD_REACH_INCREASE) {
            if (value > cardAmount) {
                break;
            }
            pointRewardIndex += 1;
        }

        const rewardPoints = SettingsConstants.MESSAGE_POINT_AMOUNT_REWARDS.CARD[pointRewardIndex];

        if (player.GetMessagePoints() % rewardPoints == 0) {
            const cardModifyResult = await CardManager.GivePlayerCard(player);
            const playerCard = <PlayerCard>cardModifyResult.object;
            messageInfo.channel = BotManager.GetCardChannel();
            if (cardModifyResult.result) {
                var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je hebt een nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                if (cardMessage != null) {
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceived, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen.`);
                }
            } else {
                var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je hebt een extra van deze kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                if (cardMessage != null) {
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceived, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen, en heeft daar nu ${playerCard.GetAmount()} van.`);
                }
            }
        }

        Redis.set(MessageHandler.messagePointTimeoutPrefix + memberId, '1', 'EX', Utils.GetMinutesInSeconds(SettingsConstants.MESSAGE_POINT_TIMEOUT_MINUTES));
    }

    public static OnBegging(messageInfo: IMessageInfo, player: Player) {
        const playerCards = player.GetCards();
        if (playerCards.length == 0) {
            return;
        }

        const unequipedCards = playerCards.filter(c => !c.IsEquipped() && !c.IsUsedInTrade() && !c.GetCard().IsExclusive());
        if (unequipedCards.length > 0) {
            const playerCard = playerCards.randomChoice();
            playerCard.RemoveOne();
            messageInfo.channel = BotManager.GetCardChannel();
            MessageService.ReplyMessage(messageInfo, 'Zij die bedelen worden gestraft. Deze kaart pak ik gewoon weer van je af. Dat zal je leren!', false, true, CardEmbeds.GetCardEmbed(playerCard.GetCard()));
            LogService.Log(player, playerCard.GetCardId(), LogType.CardTaken, `${player.GetDiscordName()} heeft gebedeld met het bericht '${messageInfo.message?.content}' en waardoor de kaart '${playerCard.GetCard().GetName()}' is afgepakt.`);
        }
    }

    private static OnPostingArt(messageInfo: IMessageInfo) {
        const attachment = messageInfo.message?.attachments.first();
        if (attachment == null || !['.png', 'jpeg', '.jpg', '.gif', '.mp4', '.mp3'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
            return;
        }

        ArtHandler.AddPinReaction(messageInfo);
    }
}
