import PlayerModel from '../Models/PlayerModel';
import { Utils } from '../Utils/Utils';
import { ClassType } from '../Enums/ClassType';
import PlayerCard from './PlayerCard';
import IModifierStats from '../Interfaces/IModifierStats';
import ClassService from '../Services/ClassService';
import Card from './Card';

export default class Player {

    protected id:string;
    private discordId:string;
    private gold:string;
    private messagePoints:number;
    private playerCards:Array<PlayerCard>;
    private lastActiveDate:string;
    private discordName:string;
    private classType:ClassType;
    private xp:number;
    private level:number;
    private cardSlots:Array<Card>;
    private classModifierStats:IModifierStats;
    private cardModifierStats:IModifierStats;
    private fullModifierStats:IModifierStats;
    private currentHealth:number;
    private maxHealth:number;

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
        this.gold = model.gold;
        this.messagePoints = model.message_points;
        this.playerCards = await model.GetPlayerCards(this);
        this.classType = model.GetClassType();
        if (this.classType) {
            this.xp = model.xp;
            this.level = model.level;
            this.cardSlots = this.playerCards.filter(pc => pc.IsInSlot()).map(c => c.GetCard());
            this.classModifierStats = ClassService.GetClassModifierStats(this.classType);
            this.cardModifierStats = this.CalculateCardModifierStats();
            this.fullModifierStats = this.CalculateFullModifierStats();
            this.currentHealth = model.health;
            this.maxHealth = this.fullModifierStats.health;
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

    public AddMessagePoint() {
        this.messagePoints += 1;
        this.UPDATE({message_points: this.messagePoints});
    }

    public GetMessagePoints() {
        return this.messagePoints;
    }

    public SetClass(classType:ClassType) {
        this.classType = classType;
        this.UPDATE({class: classType})
    }

    public GetClassName() {
        return this.classType.toString();
    }

    public GetCurrentHealth() {
        return this.currentHealth;
    }

    public GetMaxHealth() {
        return this.maxHealth;
    }

    public GetLevel() {
        return this.level;
    }

    public GetXP() {
        return this.xp;
    }

    public GetTotalCardSlots() {
        return this.cardSlots.length - this.cardSlots.length + 3;
    }

    public GetCardSlots() {
        return this.cardSlots;
    }

    public HasAvailableCardSlot() {
        return this.cardSlots.length < 3;
    }

    public async AddCardToSlot(playerCard:PlayerCard) {
        await playerCard.SetSlotted(true);
        this.cardSlots.push(playerCard.GetCard());
        this.UpdateFullModifierStats();
    }

    public async RemoveCardFromSlot(playerCard:PlayerCard) {
        await playerCard.SetSlotted(false);
        const cardId = playerCard.GetCard().GetId();
        const index = this.cardSlots.findIndex(c => c.GetId() == cardId);
        this.cardSlots.splice(index, 1);
        this.UpdateFullModifierStats();
    }

    public GetClassModifierStats() {
        return this.classModifierStats;
    }

    public GetCardModifierStats() {
        return this.cardModifierStats;
    }

    public GetFullModifierStats() {
        return this.fullModifierStats;
    }

    private CalculateCardModifierStats() {
        var cardModifierStats = ClassService.GetEmptyModifierStats();

        for (const card of this.cardSlots) {
            cardModifierStats = ClassService.GetSummedUpModifierStats(cardModifierStats, card.GetModifierStats());
        }

        return cardModifierStats
    }

    private CalculateFullModifierStats() {
        return ClassService.GetSummedUpModifierStats(this.classModifierStats, this.cardModifierStats)
    }

    private UpdateFullModifierStats() {
        this.classModifierStats = ClassService.GetClassModifierStats(this.classType);
        this.cardModifierStats = this.CalculateCardModifierStats();
        this.fullModifierStats = this.CalculateFullModifierStats();
    }
}