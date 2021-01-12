import EmojiConstants from '../Constants/EmojiConstants';
import RedisConstants from '../Constants/RedisConstants';
import PuzzleEmbeds from '../Embeds/PuzzleEmbeds';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Redis } from '../Providers/Redis';
import MessageService from '../Services/MessageService';
import PuzzleService from '../Services/PuzzleService';
import { Utils } from '../Utils/Utils';

export default class SudokuHandler {

    private static readonly sudokuPrefix = `${RedisConstants.REDIS_KEY}${RedisConstants.SUDOKU_KEY}`;
    private static readonly sudokuCooldownPrefix = `${RedisConstants.REDIS_KEY}${RedisConstants.SUDOKU_COOLDOWN_KEY}`;

    public static async OnCommand(messageInfo:IMessageInfo, command:string, content:string) {
        switch (command) {
            case 'sudoku':
            case 's':
                this.OnSudoku(messageInfo);
                break;
            case 'antwoord':
            case 'a':
            case 'solution':
            case 'solve':
                this.OnSolve(messageInfo, content);
                break;
            default:
                return false;
        }

        return true;
    }

    public static async OnSudoku(messageInfo:IMessageInfo) {
        const cooldownKey = `${this.sudokuCooldownPrefix}${messageInfo.member.id}`;
        const cooldown = await Redis.ttl(cooldownKey);
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Rustig aan! Je moet nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} wachten voordat je weer een sudoku mag aanvragen.`, false, false);
            return;
        }

        await Redis.set(cooldownKey, 1, 'EX', 60);

        const sudoku = PuzzleService.GetPuzzleAndSolution();
        const key = `${this.sudokuPrefix}${messageInfo.member.id}`;
        await Redis.hset(key, 'solution', sudoku.solution, 'start', Utils.GetNow().getTime());
        await Redis.expire(key, Utils.GetHoursInSeconds(24));

        const count = sudoku.puzzle.match(/\./g).length;

        MessageService.ReplyMessage(messageInfo, `Start de tijd! Moeilijkheidsgraad: ${count - 44}`, undefined, false, PuzzleEmbeds.GetTrainingSudokuEmbed(sudoku.puzzle));
    }

    public static async OnSolve(messageInfo:IMessageInfo, solved:string) {
        const key = `${this.sudokuPrefix}${messageInfo.member.id}`;
        const data = await Redis.hgetall(key);
        if (data == null || data.solution == null || data.solution == '') {
            return;
        }

        if (data.solution == solved) {
            const diff = Utils.GetNow().getTime() - data.start;
            MessageService.ReplyMessage(messageInfo, `Correct! Je hebt de sudoku opgelost in ${Utils.GetSecondsInMinutesAndSeconds(Math.floor(diff/1000))}.`);
            Redis.del(key);
        } else {
            messageInfo.message?.react(EmojiConstants.STATUS.BAD);
        }
    }
}