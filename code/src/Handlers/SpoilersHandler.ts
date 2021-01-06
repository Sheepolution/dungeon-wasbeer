import IMessageInfo from '../Interfaces/IMessageInfo';
import BotManager from '../Managers/BotManager';
import MessageService from '../Services/MessageService';

export default class SpoilersHandler {

    public static async OnCommand(messageInfo:IMessageInfo, command:string, content:string) {
        switch (command) {
            case 'spoilers':
            case 'spoiler':
                this.OnSpoilers(messageInfo, content);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async OnSpoilers(messageInfo:IMessageInfo, content:string) {
        var name = '-kanaal';
        if (content != null && content.trim().length > 0) {
            name = `-${content.toLowerCase().replaceAll(' ', '-')}`;
            name = name.replaceAll('[\\d\'"]', '');
            name = name.slice(0, 100);
        }

        const channel = BotManager.GetSpoilersChannel()
        const oldChannelName = channel.name.substr(9);
        const warning = `⚠️ Ho! Uitkijken! Als je nog verder omhoog scrollt krijg je spoilers te zien voor '${oldChannelName}'! ⚠️`

        var text = '';

        if (oldChannelName != 'kanaal') {
            text = `${warning}${'\n'.repeat(50)}${warning}`;
        }

        if (name != '-kanaal') {
            text += `\n\nVanaf hier is het gespreksonderwerp voor het spoilers-kanaal ${content}.`;
        }

        if (text == '') {
            return;
        }

        try {
            channel.setName(`spoilers${name}`);
        } catch (error:any) {
            MessageService.ReplyMessage(messageInfo, 'Er is iets fout gegaan bij het instellen van de naam. Zorg dat je geen gekke leestekens gebruikt.', false, true);
            return;
        }

        MessageService.SendMessageToSpoilersChannel(text);
    }
}
