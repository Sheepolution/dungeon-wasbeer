import { CharacterStatus } from '../Enums/CharacterStatus';
import { ClassType } from '../Enums/ClassType';
import IModifierStats from '../Interfaces/IModifierStats';
import Player from './Player';
import Card from './Card';
import CharacterModel from '../Models/CharacterModel';
import PlayerCard from './PlayerCard';
import Attack from './Attack';
import PlayerManager from '../Managers/PlayerManager';
import { Utils } from '../Utils/Utils';
import CharacterService from '../Services/CharacterService';
import CharacterConstants from '../Constants/CharacterConstants';
import Heal from './Heal';

export default class Character {

    protected id:string;
    private player:Player;
    private status:CharacterStatus;
    private classType:ClassType;
    private xp:number;
    private level:number;
    private classModifierStats:IModifierStats;
    private cardModifierStats:IModifierStats;
    private fullModifierStats:IModifierStats;
    private currentHealth:number;
    private maxHealth:number;
    private name:number;
    private equipment:Array<Card>;
    private bornDate:Date;
    private deathDate?:Date;
    private isSorcerer:boolean;
    private inBattle:boolean;

    constructor(player?:Player) {
        if (player) {
            this.player = player;
        }
    }

    public static async INCREASE_XP(amount:any, id:string, trx?:any) {
        await CharacterModel.query(trx)
            .where({id: id, status: '01'})
            .increment('xp', amount);
    }

    public async GET(id:string) {
        const model:CharacterModel = await CharacterModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(classType:ClassType) {
        const model = await CharacterModel.New(this.player, classType);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data:any, trx?:any) {
        await CharacterModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:CharacterModel) {
        this.id = model.id;
        this.player = this.player || await PlayerManager.GetPlayerById(model.player_id);
        this.status = model.GetStatus()
        this.classType = model.GetClassType();
        this.xp = model.xp;
        this.level = model.level;
        this.name = model.name;
        this.equipment = this.player.GetCards().filter(pc => pc.IsEquipped()).map(c => c.GetCard());
        this.classModifierStats = CharacterService.GetClassModifierStats(this.classType);
        this.cardModifierStats = this.CalculateCardModifierStats();
        this.fullModifierStats = this.CalculateFullModifierStats();
        this.currentHealth = model.health;
        this.maxHealth = this.fullModifierStats.health;
        this.bornDate = new Date(model.born_date);
        this.deathDate = model.death_date ? new Date(model.death_date) : undefined;
        this.isSorcerer = this.classType == ClassType.Bard || this.classType == ClassType.Cleric || this.classType == ClassType.Wizard;
    }

    public GetId() {
        return this.id;
    }

    public GetPlayer() {
        return this.player;
    }

    public GetClass() {
        return this.classType;
    }

    public GetClassName() {
        return this.classType?.toString();
    }

    public GetCurrentHealth() {
        return this.currentHealth;
    }

    public GetMaxHealth() {
        return this.maxHealth;
    }

    public IsFullHealth() {
        return this.currentHealth == this.maxHealth;
    }

    public GetLevel() {
        return this.level;
    }

    public GetXP() {
        return this.xp;
    }

    public GetName() {
        return this.name;
    }

    public async Kill() {
        this.deathDate = Utils.GetNow();
        this.status = CharacterStatus.Dead;
        await this.UPDATE({
            death_date: Utils.GetNowString(),
            status: this.status,
        })

        await this.player.RemoveCharacter();

        for (const card of this.player.GetCards()) {
            if (card.IsEquipped()) {
                await card.RemoveOne();
            }
        }
    }

    public async Stop() {
        this.status = CharacterStatus.Stopped;
        await this.UPDATE({
            status: this.status,
        })

        await this.player.RemoveCharacter();

        for (const card of this.player.GetCards()) {
            if (card.IsEquipped()) {
                await card.SetEquipped(false);
            }
        }
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

    public GetBornDateString() {
        return this.bornDate.toISOString().slice(0, 10);
    }

    public GetDeathDateString() {
        return this.deathDate?.toISOString().slice(0, 10);
    }

    public IsSorcerer() {
        return this.isSorcerer;
    }

    public SetInBattle(inBattle:boolean) {
        this.inBattle = inBattle;
    }

    public GetInBattle() {
        return this.inBattle;
    }

    public GetAttackRoll() {
        return this.fullModifierStats.attack;
    }

    public GetAttackStrength(crit?:boolean) {
        const fullModifierStats = this.GetFullModifierStats();

        if (this.isSorcerer) {
            return fullModifierStats.spell * (crit ? 2 : 1);
        }

        return fullModifierStats.strength * (crit ? 2 : 1);
    }

    public GetAttackName() {
        return this.isSorcerer ? 'Spell attack' : 'Strength';
    }

    public async ReceiveDamage(damage:number) {
        const damageAfterArmor = this.CalculateDamageWithArmor(damage);
        this.currentHealth = Math.max(0, this.currentHealth - damageAfterArmor);
        await this.UPDATE({health: this.currentHealth})
        return damageAfterArmor;
    }

    public IsDead() {
        return this.currentHealth <= 0;
    }

    public CalculateDamageWithArmor(damage:number) {
        return Math.floor(damage * (1 - Math.min(50, this.fullModifierStats.armor)/100));
    }

    public GetMaxBattleCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity;
    }

    public async IncreaseXP(amount:number, updateData:boolean = true) {
        this.xp += amount;
        if (!updateData) {
            this.UPDATE({ xp: this.xp })
        }
    }

    public async IncreaseXPFromMessage() {
        this.xp += 1;
        this.UPDATE({ xp: this.xp })
    }

    public CanHeal() {
        return this.classType == ClassType.Cleric || this.classType == ClassType.Paladin;
    }

    public GetMaxHealingCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity;
    }

    public GetHealingBasedOnRoll(roll:number) {
        if (roll == 1) {
            return 0;
        }

        return Math.floor((roll/10) * this.fullModifierStats.healing);
    }

    public async GetHealthFromMessage() {
        if (this.IsFullHealth()) { return false; }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + CharacterConstants.HEAL_MESSAGE_AMOUNT);
        this.UPDATE({ health: this.currentHealth })
        return true;
    }

    public async GetHealthFromHealing(amount:number) {
        if (this.IsFullHealth()) { return false; }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.UPDATE({ health: this.currentHealth })
        return true;
    }

    public GetTotalEquipmentSpace() {
        return this.equipment.length - this.equipment.length + 3;
    }

    public GetEquipment() {
        return this.equipment;
    }

    public HasEquipmentSpace() {
        return this.equipment.length < 3;
    }

    public async Equip(playerCard:PlayerCard) {
        await playerCard.SetEquipped(true);
        this.equipment.push(playerCard.GetCard());
        this.UpdateFullModifierStats();
        this.UPDATE({
            equipment: this.equipment.join(',')
        })
    }

    public async Unequip(playerCard:PlayerCard) {
        await playerCard.SetEquipped(false);
        const cardId = playerCard.GetCard().GetId();
        const index = this.equipment.findIndex(c => c.GetId() == cardId);
        this.equipment.splice(index, 1);
        this.UpdateFullModifierStats();
        this.UPDATE({
            equipment: this.equipment.map(c => c.GetId()).join(',')
        })
    }

    public async GetBattles() {
        return await Attack.FIND_BATTLES_BY_CHARACTER(this);
    }

    public async GetVictories() {
        return await Attack.FIND_VICTORIES_BY_CHARACTER(this);
    }

    public async GetLosses() {
        return await Attack.FIND_LOSSES_BY_CHARACTER(this);
    }

    public async GetTotalDamageGiven() {
        return await Attack.FIND_TOTAL_DAMAGE_GIVEN(this);
    }

    public async GetTotalDamageTaken() {
        return await Attack.FIND_TOTAL_DAMAGE_TAKEN(this);
    }

    public async GetTotalHealingDone() {
        return await Heal.FIND_HEALED_BY_CHARACTER(this);
    }

    public GetRandomAttackDescription(crit?:boolean) {
        return CharacterService.GetClassAttackDescription(this.classType, crit).randomChoice();
    }

    private CalculateCardModifierStats() {
        var cardModifierStats = CharacterService.GetEmptyModifierStats();

        for (const card of this.equipment) {
            cardModifierStats = card.GetModifierStats();
        }

        return cardModifierStats
    }

    private CalculateFullModifierStats() {
        return CharacterService.GetSummedUpModifierStats(this.classModifierStats, this.cardModifierStats)
    }

    private UpdateFullModifierStats() {
        if (this.classType == null) { return; }
        this.classModifierStats = CharacterService.GetClassModifierStats(this.classType);
        this.cardModifierStats = this.CalculateCardModifierStats();
        this.fullModifierStats = this.CalculateFullModifierStats();
    }
}