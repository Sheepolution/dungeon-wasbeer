import Sudoku from '../Providers/Sudoku';
import Puzzle from '../Objects/Puzzle';
import { PuzzleType } from '../Enums/PuzzleType';
import PuzzleConstants from '../Constants/PuzzleConstants';

export default class PuzzleService {

    public static GetPuzzleAndSolution() {
        const puzzleAndSolution:any = {};

        const sudoku = Sudoku.GetSudokuStrings();
        const puzzle = sudoku[0].split('');
        const solution = sudoku[1].split('');

        var puzzleString = '+-----+-----+-----+\n';
        var solutionString = puzzleString;

        for (let i = 0; i < puzzle.length; i++) {
            const n = puzzle[i] ? puzzle[i] + 1 : '.';
            const ns = solution[i] + 1;

            if (i > 0 && i % 27 == 0) {
                puzzleString += '|\n+-----+-----+-----+\n|';
                solutionString += '|\n+-----+-----+-----+\n|';
            } else if (i > 0 && i % 9 == 0) {
                puzzleString += '|\n|';
                solutionString += '|\n|';
            } else if (i % 3 == 0) {
                puzzleString += '|';
                solutionString += '|';
            } else {
                puzzleString += ' ';
                solutionString += ' ';
            }

            puzzleString += n;
            solutionString += ns;
        }

        puzzleString += '|\n+-----+-----+-----+';
        solutionString += '|\n+-----+-----+-----+';

        puzzleAndSolution.puzzle = puzzleString;
        puzzleAndSolution.solution = solutionString;

        return puzzleAndSolution;
    }

    public static GetRandomPuzzleType() {
        return [PuzzleType.Gate, PuzzleType.Merchant, PuzzleType.Tavern, PuzzleType.Village].randomChoice();
    }

    public static GetPuzzleIntro(puzzle:Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).INTRO;
    }

    public static GetPuzzleOutro(puzzle:Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).OUTRO;
    }

    public static GetPuzzleImage(puzzle:Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).IMAGE;
    }

    public static GetPuzzleWrong(puzzle:Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).WRONG;
    }

    private static GetPuzzleDescriptionsByType(puzzleType:PuzzleType) {
        switch (puzzleType) {
            case PuzzleType.Gate:
                return PuzzleConstants.DESCRIPTIONS.GATE;
            case PuzzleType.Merchant:
                return PuzzleConstants.DESCRIPTIONS.MERCHANT;
            case PuzzleType.Tavern:
                return PuzzleConstants.DESCRIPTIONS.TAVERN;
            case PuzzleType.Village:
                return PuzzleConstants.DESCRIPTIONS.VILLAGE;
        }
    }
}