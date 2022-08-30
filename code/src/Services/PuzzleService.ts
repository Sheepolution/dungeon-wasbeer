import Sudoku from '../Providers/Sudoku';
import Puzzle from '../Objects/Puzzle';
import { PuzzleType } from '../Enums/PuzzleType';
import PuzzleConstants from '../Constants/PuzzleConstants';

export default class PuzzleService {

    public static GetPuzzleAndSolution() {
        const puzzleAndSolution: any = {};

        const sudoku = Sudoku.GetSudokuStrings();
        const puzzle = sudoku[0].split('');
        const solution = sudoku[1].split('');

        var puzzleString = '+-----+-----+-----+\n';
        var solutionString = puzzleString;

        for (let i = 0; i < puzzle.length; i++) {
            const n = puzzle[i] == '0' ? '.' : puzzle[i];
            const ns = solution[i];

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

    public static GetChestPuzzleAndSolution() {
        const puzzleAndSolution: any = {};

        var puzzleString = `1. Hoe heet het 5e monster waar jullie tegen hebben gevochten?

2. Hoe heet het monster dat als eerste een character heeft gedood?

3. Hoe heet het monster dat health absorbeert?

4. Hoe heet het monster dat sterker wordt hoe minder health het heeft?

5. Hoe heet het monster met de aanval beschrijving "Het monster valt je meerdere keren aan, eerst met zijn staart en dan zijn klauwen."?

6. Hoe heet het monster met 16 strength en 6 attack?

7. Hoe heet het monster met 8000 health?

8. Hoe heet het monster dat er uit ziet als een zwart paard met vlammen?

9. Hoe heet het eerste monster met 3 sterren? 

10. Hoe heet het monster dat twee characters heeft gedood?`;

        var solutionString = `Goblin
Ettercap
Shambling Mound
Hydra
Manticore
Owlbear
Beholder
Nightmare
Cyclops
Cloud Giant`;

        puzzleAndSolution.puzzle = puzzleString;
        puzzleAndSolution.solution = solutionString;

        return puzzleAndSolution;
    }

    public static GetRandomPuzzleType() {
        return [PuzzleType.Gate, PuzzleType.Merchant, PuzzleType.Tavern, PuzzleType.Village].randomChoice();
    }

    public static GetPuzzleIntro(puzzle: Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).INTRO;
    }

    public static GetPuzzleOutro(puzzle: Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).OUTRO;
    }

    public static GetPuzzleImage(puzzle: Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).IMAGE;
    }

    public static GetPuzzleWrong(puzzle: Puzzle) {
        return this.GetPuzzleDescriptionsByType(puzzle.GetPuzzleType()).WRONG;
    }

    private static GetPuzzleDescriptionsByType(puzzleType: PuzzleType) {
        switch (puzzleType) {
            case PuzzleType.Gate:
                return PuzzleConstants.DESCRIPTIONS.GATE;
            case PuzzleType.Merchant:
                return PuzzleConstants.DESCRIPTIONS.MERCHANT;
            case PuzzleType.Tavern:
                return PuzzleConstants.DESCRIPTIONS.TAVERN;
            case PuzzleType.Village:
                return PuzzleConstants.DESCRIPTIONS.VILLAGE;
            case PuzzleType.Chest:
                return PuzzleConstants.DESCRIPTIONS.CHEST;
        }
    }
}