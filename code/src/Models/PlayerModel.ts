import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import PlayerCardModel from './PlayerCardModel';
import { Utils } from '../Utils/Utils';
import CharacterModel from './CharacterModel';
import Character from '../Objects/Character';
import { ShoeState } from '../Enums/ShoeState';

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
        characters: {
            relation: Model.BelongsToOneRelation,
            modelClass: CharacterModel,
            join: {
                from: 'players.character_id',
                to: 'characters.id',
            }
        },
    };

    public static async New(discordId: string, discordDisplayName: string) {
        const playerId = Utils.UUID();

        const player = await PlayerModel.query()
            .insert({
                id: playerId,
                discord_id: discordId,
                active: true,
                card_pieces: 0,
                message_points: 0,
                discord_name: discordDisplayName,
                character_id: null,
                shoe_state: ShoeState.Emptied,
            });

        return player;
    }

    public static async GetAll() {
        const playerModels = await PlayerModel.query();
        return playerModels;
    }

    public async GetPlayerCards(player: Player) {
        const playerCardModels = await this.$relatedQuery('player_cards');
        const playerCardsRet = new Array<PlayerCard>();

        for (let i = 0; i < playerCardModels.length; i++) {
            const playerCard: PlayerCard = new PlayerCard(player);
            await playerCard.ApplyModel(playerCardModels[i]);
            playerCardsRet.push(playerCard);
        }

        return playerCardsRet;
    }

    public async GetCharacter(player: Player) {
        if (this.character_id == null) {
            return undefined;
        }

        const character = new Character(player);
        character.ApplyModel(await this.$relatedQuery('characters'));
        return character;
    }

    public GetShoeState() {
        switch (this.shoe_state) {
            case '00': return ShoeState.Empty;
            case '01': return ShoeState.Set;
            case '10': return ShoeState.Filled;
            case '11': return ShoeState.Emptied;
            default: return ShoeState.Empty;
        }
    }
}