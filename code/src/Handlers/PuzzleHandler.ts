import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import CampaignManager from '../Managers/CampaignManager';
import MessageService from '../Services/MessageService';
import PuzzleEmbeds from '../Embeds/PuzzleEmbeds';

export default class PuzzleHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string) {
        switch (command) {
            case 'puzzel':
                this.SendPuzzleInfo(messageInfo);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async SendPuzzleInfo(messageInfo:IMessageInfo) {
        const puzzle = CampaignManager.GetPuzzle();
        if (puzzle == null) {
            this.ReplyNoPuzzle(messageInfo);
            return;
        }
        return await MessageService.ReplyEmbed(messageInfo, PuzzleEmbeds.GetSudokuEmbed(puzzle));
    }

    private static async ReplyNoPuzzle(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Er is geen puzzel op het moment.', false);
    }
}