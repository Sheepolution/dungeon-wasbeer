import CardManager from './CardManager';
import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Message, TextChannel } from 'discord.js';
import MessageHandler from '../Handlers/MessageHandler';
import PlayerManager from './PlayerManager';
import DiscordUtils from '../Utils/DiscordUtils';
import SettingsConstants from '../Constants/SettingsConstants';
import CampaignManager from './CampaignManager';
import DiscordService from '../Services/DiscordService';
import MonsterManager from './MonsterManager';

export default class BotManager {

    private static mainChannel:TextChannel;

    public static async OnReady() {
        console.log('Dungeon Wasbeer: Connected');
        BotManager.mainChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.MAIN_CHANNEL_ID);
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
