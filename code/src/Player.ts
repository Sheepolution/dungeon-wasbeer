import Embedder from "./Embedder";
import PlayerModel from "./models/PlayerModel";
import Constants from "./Constants";
import { Utils } from "./Utils";
import { Util } from "discord.js";
import IMessageInfo from "./IMessageInfo";
import PlayerCard from "./PlayerCard";

export default class Player {

    protected id:string;
    private discordId:string;
    private gold:string;
    private messagePoints:number;
    private playerCards:Array<PlayerCard>;
    private lastActiveDate:string;
    private discordName:string;

    constructor() {
    }

    public async GET(id:string, isUuid?:boolean) {
        var models:PlayerModel;

        if (isUuid) {
            models = await PlayerModel.query().findById(id);
            if (models == null) {
                return false;
            }
            await this.ApplyModel(models);
        }
        else {
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
        this.discordName = discordDisplayName;
        this.UPDATE({discord_name: discordDisplayName});
    }

    // -- Send info methods
    public SendCardList(command:IMessageInfo, animalName:string) {
        // Embedder.SendCardList();
    }

    public GetCards() {
        return this.playerCards;
    }

    public FindCard(name:string) {
        return this.playerCards.find(c => c.GetCard().GetName().toLowerCase().includes(name.toLowerCase()));
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

    public StartTrade(otherPlayer:Player, mine:PlayerCard, theirs:PlayerCard) {
        
    }

    // public SendGold(command:IMessageInfo) {
        // this.inventory.SendGold(command);
    // }

    // public BuyItem(command:IMessageInfo, storeName:string, itemName:any, amount:any) {
    //     const item:(IItem|null) = StoreManager.BuyItem(command, storeName, itemName, amount, this.inventory.GetMoney());
    //     var attempt:any;

    //     // Store takes care of errors regarding incorrect category/item
    //     if (item != null) {
    //         attempt = this.CanBuyItem(item, amount)
    //         if (attempt.success) {
    //             this.OnBuyingItem(command, item, amount);
    //             return;
    //         }
    //         Embedder.SendItemBoughtFailed(command, item, attempt.message);
    //     }
    // }

}