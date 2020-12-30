import CharacterService from '../Services/CharacterService';
import Player from '../Objects/Player';
import { CharacterStatus } from '../Enums/CharacterStatus';
import { ClassType } from '../Enums/ClassType';
import { Utils } from '../Utils/Utils';

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
                inspiration: 0,
                avatar_url: null,
                lore: null,
                regenerated: 0,
                slept: 0,
                max_health: stats.health,
                reward_points: 0,
                reward_points_total: 0,
                reward_battle_id: null,
                attack_description: null,
                attack_crit_description: null,
                heal_description: null,
                heal_fail_description: null,
                inspire_description: null,
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