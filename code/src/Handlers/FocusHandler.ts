import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import PuzzleEmbeds from '../Embeds/PuzzleEmbeds';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Redis } from '../Providers/Redis';
import MessageService from '../Services/MessageService';
import PuzzleService from '../Services/PuzzleService';
import { Utils } from '../Utils/Utils';

export default class FocusHandler {

    private static readonly focusPuzzlePrefix = RedisConstants.REDIS_KEY + RedisConstants.FOCUS_PUZZLE_KEY;

    public static OnCommand(messageInfo: IMessageInfo, command: string) {
        switch (command) {
            case 'kantoor':
            case 'concentreren':
            case 'focus':
                this.OnFocus(messageInfo);
                break;
            default:
                return false;
        }

        return true;
    }

    public static OnFocusCommand(messageInfo: IMessageInfo, command: string, content: string) {
        switch (command) {
            case 'a':
            case 'antwoord':
            case 'antwoorden':
            case 'solved':
            case 'solution':
                this.OnSolution(messageInfo, content);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async OnFocus(messageInfo: IMessageInfo) {
        const puzzle = PuzzleService.GetPuzzleAndSolution();
        const message = await MessageService.SendMessageToDM(messageInfo, '', PuzzleEmbeds.GetFocusSudokuEmbed(puzzle.puzzle));

        if (message == null) {
            await MessageService.ReplyMessage(messageInfo, 'Ik kan je niet DMen! Heb je misschien zo\'n instelling uitstaan?', false, true);
            return;
        }

        await Redis.set(`${this.focusPuzzlePrefix}${messageInfo.member.id}`, puzzle.solution);

        await MessageService.ReplyMessage(messageInfo, 'Zo, dus jij neemt even een pauze van de gezelligheid? Succes met waar je ook mee bezig bent, en we hopen je snel terug te zien! <:MamHeart:672155278828896266>', true, true);
        await Utils.Sleep(10);
        messageInfo.member.roles.add(SettingsConstants.FOCUS_ROLE_ID);
    }

    private static async OnSolution(messageInfo: IMessageInfo, solved: string) {
        const solution = await Redis.get(`${this.focusPuzzlePrefix}${messageInfo.member.id}`);
        if (!solution || solution == '' || solution.trim() == solved) {
            await messageInfo.member.roles.remove(SettingsConstants.FOCUS_ROLE_ID);
            await Redis.del(`${this.focusPuzzlePrefix}${messageInfo.member.id}`);
        } else {
            const message = await MessageService.ReplyMessage(messageInfo, 'Incorrect! Misschien moet je zo\'n sudoku solver gebruiken.', false, true);
            await Utils.Sleep(5);
            message?.delete();
        }

        await Utils.Sleep(1);

        if (messageInfo.message && messageInfo.message?.deletable) {
            try {
                messageInfo.message.delete();
            } catch (error) {
                // They already deleted it. Whatever.
            }
        }
    }
}