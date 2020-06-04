import Character from './Character';
import { PuzzleType } from '../Enums/PuzzleType';
import { Utils } from '../Utils/Utils';
import PuzzleModel from '../Models/PuzzleModel';

export default class Puzzle {

    protected id:string;
    private active:boolean;
    private content:string;
    private solution:string;
    private type:PuzzleType;
    private creationDate:Date;
    private solvingDate?:Date;
    private solver?:Character;

    public static async FIND_SOLVED_BY_CHARACTER(character:Character) {
        const puzzles = await PuzzleModel.query().where('solver_id', character.GetId()).count('id');
        return puzzles[0].count || 0;
    }

    public async GET(id:string) {
        const model:PuzzleModel = await PuzzleModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(content:string, solution:string, puzzleType:PuzzleType) {
        const model = await PuzzleModel.New(content, solution, puzzleType);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await PuzzleModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:PuzzleModel) {
        this.id = model.id;
        this.active = model.active;
        this.content = model.content;
        this.solution = model.solution;
        this.type = model.GetPuzzleType();
        this.creationDate = model.creation_date;
        this.solvingDate = model.solving_date ? new Date(model.solving_date) : undefined;
        this.solver = await model.GetSolver()
    }

    public GetId() {
        return this.id;
    }

    public GetContent() {
        return this.content;
    }

    public GetSolution() {
        return this.solution;
    }

    public GetPuzzleType() {
        return this.type;
    }

    public IsSolved() {
        return this.solver != null;
    }

    public async Solve(character:Character) {
        this.solver = character;
        this.solvingDate = Utils.GetNow();
        this.active = false;

        await this.UPDATE({
            active: false,
            solver_id: character.GetId(),
            solving_date: Utils.GetNowString(),
        })
    }
}