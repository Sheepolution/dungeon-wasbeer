import PlayerModel from '../Models/PlayerModel';
import { Utils } from '../Utils/Utils';
import PlayerCard from './PlayerCard';
import Character from './Character';
import { ClassType } from '../Enums/ClassType';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { ShoeState } from '../Enums/ShoeState';

export default class Player {

    private static readonly digCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.DIG_COOLDOWN_KEY;
    private static readonly digCooldownWaitPrefix = RedisConstants.REDIS_KEY + RedisConstants.DIG_COOLDOWN_WAIT_KEY;

    protected id:string;
    private discordId:string;
    private messagePoints:number;
    private playerCards:Array<PlayerCard>;
    private cardPieces:number;
    private lastActiveDate:string;
    private discordName:string;
    private character?:Character;
    private shoeState:ShoeState;

    public static async UPDATE_SHOES() {
        await PlayerModel.query()
            .whereNot('shoe_state', ShoeState.Set)
            .patch({shoe_state: ShoeState.Empty});

        await PlayerModel.query()
            .where('shoe_state', ShoeState.Set)
            .patch({shoe_state: ShoeState.Filled});
    }

    public async GET(id:string, isUuid?:boolean) {
        var models:PlayerModel;

        if (isUuid) {
            models = await PlayerModel.query().findById(id);
            if (models == null) {
                return false;
            }
            await this.ApplyModel(models);
        } else {
            models = await PlayerModel.query().where('discord_id', id).where('active', 1);
            if (models.length == 0) {
                return false;
            }

            await this.ApplyModel(models[0]);
        }

        return true;
    }

    public async POST(discordId:string, discordDisplayName:string) {
        const model = await PlayerModel.New(discordId, discordDisplayName);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any) {
        await PlayerModel.query()
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:PlayerModel) {
        this.id = model.id;
        this.discordId = model.discord_id;
        this.discordName = model.discord_name;
        this.messagePoints = model.message_points;
        this.playerCards = await model.GetPlayerCards(this);
        this.cardPieces = model.card_pieces;
        this.shoeState = model.GetShoeState();

        const character = await model.GetCharacter(this);
        if (character) {
            this.character = character;
        }
    }

    public GetId() {
        return this.id;
    }

    public GetDiscordId() {
        return this.discordId
    }

    public GetMention() {
        return `<@${this.discordId}>`;
    }

    public GetDiscordName() {
        return this.discordName;
    }

    public UpdateLastActive() {
        this.lastActiveDate = Utils.GetNowString();
        this.UPDATE({active_date: this.lastActiveDate})
    }

    public UpdateDiscordName(discordDisplayName:string) {
        if (this.discordName == discordDisplayName) { return; }
        this.discordName = discordDisplayName;
        this.UPDATE({discord_name: discordDisplayName});
    }

    public GetCards() {
        return this.playerCards;
    }

    public GetShoeState() {
        return this.shoeState;
    }

    public async SetShoeState(shoeState:ShoeState) {
        this.shoeState = shoeState;
        await this.UPDATE({ shoe_state: this.shoeState });
    }

    public FindCard(name:string) {
        const cards = this.playerCards.filter(c => c.GetCard().GetName().toLowerCase().includes(name.toLowerCase()));
        if (cards.length == 0) {
            return;
        }

        cards.sort((a, b) => a.GetCard().GetName().length - b.GetCard().GetName().length);

        return cards[0];
    }

    public RemoveCard(playerCard:PlayerCard) {
        for (let i = 0; i < this.playerCards.length; i++) {
            if (this.playerCards[i] == playerCard) {
                this.playerCards.splice(i, 1);
                break;
            }
        }
    }

    public GiveCard(playerCard:PlayerCard) {
        this.playerCards.push(playerCard);
    }

    public async HasDigCooldown() {
        return await Redis.ttl(Player.digCooldownPrefix + this.GetId()) > 0;
    }

    public async SetDigCooldown() {
        await Redis.set(Player.digCooldownWaitPrefix + this.GetId(),
            '1', 'EX',
            Utils.GetMinutesInSeconds(SettingsConstants.CARD_PIECES_DIG_COOLDOWN_MINUTES_MIN));

        await Redis.set(Player.digCooldownPrefix + this.GetId(),
            '1', 'EX',
            Utils.GetMinutesInSeconds(
                Utils.Random(
                    SettingsConstants.CARD_PIECES_DIG_COOLDOWN_MINUTES_MIN,
                    SettingsConstants.CARD_PIECES_DIG_COOLDOWN_MINUTES_MAX, true)));
    }

    public async HasDigWaitCooldown() {
        return await Redis.ttl(Player.digCooldownWaitPrefix + this.GetId()) > 0;
    }

    public GetCardPieces() {
        return this.cardPieces;
    }

    public async AddCardPiece() {
        this.cardPieces += 1;
        this.UPDATE({card_pieces: this.cardPieces});
    }

    public async TakeCardPiece() {
        if (this.cardPieces > 0) {
            this.cardPieces -= 1;
            this.UPDATE({card_pieces: this.cardPieces});
        }
    }

    public async TakeAllCardPieces() {
        if (this.cardPieces > 0) {
            this.cardPieces = 0;
            this.UPDATE({card_pieces: this.cardPieces});
        }
    }

    public AddMessagePoint() {
        this.messagePoints += 1;
        this.UPDATE({message_points: this.messagePoints});
    }

    public GetMessagePoints() {
        return this.messagePoints;
    }

    public async CreateCharacter(classType:ClassType) {
        const character = new Character(this);
        await character.POST(classType);

        this.character = character;
        await this.UPDATE({
            character_id: character.GetId()
        })

        return character;
    }

    public async RemoveCharacter() {
        this.character = undefined;
        await this.UPDATE({
            character_id: null
        })
    }

    public GetCharacter() {
        return this.character;
    }
}