import IMessageInfo from '../Interfaces/IMessageInfo';
import PlayerManager from '../Managers/PlayerManager';

export default class PlayerService {

    // TODO: Get by Discord ID
    // TODO: GetPlayer(messageInfo)
    public static async GetPlayer(discordId: string) {
        return PlayerManager.GetPlayer(discordId);
    }

    public static async GetOrCreatePlayer(messageInfo: IMessageInfo) {
        return PlayerManager.GetOrCreatePlayer(messageInfo);
    }
}