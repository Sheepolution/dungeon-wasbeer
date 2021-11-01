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
import EmojiConstants from '../Constants/EmojiConstants';
import Inspire from './Inspire';
import { transaction } from 'objection';
import PlayerCardModel from '../Models/PlayerCardModel';

export default class Character {

    private static readonly battleCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.BATTLE_COOLDOWN_KEY;
    private static readonly healingCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.HEALING_COOLDOWN_KEY;
    private static readonly inspiringCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.INSPIRING_COOLDOWN_KEY;
    private static readonly protectCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.PROTECTING_COOLDOWN_KEY;
    private static readonly enchantmentCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.ENCHANTMENT_COOLDOWN_KEY;
    private static readonly perceptionCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.PERCEPTION_COOLDOWN_KEY;
    private static readonly reinforcementCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.REINFORCEMENT_COOLDOWN_KEY;

    protected id: string;
    private player: Player;
    private status: CharacterStatus;
    private classType: ClassType;
    private xp: number;
    private level: number;
    private classModifierStats: IModifierStats;
    private cardModifierStats: IModifierStats;
    private fullModifierStats: IModifierStats;
    private currentHealth: number;
    private maxHealth: number;
    private name: string;
    private equipment: Array<Card>;
    private equipmentIds: Array<string>;
    private bornDate: Date;
    private deathDate?: Date;
    private rewardDate?: Date;
    private isSorcerer: boolean;
    private inBattle: boolean;
    private isHealing: boolean;
    private isInspiring: boolean;
    private isProtecting: boolean;
    private isCharging: boolean;
    private isPraying: boolean;
    private beingHealed: boolean;
    private beingInspired: boolean;
    private beingProtected: boolean;
    private inspiration: number;
    private enchanted: boolean;
    private reinforced: boolean;
    private protection: number;
    private charge: number;
    private blessing: number;
    private avatarUrl: string;
    private lore: string;
    private regenerated: number;
    private slept: number;
    private rewardPoints: number;
    private rewardPointsTotal: number;
    private rewardBattleId: string;
    private attackDescription: string;
    private attackCritDescription: string;
    private healDescription: string;
    private healFailDescription: string;
    private inspireDescription: string;
    private inspireFailDescription: string;
    private protectionDescription: string;
    private protectionFailDescription: string;
    private chargeDescription: string;
    private chargeFailDescription: string;
    private prayDescription: string;
    private prayFailDescription: string;
    private enchantmentDescription: string;
    private perceptionDescription: string;
    private reinforcementDescription: string;

    constructor(player?: Player) {
        if (player) {
            this.player = player;
        }
    }

    public static async GET_BY_PLAYER_ID(playerId: string) {
        const list = await CharacterModel.query().where({ player_id: playerId, status: CharacterStatus.Active }).orderBy('born_date');
        return list;
    }

    public static async INCREASE_XP(amount: any, id: string, trx?: any) {
        await CharacterModel.query(trx)
            .where({ id: id, status: '01' })
            .increment('xp', amount);
    }

    public static async RESTORE_HEALTH(id: string, trx: any) {
        await CharacterModel.query(trx)
            .where({ id: id, status: '01' })
            .patch({ health: 10000 });
    }

    public static async GET_LOW_HEALTH_LIST() {
        const list = await CharacterModel.query()
            .join('players', 'characters.id', '=', 'players.character_id')
            .select(CharacterModel.raw('name, protection, health, max_health, discord_name, (health::decimal/max_health::decimal)*100 as percentage'))
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

    public async GET(id: string) {
        const model: CharacterModel = await CharacterModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async POST(classType: ClassType) {
        const model = await CharacterModel.New(this.player, classType);
        await this.ApplyModel(model);
        return this;
    }

    public async UPDATE(data: any, trx?: any) {
        await CharacterModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model: CharacterModel) {
        this.id = model.id;
        this.player = this.player || await PlayerManager.GetPlayerById(model.player_id);
        this.status = model.GetStatus();
        this.classType = model.GetClassType();
        this.xp = model.xp;
        this.level = model.level;
        this.name = model.name;
        this.currentHealth = model.health;
        this.equipment = this.player.GetCards().filter(pc => pc.IsEquipped()).map(c => c.GetCard());
        this.equipmentIds = model.equipment?.split(',') || [];
        this.inspiration = model.inspiration;
        this.protection = model.protection;
        this.charge = 0;
        this.blessing = model.blessing;
        this.enchanted = model.enchanted;
        this.reinforced = model.reinforced;
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
        this.inspireFailDescription = model.inspire_fail_description;
        this.protectionDescription = model.protection_description;
        this.protectionFailDescription = model.protection_fail_description;
        this.chargeDescription = model.charge_description;
        this.chargeFailDescription = model.charge_fail_description;
        this.prayDescription = model.pray_description;
        this.prayFailDescription = model.pray_fail_description;
        this.enchantmentDescription = model.enchantment_description;
        this.perceptionDescription = model.perception_description;
        this.reinforcementDescription = model.reinforcement_description;
        this.rewardDate = model.reward_date ? new Date(model.reward_date) : undefined;
        this.bornDate = new Date(model.born_date);
        this.deathDate = model.death_date ? new Date(model.death_date) : undefined;
        this.isSorcerer = this.classType == ClassType.Bard || this.classType == ClassType.Cleric || this.classType == ClassType.Wizard;
        this.UpdateFullModifierStats();
        await this.CheckLevelUp();
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

    public async RestoreToFullHealth(trx: any) {
        this.currentHealth = this.GetMaxHealth();
        await this.UPDATE({ health: this.currentHealth }, trx);
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
        const nextLevel = this.level == CharacterConstants.MAX_LEVEL ? 20 : this.level + 1;
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

    public async UpdateName(name: string) {
        this.name = name;
        await this.UPDATE({ name: this.name });
    }

    public async UpdateAvatarUrl(avatarUrl: string) {
        this.avatarUrl = avatarUrl;
        await this.UPDATE({ avatar_url: this.avatarUrl });
    }

    public async UpdateLore(lore: string) {
        this.lore = lore;
        await this.UPDATE({ lore: this.lore });
    }

    public async Kill() {
        this.deathDate = Utils.GetNow();
        this.status = CharacterStatus.Dead;
        await this.UPDATE({
            death_date: Utils.GetNowString(),
            status: this.status,
        });

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
        });

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

    public GetFullModifierStatsWithoutInspire() {
        return this.CalculateFullModifierStats();
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

    public SetInBattle(inBattle: boolean) {
        this.inBattle = inBattle;
    }

    public IsInBattle() {
        return this.inBattle;
    }

    public SetIsHealing(isHealing: boolean) {
        this.isHealing = isHealing;
    }

    public IsHealing() {
        return this.isHealing;
    }

    public SetBeingHealed(beingHealed: boolean) {
        this.beingHealed = beingHealed;
    }

    public IsBeingHealed() {
        return this.beingHealed;
    }

    public SetIsInspiring(isInspiring: boolean) {
        this.isInspiring = isInspiring;
    }

    public IsInspiring() {
        return this.isInspiring;
    }

    public SetBeingInspired(beingInspired: boolean) {
        this.beingInspired = beingInspired;
    }

    public IsBeingInspired() {
        return this.beingInspired;
    }

    public SetIsProtecting(isProtecting: boolean) {
        this.isProtecting = isProtecting;
    }

    public IsProtecting() {
        return this.isProtecting;
    }

    public SetBeingProtected(beingProtected: boolean) {
        this.beingProtected = beingProtected;
    }

    public IsBeingProtected() {
        return this.beingProtected;
    }

    public SetIsCharging(isCharging: boolean) {
        this.isCharging = isCharging;
    }

    public IsCharging() {
        return this.isCharging;
    }

    public SetIsPraying(isPraying: boolean) {
        this.isPraying = isPraying;
    }

    public IsPraying() {
        return this.isPraying;
    }

    public GetEnhancementsString() {
        const str = ` ${(this.IsInspired() ? `${EmojiConstants.DNW_STATES.INSPIRED}` : '')}${(this.IsEnchanted() ? `${EmojiConstants.DNW_STATES.ENCHANTED}` : '')}${(this.IsReinforced() ? `${EmojiConstants.DNW_STATES.REINFORCED}` : '')}${(this.IsProtected() ? `${EmojiConstants.DNW_STATES.PROTECTED}` : '')}${(this.IsCharged() ? `${EmojiConstants.DNW_STATES.CHARGED}` : '')}${(this.IsBlessed() ? `${EmojiConstants.DNW_STATES.BLESSED}` : '')}`;
        if (str.length == 1) {
            return '';
        }

        return str;
    }

    public async Sleep() {
        const healing = Math.min(Math.ceil(this.maxHealth / 10), this.maxHealth - this.currentHealth);
        this.currentHealth += healing;
        this.slept += 1;
        await this.SetSleepCooldown();
        await this.UPDATE({ health: this.currentHealth, slept: this.slept });
        this.UpdateFullModifierStats();
        return healing;
    }

    public GetAttackRoll() {
        return this.fullModifierStats.attack;
    }

    public GetAttackStrength(crit?: boolean) {
        const fullModifierStats = this.GetFullModifierStats();

        if (this.isSorcerer) {
            return fullModifierStats.spell * (crit ? 2 : 1);
        }

        return fullModifierStats.strength * (crit ? 2 : 1);
    }

    public GetAttackName() {
        return this.isSorcerer ? 'Spell attack' : 'Strength';
    }

    public async ReceiveDamage(damage: number) {
        if (this.protection > 0) {
            this.protection -= damage;
            if (this.protection < 0) {
                damage = -this.protection;
                this.protection = 0;
            } else {
                await this.UPDATE({ protection: this.protection });
                return 0;
            }
        }

        const damageAfterArmor = this.CalculateDamageWithArmor(damage);
        this.currentHealth = Math.max(0, this.currentHealth - damageAfterArmor);
        await this.UPDATE({ health: this.currentHealth, protection: this.protection });
        this.UpdateFullModifierStats();
        return damageAfterArmor;
    }

    public IsDead() {
        return this.currentHealth <= 0;
    }

    public CanInspire() {
        return this.classType == ClassType.Bard;
    }

    public CanEnchant() {
        return this.classType == ClassType.Wizard;
    }

    public CanPercept() {
        return this.classType == ClassType.Ranger;
    }

    public CanReinforce() {
        return this.classType == ClassType.Fighter;
    }

    public CanProtect() {
        return this.classType == ClassType.Paladin;
    }

    public CanCharge() {
        return this.classType == ClassType.Paladin;
    }

    public CanPray() {
        return this.classType == ClassType.Cleric;
    }

    public async BecomeInspired(amount: number) {
        this.inspiration = amount;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            inspiration: this.inspiration
        });
    }

    public async StopBeingInspired() {
        if (this.inspiration == 0) {
            return;
        }

        this.inspiration = 0;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            inspiration: this.inspiration
        });
    }

    public GetInspiration() {
        return this.inspiration;
    }

    public IsInspired() {
        return this.inspiration != 0;
    }

    public GetMaxInspiringCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity;
    }

    public async BecomeProtected(amount: number) {
        this.protection = amount;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            protection: this.protection
        });
    }

    public async StopBeingProtected() {
        if (this.protection == 0) {
            return;
        }

        this.protection = 0;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            protection: this.protection
        });
    }

    public GetProtection() {
        return this.protection;
    }

    public IsProtected() {
        return this.protection != 0;
    }

    public GetMaxProtectionCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity;
    }

    public BecomeCharged(amount: number) {
        this.charge = amount;
        this.UpdateFullModifierStats();
    }

    public StopBeingCharged() {
        if (this.charge == 0) {
            return;
        }

        this.charge = 0;
        this.UpdateFullModifierStats();
    }

    public GetCharge() {
        return this.charge;
    }

    public IsCharged() {
        return this.charge != 0;
    }

    public GetMaxChargeCooldown() {
        return (CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity) / 2;
    }

    public async BecomeBlessed(amount: number) {
        this.blessing += amount;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            blessing: this.blessing
        });
    }

    public async StopBeingBlessed() {
        if (this.blessing == 0) {
            return;
        }

        this.blessing = 0;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            blessing: this.blessing
        });
    }

    public GetBlessing() {
        return this.blessing;
    }

    public IsBlessed() {
        return this.blessing != 0;
    }

    public GetMaxPrayingCooldown() {
        return (CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity) / 2;
    }

    public async BecomeEnchanted() {
        this.enchanted = true;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            enchanted: this.enchanted
        });
    }

    public async StopBeingEnchanted() {
        if (!this.enchanted) {
            return;
        }

        this.enchanted = false;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            enchanted: this.enchanted
        });
    }

    public IsEnchanted() {
        return this.enchanted;
    }

    public async OnPerception() {
        const battleCooldown = await this.GetBattleCooldown();
        const newCooldown = Math.floor(battleCooldown / 2);
        await Redis.expire(Character.battleCooldownPrefix + this.GetId(), newCooldown);
        return newCooldown;
    }

    public async BecomeReinforced() {
        this.reinforced = true;
        this.UpdateFullModifierStats();
        await this.UPDATE({
            reinforced: this.reinforced
        });
    }

    public async StopBeingReinforced() {
        if (!this.reinforced) {
            return;
        }

        this.reinforced = false;
        await this.UPDATE({
            reinforced: this.reinforced
        });
    }

    public IsReinforced() {
        return this.reinforced;
    }

    public GetMaxAbilityCooldown() {
        return (CharacterConstants.BASE_COOLDOWN_DURATION * 2) - (CharacterConstants.BASE_COOLDOWN_DURATION * (this.level / CharacterConstants.MAX_LEVEL));
    }

    public CalculateDamageWithArmor(damage: number) {
        return Math.ceil(damage * (1 - this.fullModifierStats.armor / 100));
    }

    public GetMaxBattleCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity + this.GetHealthDexterityPenalty() + (this.charge ? 5 : 0);
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

        if (this.IsCharged()) {
            await Redis.del(Character.protectCooldownPrefix + this.GetId());
        }
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
        await Redis.set(Character.inspiringCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxInspiringCooldown()));
    }

    public async GetProtectCooldown() {
        return await Redis.ttl(Character.protectCooldownPrefix + this.GetId());
    }

    public async SetProtectCooldown() {
        await Redis.set(Character.protectCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxProtectionCooldown()));
    }

    public async GetChargeCooldown() {
        return await Redis.ttl(Character.protectCooldownPrefix + this.GetId());
    }

    public async SetChargeCooldown() {
        await Redis.set(Character.protectCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(Math.floor(this.GetMaxChargeCooldown())));
    }

    public async GetPrayCooldown() {
        return await Redis.ttl(Character.healingCooldownPrefix + this.GetId());
    }

    public async SetPrayCooldown() {
        await Redis.set(Character.healingCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxPrayingCooldown()));
    }

    public async GetEnchantmentCooldown() {
        return await Redis.ttl(Character.enchantmentCooldownPrefix + this.GetId());
    }

    public async SetEnchantmentCooldown() {
        await Redis.set(Character.enchantmentCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxAbilityCooldown()));
    }

    public async GetPerceptionCooldown() {
        return await Redis.ttl(Character.perceptionCooldownPrefix + this.GetId());
    }

    public async SetPerceptionCooldown() {
        await Redis.set(Character.perceptionCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxAbilityCooldown()));
    }

    public async GetReinforcementCooldown() {
        return await Redis.ttl(Character.reinforcementCooldownPrefix + this.GetId());
    }

    public async SetReinforcementCooldown() {
        await Redis.set(Character.reinforcementCooldownPrefix + this.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(this.GetMaxAbilityCooldown()));
    }

    public async IncreaseXP(amount: number, trx?: any, updateData: boolean = true) {
        this.xp += amount;
        if (updateData) {
            await this.UPDATE({ xp: this.xp }, trx);
        }

        await this.CheckLevelUp(trx);
    }

    public IncreaseXPFromMessage() {
        this.xp += 1;
        this.UPDATE({ xp: this.xp });
        this.CheckLevelUp();
    }

    public async CheckLevelUp(trx?: any) {
        if (this.level == CharacterConstants.MAX_LEVEL) {
            return;
        }

        const oldLevel = this.level;

        this.level = this.CalculateLevel(oldLevel);

        if (this.level != oldLevel) {
            await this.OnLevelUp(trx);
        }
    }

    public CanHeal() {
        return this.classType == ClassType.Cleric;
    }

    public GetMaxHealingCooldown() {
        return CharacterConstants.BASE_COOLDOWN_DURATION - this.fullModifierStats.dexterity;
    }

    public GetHealingBasedOnRoll(roll: number) {
        if (roll == 1) {
            return 0;
        }

        return Math.floor((roll / 10) * this.fullModifierStats.wisdom);
    }

    public GetInspirationBasedOnRoll(roll: number) {
        if (roll == 1) {
            return 0;
        }

        return Math.floor((roll / 10) * this.fullModifierStats.charisma);
    }

    public GetProtectionBasedOnRoll(roll: number) {
        if (roll == 1) {
            return 0;
        }

        return Math.floor((roll / 20) * this.fullModifierStats.armor);
    }

    public GetChargeBasedOnRoll(roll: number) {
        if (roll == 1) {
            return 0;
        }

        if (this.inspiration > 0) {
            const oldInspiration = this.inspiration;
            this.inspiration = 0;
            this.UpdateFullModifierStats();
            const charge = Math.floor((roll / 20) * (this.fullModifierStats.armor / 2));
            this.inspiration = oldInspiration;
            this.UpdateFullModifierStats();
            return charge;
        }

        return Math.floor((roll / 20) * this.fullModifierStats.armor / 2);
    }

    public GetBlessingBasedOnRoll(roll: number) {
        if (roll == 1) {
            return 0;
        }

        return Math.floor((roll / 20) * this.fullModifierStats.wisdom);
    }

    public GetHealthFromMessage() {
        if (this.IsFullHealth()) { return false; }
        var healing = Math.min(this.fullModifierStats.regeneration, this.maxHealth - this.currentHealth);
        this.currentHealth += healing;
        this.regenerated += healing;
        this.UPDATE({ health: this.currentHealth, regenerated: this.regenerated });
        this.UpdateFullModifierStats();
        return true;
    }

    public GetHealthFromHealing(amount: number) {
        if (this.IsFullHealth()) { return false; }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.UPDATE({ health: this.currentHealth });
        this.UpdateFullModifierStats();
        return true;
    }

    public GetHealthFromUnequippedCard(amount: number) {
        if (this.IsFullHealth()) { return false; }
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.UPDATE({ health: this.currentHealth });
        return true;
    }

    public GetTotalEquipmentSpace() {
        return CharacterConstants.EQUIPMENT_SPACE_PER_LEVEL[this.level - 1];
    }

    public GetEquipment() {
        return this.equipment;
    }

    public GetEquipmentIds() {
        return this.equipmentIds || [];
    }

    public HasEquipmentSpace() {
        return this.equipment.length < this.GetTotalEquipmentSpace();
    }

    public async Equip(playerCard: PlayerCard, trx?: any) {
        if (!this.HasEquipmentSpace()) {
            return;
        }

        const card = playerCard.GetCard();
        const modifierClass = card.GetModifierClass();
        if (modifierClass != null && modifierClass != this.GetClass()) {
            return;
        }

        if (!card.HasBuffs()) {
            return;
        }

        if (playerCard.IsEquipped()) {
            return;
        }

        if (playerCard.IsUsedInTrade()) {
            return;
        }

        await playerCard.SetEquipped(true);
        this.equipment.push(playerCard.GetCard());
        this.UpdateFullModifierStats();
        this.currentHealth = this.GetMaxHealth();

        this.equipmentIds = this.equipment.map(c => c.GetId());

        await this.UPDATE({
            health: this.currentHealth,
            equipment: this.equipmentIds.join(','),
        }, trx);
    }

    public async Unequip(playerCard: PlayerCard) {
        await playerCard.SetEquipped(false);
        const cardId = playerCard.GetCard().GetId();
        const index = this.equipment.findIndex(c => c.GetId() == cardId);
        this.equipment.splice(index, 1);
        this.UpdateFullModifierStats();
        this.currentHealth = this.GetMaxHealth();

        this.equipmentIds = this.equipment.map(c => c.GetId());

        await this.UPDATE({
            health: this.currentHealth,
            equipment: this.equipmentIds.join(','),
        });
    }

    public async ForceUnequip(playerCard: PlayerCard) {
        await playerCard.SetEquipped(false);
        const cardId = playerCard.GetCard().GetId();
        const index = this.equipment.findIndex(c => c.GetId() == cardId);
        this.equipment.splice(index, 1);

        const card = playerCard.GetCard();
        const modifierStats = card.GetModifierStats();
        if (modifierStats.health > 0) {
            this.GetHealthFromUnequippedCard(modifierStats.health);
        }

        this.UpdateFullModifierStats();

        this.equipmentIds = this.equipment.map(c => c.GetId());

        this.UPDATE({
            equipment: this.equipmentIds.join(','),
        });
    }

    public async RemoveAllEquipment(updateCards?: boolean) {
        if (updateCards) {
            await transaction(PlayerCardModel.knex(), async (trx: any) => {
                const playerCards = this.player.GetCards();
                for (const card of this.equipment) {
                    const playerCard = playerCards.find(pc => pc.GetCardId() == card.GetId());
                    if (playerCard != null) {
                        await playerCard.SetEquipped(false, trx);
                    }
                }
            });
        }

        this.equipment = [];
        this.equipmentIds = [];

        this.UpdateFullModifierStats();

        await this.UPDATE({
            equipment: '',
        });

    }

    public GetRewardPoints(battleId?: string) {
        if (battleId == null || battleId != this.rewardBattleId) {
            return this.rewardPoints;
        } else {
            return this.GetNextRewardPoints() + this.rewardPoints;
        }
    }

    public GetNextRewardPoints() {
        return this.level * SettingsConstants.REWARD_POINTS_MULTIPLIER;
    }

    public GetAttackDescription(crit: boolean = false) {
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

    public GetInspireFailDescription() {
        return this.inspireFailDescription || CharacterConstants.INSPIRE_FAIL_MESSAGE;
    }

    public GetProtectionDescription() {
        return this.protectionDescription || CharacterConstants.PROTECTION_MESSAGE;
    }

    public GetProtectionFailDescription() {
        return this.protectionFailDescription || CharacterConstants.PROTECTION_FAIL_MESSAGE;
    }

    public GetChargeDescription() {
        return this.chargeDescription || CharacterConstants.CHARGE_MESSAGE;
    }

    public GetChargeFailDescription() {
        return this.chargeFailDescription || CharacterConstants.CHARGE_FAIL_MESSAGE;
    }

    public GetPrayDescription() {
        return this.prayDescription || CharacterConstants.PRAY_MESSAGE;
    }

    public GetPrayFailDescription() {
        return this.prayFailDescription || CharacterConstants.PRAY_FAIL_MESSAGE;
    }

    public GetEnchantmentDescription() {
        return this.enchantmentDescription || CharacterConstants.ENCHANTMENT_MESSAGE;
    }

    public GetPerceptionDescription() {
        return this.perceptionDescription || CharacterConstants.PERCEPTION_MESSAGE;
    }

    public GetReinforcementDescription() {
        return this.reinforcementDescription || CharacterConstants.REINFORCEMENT_MESSAGE;
    }

    public async UpdateAttackDescription(description: string) {
        this.attackDescription = description;
        await this.UPDATE({
            attack_description: this.attackDescription
        });
    }

    public async UpdateAttackCritDescription(description: string) {
        this.attackCritDescription = description;
        await this.UPDATE({
            attack_crit_description: this.attackCritDescription
        });
    }

    public async UpdateHealDescription(description: string) {
        this.healDescription = description;
        await this.UPDATE({
            heal_description: this.healDescription
        });
    }

    public async UpdateHealFailDescription(description: string) {
        this.healFailDescription = description;
        await this.UPDATE({
            heal_fail_description: this.healFailDescription
        });
    }

    public async UpdateInspireDescription(description: string) {
        this.inspireDescription = description;
        await this.UPDATE({
            inspire_description: this.inspireDescription
        });
    }

    public async UpdateInspireFailDescription(description: string) {
        this.inspireFailDescription = description;
        await this.UPDATE({
            inspire_fail_description: this.inspireFailDescription
        });
    }

    public async UpdateProtectionDescription(description: string) {
        this.protectionDescription = description;
        await this.UPDATE({
            protection_description: this.protectionDescription
        });
    }

    public async UpdateProtectionFailDescription(description: string) {
        this.protectionFailDescription = description;
        await this.UPDATE({
            protection_fail_description: this.protectionFailDescription
        });
    }

    public async UpdateChargeDescription(description: string) {
        this.chargeDescription = description;
        await this.UPDATE({
            charge_description: this.chargeDescription
        });
    }

    public async UpdateChargeFailDescription(description: string) {
        this.chargeFailDescription = description;
        await this.UPDATE({
            charge_fail_description: this.chargeFailDescription
        });
    }

    public async UpdatePrayDescription(description: string) {
        this.prayDescription = description;
        await this.UPDATE({
            pray_description: this.prayDescription
        });
    }

    public async UpdatePrayFailDescription(description: string) {
        this.prayFailDescription = description;
        await this.UPDATE({
            pray_fail_description: this.prayFailDescription
        });
    }

    public async UpdateEnchantmentDescription(description: string) {
        this.enchantmentDescription = description;
        await this.UPDATE({
            enchantment_description: this.enchantmentDescription
        });
    }

    public async UpdatePerceptionDescription(description: string) {
        this.perceptionDescription = description;
        await this.UPDATE({
            perception_description: this.perceptionDescription
        });
    }

    public async UpdateReinforcementDescription(description: string) {
        this.reinforcementDescription = description;
        await this.UPDATE({
            reinforcement_description: this.reinforcementDescription
        });
    }

    public GiveDamagePoints(damagePoints: number, battleId?: string, messageInfo?: IMessageInfo) {
        this.GiveRewardPoints(damagePoints * SettingsConstants.DAMAGE_REWARD_POINTS_MULTIPLIER, battleId, messageInfo);
    }

    public GiveHealingPoints(healingPoints: number, battleId?: string, messageInfo?: IMessageInfo) {
        this.GiveRewardPoints(healingPoints * SettingsConstants.HEALING_REWARD_POINTS_MULTIPLIER, battleId, messageInfo);
    }

    public GiveInspirePoints(inspirationPoints: number, battleId?: string, messageInfo?: IMessageInfo) {
        this.GiveRewardPoints(inspirationPoints * SettingsConstants.INSPIRE_REWARD_POINTS_MULITPLIER, battleId, messageInfo);
    }

    public GiveProtectionPoints(protectionPoints: number, battleId?: string, messageInfo?: IMessageInfo) {
        this.GiveRewardPoints(protectionPoints * SettingsConstants.PROTECTION_REWARD_POINTS_MULITPLIER, battleId, messageInfo);
    }

    public GiveAbilityPoints(battleId?: string, messageInfo?: IMessageInfo) {
        this.GiveRewardPoints(SettingsConstants.INSPIRE_REWARD_POINTS_MULITPLIER, battleId, messageInfo);
    }

    public async GiveRewardPoints(rewardPoints: number, battleId?: string, messageInfo?: IMessageInfo) {
        if (rewardPoints == 0) {
            return;
        }

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
        return parseInt(await Log.FIND_TOTAL_INSPIRES_BY_CHARACTER(this)) + parseInt(await Inspire.FIND_INSPIRES_DONE_BY_CHARACTER(this));
    }

    public async GetTotalPuzzlesSolved() {
        return await Puzzle.FIND_SOLVED_BY_CHARACTER(this);
    }

    public GetRandomAttackDescription(crit?: boolean) {
        return CharacterService.GetClassAttackDescription(this.classType, crit).randomChoice();
    }

    public async UpdateFullModifierStats() {
        if (this.classType == null) { return; }
        this.classModifierStats = CharacterService.GetClassModifierStats(this.classType);
        this.cardModifierStats = this.CalculateCardModifierStats();
        this.fullModifierStats = this.CalculateFullModifierStats();

        if (this.charge > 0) {
            this.fullModifierStats.armor -= this.charge;
        }

        if (this.inspiration > 0) {
            const emptyModifierStats = CharacterService.GetEmptyModifierStats(1 + (this.inspiration / 100));
            emptyModifierStats.health = 1;
            emptyModifierStats.charisma = 1;
            this.fullModifierStats = CharacterService.GetMultipliedModifierStats(this.fullModifierStats, emptyModifierStats);
        }

        const max = CharacterService.GetMaxModifierStats(this.classType);

        if (this.charge > 0) {
            this.fullModifierStats.strength += Math.ceil(this.charge / 2);
            this.fullModifierStats.attack += Math.ceil(this.charge / 2);
        }

        if (this.blessing > 0) {
            const buff = Math.floor(this.blessing / 3);
            this.fullModifierStats.spell += buff;
            this.fullModifierStats.attack += buff;
            this.fullModifierStats.armor += buff;
        }

        this.fullModifierStats.armor = Math.min(Math.max(0, this.fullModifierStats.armor), max.armor);
        this.fullModifierStats.attack = Math.min(Math.max(0, this.fullModifierStats.attack), max.attack);
        this.fullModifierStats.charisma = Math.min(Math.max(0, this.fullModifierStats.charisma), max.charisma);
        this.fullModifierStats.wisdom = Math.min(Math.max(0, this.fullModifierStats.wisdom), max.wisdom);
        this.fullModifierStats.health = Math.min(Math.max(0, this.fullModifierStats.health), max.health);
        this.fullModifierStats.regeneration = Math.min(Math.max(0, this.fullModifierStats.regeneration), max.regeneration);
        this.fullModifierStats.spell = Math.min(Math.max(0, this.fullModifierStats.spell), max.spell);
        this.fullModifierStats.strength = Math.min(Math.max(0, this.fullModifierStats.strength), max.strength);
        this.fullModifierStats.dexterity = Math.min(Math.max(0, this.fullModifierStats.dexterity), max.dexterity);

        const oldMaxHealth = this.maxHealth;
        this.maxHealth = this.CalculateMaxHealth();
        if (oldMaxHealth != this.maxHealth) {
            await this.UPDATE({
                max_health: this.maxHealth
            });
        }

        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
            await this.UPDATE({ health: this.currentHealth });
        }
    }

    private CalculateMaxHealth() {
        return this.fullModifierStats.health + CharacterConstants.HEALTH_ADDITION_PER_LEVEL[this.level - 1];
    }

    private CalculateCardModifierStats() {
        var cardModifierStats = CharacterService.GetEmptyModifierStats();

        for (const card of this.equipment) {
            cardModifierStats = CharacterService.GetSummedUpModifierStats(cardModifierStats, card.GetModifierStats());
        }

        return cardModifierStats;
    }

    private CalculateFullModifierStats() {
        return CharacterService.GetSummedUpModifierStats(this.classModifierStats, this.cardModifierStats);
    }

    private CalculateLevel(level: number = 1) {
        while (level < 20) {
            if (this.xp >= CharacterConstants.XP_PER_LEVEL[level]) {
                level += 1;
            } else {
                break;
            }
        }
        return level;
    }

    private async OnLevelUp(trx?: any) {
        this.maxHealth = this.CalculateMaxHealth();
        this.UPDATE({
            max_health: this.maxHealth
        });

        this.currentHealth = this.maxHealth;
        await this.UPDATE({
            health: this.currentHealth,
            level: this.level,
        }, trx);
    }

    private HasEnoughPointsForReward() {
        return this.rewardPoints >= this.level * SettingsConstants.REWARD_POINTS_MULTIPLIER;
    }
}