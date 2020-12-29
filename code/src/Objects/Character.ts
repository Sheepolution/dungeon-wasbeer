import Attack from './Attack';
import BotManager from '../Managers/BotManager';
import Card from './Card';
import CardEmbeds from '../Embeds/CardEmbeds';
import CardManager from '../Managers/CardManager';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterModel from '../Models/CharacterModel';
import CharacterService from '../Services/CharacterService';
import Heal from './Heal';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IModifierStats from '../Interfaces/IModifierStats';
import Log from './Log';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import Player from './Player';
import PlayerCard from './PlayerCard';
import PlayerManager from '../Managers/PlayerManager';
import Puzzle from './Puzzle';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { CharacterStatus } from '../Enums/CharacterStatus';
import { ClassType } from '../Enums/ClassType';
import { LogType } from '../Enums/LogType';
import { Redis } from '../Providers/Redis';
import { Utils } from '../Utils/Utils';

export default class Character {

    private static readonly battleCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.BATTLE_COOLDOWN_KEY;
    private static readonly healingCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.HEALING_COOLDOWN_KEY;
    private static readonly inspiringCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.INSPIRING_COOLDOWN_KEY;

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
    private name:string;
    private equipment:Array<Card>;
    private bornDate:Date;
    private deathDate?:Date;
    private isSorcerer:boolean;
    private inBattle:boolean;
    private isHealing:boolean;
    private beingHealed:boolean;
    private inspired:boolean;
    private avatarUrl:string;
    private lore:string;
    private regenerated:number;
    private slept:number;
    private rewardPoints:number;
    private rewardPointsTotal:number;
    private rewardBattleId:string;
    private attackDescription:string;
    private attackCritDescription:string;
    private healDescription:string;
    private healFailDescription:string;
    private inspireDescription:string;
    private rewardDate?:Date;

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

    public static async RESTORE_HEALTH(id:string, trx:any) {
        await CharacterModel.query(trx)
            .where({id: id, status: '01'})
            .patch({health: 10000});
    }

    public static async GET_LOW_HEALTH_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.id', '=', 'players.character_id')
            .select(CharacterModel.raw('name, health, max_health, discord_name, (health::decimal/max_health::decimal)*100 as percentage'))
            .whereRaw('??<??', ['health', 'max_health'])
            .orderBy('percentage')
            .limit(10);

        return list;
    }

    public static async GET_TOP_XP_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.player_id', '=', 'players.id')
            .select('name', 'xp', 'discord_name')
            .orderBy('xp', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_REWARD_POINTS_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.player_id', '=', 'players.id')
            .select('name', 'reward_points_total', 'discord_name')
            .orderBy('reward_points_total', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_REGENERATED_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.player_id', '=', 'players.id')
            .select('name', 'regenerated', 'discord_name')
            .orderBy('regenerated', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_SLEPT_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.player_id', '=', 'players.id')
            .select('name', 'slept', 'discord_name')
            .orderBy('slept', 'desc')
            .limit(10);

        return list;
    }

    public static async GET_TOP_CARD_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.id', '=', 'players.character_id')
            .join('player_cards', 'players.id', '=', 'player_cards.player_id')
            .select('name', 'discord_name')
            .groupBy('characters.name', 'players.discord_name')
            .count('player_cards.id as cnt')
            .orderBy('cnt', 'desc')
            .limit(10);

        return list;
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
        this.currentHealth = model.health;
        this.equipment = this.player.GetCards().filter(pc => pc.IsEquipped()).map(c => c.GetCard());
        this.inspired = model.inspired;
        this.avatarUrl = model.avatar_url;
        this.lore = model.lore;
        this.regenerated = model.regenerated;
        this.slept = model.slept;
        this.rewardPoints = model.reward_points;
        this.rewardPointsTotal = model.reward_points_total;
        this.rewardBattleId = model.reward_battle_id;
        this.attackDescription = model.attack_description;
        this.attackCritDescription = model.attack_crit_description;
        this.healDescription = model.heal_description;
        this.healFailDescription = model.heal_fail_description;
        this.inspireDescription = model.inspire_description;
        this.rewardDate = model.reward_date ? new Date(model.reward_date) : undefined;
        this.bornDate = new Date(model.born_date);
        this.deathDate = model.death_date ? new Date(model.death_date) : undefined;
        this.isSorcerer = this.classType == ClassType.Bard || this.classType == ClassType.Cleric || this.classType == ClassType.Wizard;
        this.UpdateFullModifierStats();
        await this.CheckLevelUp()
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

    public GetBaseHealth() {
        return this.classModifierStats.health + CharacterConstants.HEALTH_ADDITION_PER_LEVEL[this.level - 1];
    }

    public IsFullHealth() {
        return this.currentHealth >= this.maxHealth;
    }

    public GetRegenerated() {
        return this.regenerated;
    }

    public GetSleepAmount() {
        return this.slept;
    }

    public async RestoreToFullHealth(trx:any) {
        this.currentHealth = this.GetMaxHealth();
        await this.UPDATE({health: this.currentHealth}, trx);
    }

    public GetArmor() {
        return this.fullModifierStats.armor;
    }

    public GetLevel() {
        return this.level;
    }

    public GetXP() {
        return this.xp;
    }

    public GetXPForNextLevel() {
        const nextLevel = this.level == 20 ? 20 : this.level + 1;
        return CharacterConstants.XP_PER_LEVEL[nextLevel - 1];
    }

    public GetName() {
        return this.name;
    }

    public GetAvatarUrl() {
        return this.avatarUrl || CharacterService.GetClassImage(this.classType);
    }

    public GetLore() {
        return this.lore;
    }

    public async UpdateName(name:string) {
        this.name = name;
        await this.UPDATE({ name: this.name });
    }

    public async UpdateAvatarUrl(avatarUrl:string) {
        this.avatarUrl = avatarUrl;
        await this.UPDATE({ avatar_url: this.avatarUrl });
    }

    public async UpdateLore(lore:string) {
        this.lore = lore;
        await this.UPDATE({ lore: this.lore });
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
                const deleted = await card.RemoveOne();
                if (!deleted) {
                    await card.SetEquipped(false);
                }
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

    public IsInBattle() {
        return this.inBattle;
    }

    public SetIsHealing(isHealing:boolean) {
        this.isHealing = isHealing;
    }

    public IsHealing() {
        return this.isHealing;
    }

    public SetBeingHealed(beingHealed:boolean) {
        this.beingHealed = beingHealed;
    }

    public IsBeingHealed() {
        return this.beingHealed;
    }

    public async Sleep() {
        const healing = Math.min(Math.ceil(this.maxHealth/10), this.maxHealth - this.currentHealth);
        this.currentHealth += healing;
        this.slept += 1;
        await this.SetSleepCooldown();
        await this.UPDATE({health: this.currentHealth, slept: this.slept});
        return healing;
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

    public CanInspire() {
        return this.classType == ClassType.Bard;
    }

    public async BecomeInspired() {
        this.inspired = true;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            inspired: true
        })
    }

    public async StopBeingInspired() {
        if (!this.inspired) {
            return;
        }
        this.inspired = false;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            inspired: false
        })
    }

    public IsInspired() {
        return this.inspired;
    }

    public CalculateDamageWithArmor(damage:number) {
        return Math.ceil(damage * (1 - Math.min(50, this.fullModifierStats.armor)/100));
    }

    public GetMaxBattleCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity + this.GetHealthDexterityPenalty();
    }

    public GetHealthDexterityPenalty() {
        return Math.floor(CharacterConstants.HEALTH_DEXTERITY_PENALTY_MAX * (1 - (this.currentHealth / this.maxHealth)));
    }

    public async GetBattleCooldown() {
        return await Redis.ttl(Character.battleCooldownPrefix + this.GetId());
    }

    public async SetBattleCooldown() {
        await Redis.set(Character.battleCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxBattleCooldown()));
    }

    public async RemoveBattleCooldown() {
        await Redis.del(Character.battleCooldownPrefix + this.GetId());
    }

    public async SetSleepCooldown() {
        await Redis.set(Character.battleCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxBattleCooldown() * 2));
    }

    public async GetHealingCooldown() {
        return await Redis.ttl(Character.healingCooldownPrefix + this.GetId());
    }

    public async SetHealingCooldown() {
        await Redis.set(Character.healingCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxHealingCooldown()));
    }

    public async GetInspireCooldown() {
        return await Redis.ttl(Character.inspiringCooldownPrefix + this.GetId());
    }

    public async SetInspireCooldown() {
        await Redis.set(Character.inspiringCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(CharacterConstants.BASE_COOLDOWN_DURATION));
    }

    public async IncreaseXP(amount:number, trx?:any, updateData:boolean = true) {
        this.xp += amount;
        if (updateData) {
            await this.UPDATE({ xp: this.xp }, trx)
        }

        await this.CheckLevelUp(trx);
    }

    public async IncreaseXPFromMessage() {
        this.xp += 1;
        this.UPDATE({ xp: this.xp })
        this.CheckLevelUp();
    }

    public async CheckLevelUp(trx?:any) {
        if (this.level == 20) {
            return;
        }

        const oldLevel = this.level;

        this.level = this.CalculateLevel(oldLevel);

        if (this.level != oldLevel) {
            await this.OnLevelUp(trx)
        }
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
        var healing = Math.min(this.fullModifierStats.regeneration, this.maxHealth - this.currentHealth);
        this.currentHealth += healing;
        this.regenerated += healing;
        this.UPDATE({ health: this.currentHealth, regenerated: this.regenerated })
        return true;
    }

    public async GetHealthFromHealing(amount:number) {
        if (this.IsFullHealth()) { return false; }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.UPDATE({ health: this.currentHealth })
        return true;
    }

    public GetTotalEquipmentSpace() {
        return CharacterConstants.EQUIPMENT_SPACE_PER_LEVEL[this.level - 1];
    }

    public GetEquipment() {
        return this.equipment;
    }

    public HasEquipmentSpace() {
        return this.equipment.length < this.GetTotalEquipmentSpace();
    }

    public async Equip(playerCard:PlayerCard) {
        await playerCard.SetEquipped(true);
        this.equipment.push(playerCard.GetCard());
        this.UpdateFullModifierStats();
        this.currentHealth = this.GetMaxHealth();

        this.UPDATE({
            health: this.currentHealth,
            equipment: this.equipment.map(e => e.GetId()).join(','),
        })
    }

    public async Unequip(playerCard:PlayerCard) {
        await playerCard.SetEquipped(false);
        const cardId = playerCard.GetCard().GetId();
        const index = this.equipment.findIndex(c => c.GetId() == cardId);
        this.equipment.splice(index, 1);
        this.UpdateFullModifierStats();
        this.currentHealth = this.GetMaxHealth();

        this.UPDATE({
            health: this.currentHealth,
            equipment: this.equipment.map(c => c.GetId()).join(','),
        })
    }

    public GetRewardPoints(battleId?:string) {
        if (battleId == null || battleId != this.rewardBattleId) {
            return this.rewardPoints;
        } else {
            return this.GetNextRewardPoints() + this.rewardPoints;
        }
    }

    public GetNextRewardPoints() {
        return this.level * SettingsConstants.REWARD_POINTS_MULTIPLIER;
    }

    public GetAttackDescription(crit:boolean = false) {
        if (crit) {
            return this.attackCritDescription || this.GetRandomAttackDescription(true);
        }

        return this.attackDescription || this.GetRandomAttackDescription();
    }

    public GetHealDescription() {
        return this.healDescription || CharacterConstants.HEAL_MESSAGE;
    }

    public GetHealFailDescription() {
        return this.healFailDescription || CharacterConstants.HEAL_FAIL_MESSAGE;
    }

    public GetInspireDescription() {
        return this.inspireDescription || CharacterConstants.INSPIRE_MESSAGE;
    }

    public async UpdateAttackDescription(description:string) {
        this.attackDescription = description;
        await this.UPDATE({
            attack_description: this.attackDescription
        })
    }

    public async UpdateAttackCritDescription(description:string) {
        this.attackCritDescription = description;
        await this.UPDATE({
            attack_crit_description: this.attackCritDescription
        })
    }

    public async UpdateHealDescription(description:string) {
        this.healDescription = description;
        await this.UPDATE({
            heal_description : this.healDescription
        })
    }

    public async UpdateHealFailDescription(description:string) {
        this.healFailDescription = description;
        await this.UPDATE({
            heal_fail_description : this.healFailDescription
        })
    }

    public async UpdateInspireDescription(description:string) {
        this.inspireDescription = description;
        await this.UPDATE({
            inspire_description : this.inspireDescription
        })
    }

    public async GiveDamagePoints(damagePoints:number, battleId?:string, messageInfo?:IMessageInfo) {
        this.GiveRewardPoints(damagePoints * SettingsConstants.DAMAGE_REWARD_POINTS_MULTIPLIER, battleId, messageInfo);
    }

    public async GiveHealingPoints(healingPoints:number, battleId?:string, messageInfo?:IMessageInfo) {
        this.GiveRewardPoints(healingPoints * SettingsConstants.HEALING_REWARD_POINTS_MULTIPLIER, battleId, messageInfo);
    }

    public async GiveInspirePoints(battleId?:string, messageInfo?:IMessageInfo) {
        this.GiveRewardPoints(SettingsConstants.INSPIRE_REWARD_POINTS, battleId, messageInfo);
    }

    public async GiveRewardPoints(rewardPoints:number, battleId?:string, messageInfo?:IMessageInfo) {
        var rewardPoints = Math.ceil(rewardPoints);
        this.rewardPoints += rewardPoints;
        this.rewardPoints = Math.min(this.rewardPoints, 5000);
        this.rewardPointsTotal += rewardPoints;

        if (messageInfo != null) {
            if (battleId != null && this.rewardBattleId != battleId) {
                const now = Utils.GetNow();
                if (this.rewardDate == null || this.rewardDate.getDate() != now.getDate()) {
                    if (this.HasEnoughPointsForReward()) {
                        this.rewardPoints -= this.GetNextRewardPoints();
                        this.rewardBattleId = battleId;
                        this.rewardDate = now;

                        this.UPDATE({
                            reward_battle_id: this.rewardBattleId,
                            reward_points: this.rewardPoints,
                            reward_points_total: this.rewardPointsTotal,
                            reward_date: this.rewardDate.toISOString(),
                        });

                        var player = this.GetPlayer();

                        // TODO: Make this generic
                        const cardModifyResult = await CardManager.GivePlayerCard(player);
                        const playerCard = <PlayerCard>cardModifyResult.object;
                        messageInfo.channel = BotManager.GetCardChannel();
                        if (cardModifyResult.result) {
                            var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je hebt goed meegeholpen in de Dungeons & Wasberen campaign. Voor jou deze nieuwe kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                            if (cardMessage != null) {
                                CardManager.OnCardMessage(cardMessage, playerCard);
                                LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedReward, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen als beloning in gevecht ${battleId}.`);
                            }
                        } else {
                            var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je hebt goed meegeholpen in de Dungeons & Wasberen campaign. Voor jou deze extra kaart!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                            if (cardMessage != null) {
                                CardManager.OnCardMessage(cardMessage, playerCard);
                                LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedReward, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' gekregen als beloning in gevecht ${battleId}, en heeft daar nu ${playerCard.GetAmount()} van.`);
                            }
                        }

                        return;
                    }
                }
            }
        }

        this.UPDATE({
            reward_points: this.rewardPoints,
            reward_points_total: this.rewardPointsTotal,
        });
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

    public async GetTotalDamageDone() {
        return await Attack.FIND_TOTAL_DAMAGE_DONE(this);
    }

    public async GetTotalDamageTaken() {
        return await Attack.FIND_TOTAL_DAMAGE_TAKEN(this);
    }

    public async GetTotalCritsDone() {
        return await Attack.FIND_TOTAL_CRITS_DONE(this);
    }

    public async GetTotalCritsTaken() {
        return await Attack.FIND_TOTAL_CRITS_TAKEN(this);
    }

    public async GetTotalHealsDone() {
        return await Heal.FIND_HEALS_DONE_BY_CHARACTER(this);
    }

    public async GetTotalHealingDone() {
        return await Heal.FIND_HEALING_DONE_BY_CHARACTER(this);
    }

    public async GetTotalHealsReceived() {
        return await Heal.FIND_HEALS_RECEIVED_BY_CHARACTER(this);
    }

    public async GetTotalHealingReceived() {
        return await Heal.FIND_HEALING_RECEIVED_BY_CHARACTER(this);
    }

    public async GetTotalInspiresDone() {
        return await Log.FIND_TOTAL_INSPIRES_BY_CHARACTER(this);
    }

    public async GetTotalPuzzlesSolved() {
        return await Puzzle.FIND_SOLVED_BY_CHARACTER(this);
    }

    public GetRandomAttackDescription(crit?:boolean) {
        return CharacterService.GetClassAttackDescription(this.classType, crit).randomChoice();
    }

    private CalculateMaxHealth() {
        return this.fullModifierStats.health + CharacterConstants.HEALTH_ADDITION_PER_LEVEL[this.level - 1];
    }

    private CalculateCardModifierStats() {
        var cardModifierStats = CharacterService.GetEmptyModifierStats();

        for (const card of this.equipment) {
            cardModifierStats = CharacterService.GetSummedUpModifierStats(cardModifierStats, card.GetModifierStats());
        }

        return cardModifierStats
    }

    private CalculateFullModifierStats() {
        return CharacterService.GetSummedUpModifierStats(this.classModifierStats, this.cardModifierStats)
    }

    private CalculateLevel(level:number = 1) {
        while (level < 20) {
            if (this.xp >= CharacterConstants.XP_PER_LEVEL[level]) {
                level += 1;
            } else {
                break;
            }
        }
        return level;
    }

    private UpdateFullModifierStats() {
        if (this.classType == null) { return; }
        this.classModifierStats = CharacterService.GetClassModifierStats(this.classType);
        this.cardModifierStats = this.CalculateCardModifierStats();
        this.fullModifierStats = this.CalculateFullModifierStats();
        if (this.inspired) {
            const emptyModifierStats = CharacterService.GetEmptyModifierStats(CharacterConstants.INSPIRE_STAT_MULTIPLIER);
            emptyModifierStats.health = 1;
            this.fullModifierStats = CharacterService.GetMultipliedModifierStats(this.fullModifierStats, emptyModifierStats);
        }

        const max = CharacterService.GetMaxModifierStats(this.classType);
        this.fullModifierStats.armor = Math.min(Math.max(0, this.fullModifierStats.armor), max.armor);
        this.fullModifierStats.attack = Math.min(Math.max(0, this.fullModifierStats.attack), max.attack);
        this.fullModifierStats.healing = Math.min(Math.max(0, this.fullModifierStats.healing), max.healing);
        this.fullModifierStats.health = Math.min(Math.max(0, this.fullModifierStats.health), max.health);
        this.fullModifierStats.regeneration = Math.min(Math.max(0, this.fullModifierStats.regeneration), max.regeneration);
        this.fullModifierStats.spell = Math.min(Math.max(0, this.fullModifierStats.spell), max.spell);
        this.fullModifierStats.strength = Math.min(Math.max(0, this.fullModifierStats.strength), max.strength);
        this.fullModifierStats.dexterity = Math.min(Math.max(0, this.fullModifierStats.dexterity), max.dexterity);

        this.maxHealth = this.CalculateMaxHealth();
        this.UPDATE({
            max_health: this.maxHealth
        });
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth);
    }

    private async OnLevelUp(trx?:any) {
        this.maxHealth = this.CalculateMaxHealth();
        this.UPDATE({
            max_health: this.maxHealth
        });

        this.currentHealth = this.maxHealth;
        await this.UPDATE({
            health: this.currentHealth,
            level: this.level,
        }, trx)
    }

    private HasEnoughPointsForReward() {
        return this.rewardPoints >= this.level * SettingsConstants.REWARD_POINTS_MULTIPLIER;
    }
}