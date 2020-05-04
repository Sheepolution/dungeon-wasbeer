const sudoku = require('sudoku');

export default class Sudoku {

    public static GetPuzzle() {
        return sudoku.makepuzzle();
    }

    public static GetPuzzleSolution(puzzle:Array<number>) {
        return sudoku.solvepuzzle(puzzle)
    }

}