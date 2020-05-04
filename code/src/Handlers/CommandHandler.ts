import AdminHandler from './AdminHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import MessageHandler from './MessageHandler';
import PlayerCardHandler from './PlayerCardHandler';
import TradeHandler from './TradeHandler';
import SettingsConstants from '../Constants/SettingsConstants';
// import BattleHandler from './BattleHandler';
// import CharacterHandler from './CharacterHandler';
// import PuzzleHandler from './PuzzleHandler';

export default class CommandHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, content:string) {
        const words = content.split(' ');
        const command = words[0].substr(SettingsConstants.PREFIX.length).toLowerCase();
        words.shift();
        const args = words;
        content = content.slice(content.indexOf(' ')).trim();

        if (await AdminHandler.OnCommand(messageInfo, player, command, args, content)) {
            return;
        }

        if (messageInfo.message?.guild?.id != SettingsConstants.MAIN_GUILD_ID) {
            return;
        }

        if (messageInfo.channel.id == SettingsConstants.CARD_CHANNEL_ID) {
            if (await TradeHandler.OnCommand(messageInfo, player, command, content)) {
                return;
            } else if (await PlayerCardHandler.OnCommand(messageInfo, player, command, args)) {
                return;
            }
        // } else if (messageInfo.channel.id == SettingsConstants.DND_CHANNEL_ID) {
            // if (await CharacterHandler.OnCommand(messageInfo, player, command, args)) {
        //         return;
            // } else if (await BattleHandler.OnCommand(messageInfo, player, command)) {
        //         return;
        //     } else if (await PuzzleHandler.OnCommand(messageInfo, player, command)) {
        //         return;
        //     }
        }
    }

    public static async HandleNormalMessage(messageInfo:IMessageInfo, player:Player) {
        MessageHandler.OnMessage(messageInfo, player);
    }
}
