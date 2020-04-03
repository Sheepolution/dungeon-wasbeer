import Constants from "../Constants";
import { Utils } from "../Utils";
import PlayerCardModel from "./PlayerCardModel";
import PlayerCard from "../PlayerCard";
const uuidv4 = require("uuid/v4");

const { Model } = require('objection');

export default class PlayerModel extends Model {

    static get tableName() {
        return 'players';
    }

    public static async New(discord_id:string) {
        const player_id = Utils.UUID();

        const player = await PlayerModel.query()
        .insert({
            id:player_id,
            discord_id: discord_id,
            active: 1,
            gold: 0,
            message_points: 0
        })

        return player;
    }

    public async GetPlayerCards() {
        const player_card_models = await this.$relatedQuery('player_cards');
        const player_cards_ret = new Array<PlayerCard>();

        for (let i = 0; i < player_card_models.length; i++) {
            const player_card:PlayerCard = new PlayerCard();
            await player_card.ApplyModel(player_card_models[i])
            player_cards_ret.push(player_card)
        }
        
        return player_cards_ret;
    }

    static relationMappings = {
        player_cards: {
            relation: Model.HasManyRelation,
            modelClass: PlayerCardModel,
            join: {
                from: 'players.id',
                to: 'player_cards.player_id'
            }
        }
    }
}