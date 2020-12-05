import CardManager from './CardManager';
import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Message, TextChannel, MessageReaction, User } from 'discord.js';
import MessageHandler from '../Handlers/MessageHandler';
import PlayerManager from './PlayerManager';
import DiscordUtils from '../Utils/DiscordUtils';
import SettingsConstants from '../Constants/SettingsConstants';
import CampaignManager from './CampaignManager';
import DiscordService from '../Services/DiscordService';
import MonsterManager from './MonsterManager';
import ConfigurationManager from './ConfigurationManager';
import ReactionManager from './ReactionManager';

export default class BotManager {

    private static cardChannel:TextChannel;
    private static dndChannel:TextChannel;
    private static artChannel:TextChannel;
    private static chatChannel:TextChannel;
    private static logChannel:TextChannel;

    public static async OnReady() {
        console.log('Dungeon Wasbeer: Connected');
        ConfigurationManager.BuildConfigurationList();
        BotManager.cardChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CARD_CHANNEL_ID);
        BotManager.dndChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.DND_CHANNEL_ID);
        BotManager.artChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.ART_CHANNEL_ID);
        BotManager.chatChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHAT_CHANNEL_ID);
        BotManager.logChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.LOG_CHANNEL_ID);
        await CardManager.BuildCardList();
        await MonsterManager.BuildMonsterList();
        await CampaignManager.ContinueSession();
    }

    public static async OnMessage(message:Message) {
        if (message.guild == null) {
            return;
        }

        if (message.member == null) {
            return;
        }

        const messageInfo:IMessageInfo = DiscordUtils.ParseMessageToInfo(message, message.member);

        var player = await PlayerManager.GetOrCreatePlayer(messageInfo);
        var content = message.content.trim();
        var prefix = SettingsConstants.PREFIX;

        if (content.startsWith(prefix)) {
            CommandHandler.OnCommand(messageInfo, player, content);
        } else {
            if (messageInfo.message?.guild?.id != SettingsConstants.MAIN_GUILD_ID) {
                return;
            }

            if (messageInfo.channel.id == SettingsConstants.CARD_CHANNEL_ID) {
                return;
            }

            if (messageInfo.channel.id == SettingsConstants.DND_CHANNEL_ID) {
                return;
            }

            MessageHandler.OnMessage(messageInfo, player)
        }
    }

    public static async OnReaction(reaction:MessageReaction, user:User) {
        if (user.id == SettingsConstants.BOT_ID) {
            return;
        }

        ReactionManager.OnReaction(reaction, user);
    }

    public static async ResetAllCache() {
        PlayerManager.ResetPlayerCache();
        CardManager.BuildCardList();
        MonsterManager.BuildMonsterList();
        ConfigurationManager.BuildConfigurationList();
    }

    public static GetCardChannel() {
        return BotManager.cardChannel;
    }

    public static GetDNDChannel() {
        return BotManager.dndChannel;
    }

    public static GetArtChannel() {
        return BotManager.artChannel;
    }

    public static GetChatChannel() {
        return BotManager.chatChannel;
    }

    public static GetLogChannel() {
        return BotManager.logChannel;
    }
}
