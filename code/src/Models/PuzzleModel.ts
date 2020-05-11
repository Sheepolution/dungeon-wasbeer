import { Utils } from '../Utils/Utils';
import CharacterModel from '../Models/CharacterModel';
import { PuzzleType } from '../Enums/PuzzleType';
import Character from '../Objects/Character';
const { Model } = require('objection');

export default class PuzzleModel extends Model {

    static get tableName() {
        return 'puzzles';
    }

    static relationMappings = {
        solver: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'puzzles.solver_id',
                to: 'characters.id',
            }
        }
    }

    public static async New(content:string, solution:string, type:PuzzleType) {
        const puzzleId = Utils.UUID();

        const battle = await PuzzleModel.query()
            .insert({
                id:puzzleId,
                active: true,
                content: content,
                solution: solution,
                type: type,
                creation_date: Utils.GetNowString(),
                solving_date: null,
                solver_id: null,
            })

        return battle;
    }

    public async GetSolver() {
        if (this.solver_id == null) {
            return undefined;
        }

        const character = new Character();
        character.ApplyModel(await this.$relatedQuery('solver'));
        return character;
    }

    public GetPuzzleType() {
        return (<any>PuzzleType)[this.type];
    }
}