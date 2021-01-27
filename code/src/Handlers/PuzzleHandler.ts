import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import CampaignManager from '../Managers/CampaignManager';
import MessageService from '../Services/MessageService';
import PuzzleEmbeds from '../Embeds/PuzzleEmbeds';
import { Utils } from '../Utils/Utils';
import Puzzle from '../Objects/Puzzle';
import { LogType } from '../Enums/LogType';
import Character from '../Objects/Character';
import PlayerManager from '../Managers/PlayerManager';
import PuzzleService from '../Services/PuzzleService';
import LogService from '../Services/LogService';

export default class PuzzleHandler {

    public static async OnCommand(messageInfo: IMessageInfo, player: Player, command: string, content: string) {
        switch (command) {
            case 'puzzel':
                this.SendPuzzleInfo(messageInfo);
                break;
            case 'los-op':
            case 'oplossen':
            case 'antwoord':
                this.SolvePuzzle(messageInfo, player, content);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async SendPuzzleInfo(messageInfo: IMessageInfo) {
        const puzzle = CampaignManager.GetPuzzle();
        if (puzzle == null) {
            this.ReplyNoPuzzle(messageInfo);
            return;
        }
        return await MessageService.ReplyEmbed(messageInfo, PuzzleEmbeds.GetSudokuEmbed(puzzle));
    }

    private static async SolvePuzzle(messageInfo: IMessageInfo, player: Player, content: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }

        const puzzle = CampaignManager.GetPuzzle();
        if (puzzle == null) {
            this.ReplyNoPuzzle(messageInfo);
            return;
        }

        if (puzzle.IsSolved()) {
            MessageService.ReplyMessage(messageInfo, 'Iemand anders heeft de puzzel al opgelost. Je bent net te laat!');
            return;
        }

        const solution = puzzle.GetSolution().replaceAll('\n', '')
        if (solution == content.trim().replaceAll('\n', '')) {
            await this.OnSolvingPuzzle(messageInfo, puzzle, character);
            return;
        }

        MessageService.ReplyMessage(messageInfo, PuzzleService.GetPuzzleWrong(puzzle), false, true);
        LogService.Log(player, puzzle.GetId(), LogType.PuzzleWrong, `${player.GetDiscordName()} geeft het foute antwoord op een puzzel.`);
    }

    private static async OnSolvingPuzzle(messageInfo: IMessageInfo, puzzle: Puzzle, character: Character) {
        await puzzle.Solve(character);
        await MessageService.ReplyMessage(messageInfo, PuzzleService.GetPuzzleOutro(puzzle), true, true, PuzzleEmbeds.GetPuzzleSolvedEmbed(puzzle));
        await Utils.Sleep(2)
        await CampaignManager.OnCompletingSession()
        LogService.Log(character.GetPlayer(), puzzle.GetId(), LogType.PuzzleSolved, `${character.GetPlayer().GetDiscordName()} lost een puzzel op.`);
    }

    private static async ReplyNoPuzzle(messageInfo: IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Er is geen puzzel op het moment.', false);
    }
}