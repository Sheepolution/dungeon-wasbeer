import Sudoku from '../Providers/Sudoku';

export default class PuzzleService {

    public static GetPuzzleAndSolution() {
        const puzzleAndSolution:any = {};

        const puzzle = Sudoku.GetPuzzle();
        const solution = Sudoku.GetPuzzleSolution(puzzle);

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
}