import { ClassType } from '../Enums/ClassType';
import { CharacterStatus } from '../Enums/CharacterStatus';
import Player from '../Objects/Player';
import { Utils } from '../Utils/Utils';
import ClassService from '../Services/ClassService';

const { Model } = require('objection');

export default class CharacterModel extends Model {

    static get tableName() {
        return 'characters';
    }

    // static relationMappings = {
    //     monsters: {
    //         relation: Model.BelongsToOneRelation,
    //         modelClass: MonsterModel,
    //         join: {
    //             from: 'battles.monster_id',
    //             to: 'monsters.id',
    //         }
    //     }
    // }

    public static async New(player:Player, classType:ClassType) {
        const characterId = Utils.UUID();

        const stats = ClassService.GetClassModifierStats(classType)

        const character = await CharacterModel.query()
            .insert({
                id:characterId,
                player_id: player.GetId(),
                status: CharacterStatus.Active,
                class: classType,
                xp: 0,
                level: 1,
                health: stats.health,
                name: `${player.GetDiscordName()} de ${classType}`,
                equipment: '',
                born_date: Utils.GetNowString(),
                death_date: null,
            })

        return character;
    }

    public GetClassType() {
        return (<any>ClassType)[this.class];
    }

    public GetStatus() {
        return (<any>CharacterStatus)[this.status];
    }
}