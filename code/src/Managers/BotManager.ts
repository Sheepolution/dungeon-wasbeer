import CardManager from './CardManager';
import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Message, TextChannel } from 'discord.js';
import MessageHandler from '../Handlers/MessageHandler';
import PlayerManager from './PlayerManager';
import DiscordUtils from '../Utils/DiscordUtils';
import DiscordService from '../Services/DiscordService';
import SettingsConstants from '../Constants/SettingsConstants';

export default class BotManager {

    public static mainChannel:TextChannel;

    public static async OnReady() {
        console.log('Dungeon Wasbeer: Connected');
        BotManager.mainChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.MAIN_CHANNEL_ID);
        CardManager.BuildCardList();
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
            if (message.guild.id == SettingsConstants.MAIN_GUILD_ID && message.channel.id != SettingsConstants.MAIN_CHANNEL_ID) {
                return;
            }

            CommandHandler.OnCommand(messageInfo, player, content);
        }
        else {
            if (messageInfo.message?.guild?.id != SettingsConstants.MAIN_GUILD_ID) {
                return;
            }

            if (messageInfo.channel.id == SettingsConstants.MAIN_CHANNEL_ID) {
                return;
            }

            MessageHandler.OnMessage(messageInfo, player)
        }
    }

    public static async ResetAllCache() {
        PlayerManager.ResetPlayerCache();
        CardManager.BuildCardList();
    }

    public static GetMainChannel() {
        return BotManager.mainChannel;
    }
}