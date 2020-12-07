import { PuzzleType } from '../Enums/PuzzleType';
import Puzzle from '../Objects/Puzzle';
import PuzzleService from '../Services/PuzzleService';

export default class PuzzleManager {

    public static async GetRandomPuzzle() {
        const puzzle = new Puzzle();
        const sudoku = PuzzleService.GetPuzzleAndSolution();
        await puzzle.POST(sudoku.puzzle, sudoku.solution, PuzzleService.GetRandomPuzzleType());
        return puzzle;
    }

    public static async GetChestPuzzle() {
        const puzzle = new Puzzle();
        const questions = PuzzleService.GetChestPuzzleAndSolution();
        await puzzle.POST(questions.puzzle, questions.solution, PuzzleType.Chest);
        return puzzle;
    }
}