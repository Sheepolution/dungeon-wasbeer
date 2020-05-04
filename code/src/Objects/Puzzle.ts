import Character from './Character';
import PuzzleModel from './PuzzleModel';
import { PuzzleType } from '../Enums/PuzzleType';

export default class Puzzle {

    protected id:string;
    private active:boolean;
    private content:string;
    private solution:string;
    private type:PuzzleType;
    private creationDate:Date;
    private solvingDate?:Date;
    private solver?:Character;

    public async GET(id:string) {
        const model:PuzzleModel = await PuzzleModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(content:string, solution:string) {
        const model = await PuzzleModel.New(content, solution, PuzzleType.Sudoku);
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

    public GetPuzzleType() {
        return this.type;
    }
}