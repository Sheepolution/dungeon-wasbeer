import AdminHandler from './AdminHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import MessageHandler from './MessageHandler';
import PlayerCardHandler from './PlayerCardHandler';
import TradeHandler from './TradeHandler';
import SettingsConstants from '../Constants/SettingsConstants';
import BattleHandler from './BattleHandler';
import CharacterHandler from './CharacterHandler';
import PuzzleHandler from './PuzzleHandler';
import ShoeHandler from './ShoeHandler';
import BotManager from '../Managers/BotManager';
import SpoilersHandler from './SpoilersHandler';
import FocusHandler from './FocusHandler';

export default class CommandHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, content:string) {
        const words = content.split(' ');
        const command = words[0].substr(SettingsConstants.PREFIX.length).toLowerCase();
        words.shift();
        const args = words;
        if (content.trim().includes(' ')) {
            content = content.slice(content.indexOf(' ')).trim();
        } else {
            content = '';
        }

        if (await AdminHandler.OnCommand(messageInfo, player, command, args, content)) {
            return;
        }

        if (BotManager.GetLocked()) {
            return;
        }

        if (messageInfo.message?.guild?.id != SettingsConstants.MAIN_GUILD_ID) {
            return;
        }

        if (messageInfo.channel.id == SettingsConstants.CARD_CHANNEL_ID) {
            if (await TradeHandler.OnCommand(messageInfo, player, command, content)) {
                return;
            } else if (await PlayerCardHandler.OnCommand(messageInfo, player, command, args, content)) {
                return;
            } else if (await ShoeHandler.OnCommand(messageInfo, player, command)) {
                return;
            }
        } else if (messageInfo.channel.id == SettingsConstants.DND_CHANNEL_ID) {
            if (await TradeHandler.OnCommand(messageInfo, player, command, content)) {
                return;
            } else if (await PlayerCardHandler.OnCommand(messageInfo, player, command, args, content)) {
                return;
            } else if (await CharacterHandler.OnCommand(messageInfo, player, command, args, content)) {
                return;
            } else if (await BattleHandler.OnCommand(messageInfo, player, command)) {
                return;
            } else if (await PuzzleHandler.OnCommand(messageInfo, player, command, content)) {
                return;
            }
        } else if (messageInfo.channel.id == SettingsConstants.SPOILERS_CHANNEL_ID) {
            if (await SpoilersHandler.OnCommand(messageInfo, command, content)) {
                return;
            }
        } else if (messageInfo.channel.id == SettingsConstants.CHAT_CHANNEL_ID) {
            if (await FocusHandler.OnCommand(messageInfo, command)) {
                return;
            }
        } else if (messageInfo.channel.id == SettingsConstants.FOCUS_CHANNEL_ID) {
            if (await FocusHandler.OnFocusCommand(messageInfo, command, content)) {
                return;
            }
        }
    }

    public static async HandleNormalMessage(messageInfo:IMessageInfo, player:Player) {
        MessageHandler.OnMessage(messageInfo, player);
    }
}
