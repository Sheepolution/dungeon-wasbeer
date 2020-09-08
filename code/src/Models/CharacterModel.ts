import { ClassType } from '../Enums/ClassType';
import { CharacterStatus } from '../Enums/CharacterStatus';
import Player from '../Objects/Player';
import { Utils } from '../Utils/Utils';
import CharacterService from '../Services/CharacterService';

const { Model } = require('objection');

export default class CharacterModel extends Model {

    static get tableName() {
        return 'characters';
    }

    public static async New(player:Player, classType:ClassType) {
        const characterId = Utils.UUID();

        const stats = CharacterService.GetClassModifierStats(classType)

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
                inspired: false,
                avatar_url: null,
                lore: null,
                regenerated: 0,
                slept: 0,
                max_health: stats.health,
                reward_points: 0,
                reward_battle_id: null,
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