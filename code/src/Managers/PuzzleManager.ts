import Puzzle from '../Objects/Puzzle';
import PuzzleService from '../Services/PuzzleService';

export default class PuzzleManager {

    public static async GetRandomPuzzle() {
        const puzzle = new Puzzle();
        const sudoku = PuzzleService.GetPuzzleAndSolution();
        await puzzle.POST(sudoku.puzzle, sudoku.solution);
        return puzzle;
    }
}