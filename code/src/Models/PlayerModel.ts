import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import PlayerCardModel from './PlayerCardModel';
import { Utils } from '../Utils/Utils';
import { ClassType } from '../Enums/ClassType';

const { Model } = require('objection');

export default class PlayerModel extends Model {

    static get tableName() {
        return 'players';
    }

    static relationMappings = {
        player_cards: {
            relation: Model.HasManyRelation,
            modelClass: PlayerCardModel,
            join: {
                from: 'players.id',
                to: 'player_cards.player_id',
            },
        },
    }

    public static async New(discordId:string, discordDisplayName:string) {
        const playerId = Utils.UUID();

        const player = await PlayerModel.query()
            .insert({
                id:playerId,
                discord_id: discordId,
                active: 1,
                gold: 0,
                message_points: 0,
                discord_name: discordDisplayName,
            })

        return player;
    }

    public async GetPlayerCards(player:Player) {
        const playerCardModels = await this.$relatedQuery('player_cards');
        const playerCardsRet = new Array<PlayerCard>();

        for (let i = 0; i < playerCardModels.length; i++) {
            const playerCard:PlayerCard = new PlayerCard(player);
            await playerCard.ApplyModel(playerCardModels[i])
            playerCardsRet.push(playerCard)
        }

        return playerCardsRet;
    }

    public GetClassType() {
        return <ClassType> this.class;
    }
}