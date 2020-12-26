import Attack from '../Objects/Attack';
import CampaignManager from '../Managers/CampaignManager';
import Card from '../Objects/Card';
import CardService from '../Services/CardService';
import Character from '../Objects/Character';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterService from '../Services/CharacterService';
import Heal from '../Objects/Heal';
import Puzzle from '../Objects/Puzzle';
import SettingsConstants from '../Constants/SettingsConstants';
import { TopListType } from '../Enums/TopListType';
import { Utils } from '../Utils/Utils';
import { MessageEmbed } from 'discord.js';
import Log from '../Objects/Log';

export default class CharacterEmbeds {

    public static async GetCharacterInfoEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .setThumbnail(character.GetAvatarUrl())
            .addField('XP', `${character.GetXP()}/${character.GetXPForNextLevel()}`, true)
            .addField('Level', character.GetLevel(), true);

        const modifiers = character.GetFullModifierStats();
        const modifiersClass = character.GetClassModifierStats();
        const modifiersCards = character.GetCardModifierStats();

        embed.addField('Health', `${character.GetCurrentHealth()}/${character.GetMaxHealth()} ${modifiersCards.health > 0 ? `(${character.GetBaseHealth()}+${modifiersCards.health})` : ''}`, true)
            .addField('Regeneration', `${modifiers.regeneration} ${modifiersCards.regeneration > 0 ? `(${modifiersClass.regeneration}+${modifiersCards.regeneration})` : ''}`, true)
            .addField('Armor', `${modifiers.armor} ${modifiersCards.armor > 0 ? `(${modifiersClass.armor}+${modifiersCards.armor})` : ''}`, true)

        if (character.IsSorcerer()) {
            embed.addField('Spell attack', `${modifiers.spell} ${modifiersCards.spell > 0 ? `(${modifiersClass.spell}+${modifiersCards.spell})` : ''}`, true);
        } else {
            embed.addField('Strength', `${modifiers.strength} ${modifiersCards.strength > 0 ? `(${modifiersClass.strength}+${modifiersCards.strength})` : ''}`, true);
        }

        embed.addField('Attack', `${modifiers.attack} ${modifiersCards.attack > 0 ? `(${modifiersClass.attack}+${modifiersCards.attack})` : ''}`, true)
            .addField('Dexterity', `${modifiers.dexterity} ${modifiersCards.dexterity > 0 ? `(${modifiersClass.dexterity}+${modifiersCards.dexterity})` : ''}`, true)

        if (character.CanHeal()) {
            embed.addField('Healing', `${modifiers.healing} ${modifiersCards.healing > 0 ? `(${modifiersClass.healing}+${modifiersCards.healing})` : ''}`, true);
        }

        const equipment = character.GetEquipment();
        embed.addField('-----------------------------', `Equipment ${equipment.length}/${character.GetTotalEquipmentSpace()}`)
        this.AddEquipmentToEmbed(embed, equipment);

        embed.addField('-----------------------------', 'Cooldown(s)');
        const battleCooldown = await character.GetBattleCooldown();
        if (battleCooldown > 0) {
            embed.addField('Vechten', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(battleCooldown)}`, true)
        } else {
            embed.addField('Vechten', 'Klaar om te vechten!', true);
        }

        if (character.CanHeal()) {
            const healingCooldown = await character.GetHealingCooldown();
            if (healingCooldown > 0) {
                embed.addField('Healen', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(healingCooldown)}`, true)
            } else {
                embed.addField('Healen', 'Klaar om te healen!', true);
            }
        }

        if (character.CanInspire()) {
            const inspiringCooldown = await character.GetInspireCooldown();
            if (inspiringCooldown > 0) {
                embed.addField('Inspireren', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(inspiringCooldown)}`, true)
            } else {
                embed.addField('Inspireren', 'Klaar om een mooi lied te spelen!', true);
            }
        }

        return embed;
    }

    public static async GetCharacterDescriptionEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .setImage(character.GetAvatarUrl())
            .addField('XP', `${character.GetXP()}/${character.GetXPForNextLevel()}`, true)
            .addField('Level', character.GetLevel(), true);

        const lore = character.GetLore();
        if (lore != null) {
            embed.setDescription(lore);
        }

        return embed;
    }

    public static async GetCharacterStatsEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .addField('XP', `${character.GetXP()}/${character.GetXPForNextLevel()}`, true)
            .addField('Level', character.GetLevel(), true);

        const modifiers = character.GetFullModifierStats();
        const modifiersClass = character.GetClassModifierStats();
        const modifiersCards = character.GetCardModifierStats();

        embed.addField('Health', `${character.GetCurrentHealth()}/${character.GetMaxHealth()} ${modifiersCards.health > 0 ? `(${character.GetBaseHealth()}+${modifiersCards.health})` : ''}`, true)
            .addField('Regeneration', `${modifiers.regeneration} ${modifiersCards.regeneration > 0 ? `(${modifiersClass.regeneration}+${modifiersCards.regeneration})` : ''}`, true)
            .addField('Armor', `${modifiers.armor} ${modifiersCards.armor > 0 ? `(${modifiersClass.armor}+${modifiersCards.armor})` : ''}`, true)

        if (character.IsSorcerer()) {
            embed.addField('Spell attack', `${modifiers.spell} ${modifiersCards.spell > 0 ? `(${modifiersClass.spell}+${modifiersCards.spell})` : ''}`, true);
        } else {
            embed.addField('Strength', `${modifiers.strength} ${modifiersCards.strength > 0 ? `(${modifiersClass.strength}+${modifiersCards.strength})` : ''}`, true);
        }

        embed.addField('Attack', `${modifiers.attack} ${modifiersCards.attack > 0 ? `(${modifiersClass.attack}+${modifiersCards.attack})` : ''}`, true)
            .addField('Dexterity', `${modifiers.dexterity} ${modifiersCards.dexterity > 0 ? `(${modifiersClass.dexterity}+${modifiersCards.dexterity})` : ''}`, true)

        if (character.CanHeal()) {
            embed.addField('Healing', `${modifiers.healing} ${modifiersCards.healing > 0 ? `(${modifiersClass.healing}+${modifiersCards.healing})` : ''}`, true);
        }

        return embed;
    }

    public static async GetCharacterCooldownsEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)

        embed.addField('-----------------------------', 'Cooldown(s)');
        const battleCooldown = await character.GetBattleCooldown();
        if (battleCooldown > 0) {
            embed.addField('Vechten', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(battleCooldown)}`, true)
        } else {
            embed.addField('Vechten', 'Klaar om te vechten!', true);
        }

        if (character.CanHeal()) {
            const healingCooldown = await character.GetHealingCooldown();
            if (healingCooldown > 0) {
                embed.addField('Healen', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(healingCooldown)}`, true)
            } else {
                embed.addField('Healen', 'Klaar om te healen!', true);
            }
        }

        if (character.CanInspire()) {
            const inspiringCooldown = await character.GetInspireCooldown();
            if (inspiringCooldown > 0) {
                embed.addField('Inspireren', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(inspiringCooldown)}`, true)
            } else {
                embed.addField('Inspireren', 'Klaar om een mooi lied te spelen!', true);
            }
        }

        return embed;
    }

    public static GetEquipmentEmbed(character:Character) {
        const equipment = character.GetEquipment();
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`De equipment van ${character.GetName()}${(character.IsInspired() ? ' ✨' : '')} (${equipment.length}/${character.GetTotalEquipmentSpace()})`);
        this.AddEquipmentToEmbed(embed, equipment);
        return embed;
    }

    public static GetNewCharacterEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .setTitle(character.GetName())

        return embed;
    }

    public static async GetCharacterHistoryEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(character.GetClassName(), CharacterService.GetClassIconImage(character.GetClass()))
            .setTitle(`De geschiedenis van ${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .setImage(character.GetAvatarUrl())
            .setDescription(`Aangemaakt op ${character.GetBornDateString()}`)

        await this.AddCharacterHistoryToEmbed(embed, character)

        return embed;
    }

    public static async GetDeadCharacterEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.BAD)
            .setImage(CharacterConstants.CHARACTER_DIED)
            .setTitle(`RIP ${character.GetName()}\n${character.GetBornDateString()} - ${character.GetDeathDateString()}`)
            .setDescription('--------------------')
            .addField('Level', character.GetLevel(), true)
            .addField('XP', character.GetXP(), true)

        await this.AddCharacterHistoryToEmbed(embed, character);

        const equipment = character.GetEquipment();
        if (equipment.length > 0) {
            embed.addField('-----------------------------', 'Equipment');
            this.AddEquipmentToEmbed(embed, equipment);
        }

        return embed;
    }

    public static async GetHealingEmbed(character:Character, receiver:Character, roll?:number, healing:number = 0) {
        const embed = new MessageEmbed();
        if (healing != null) {
            embed.setColor((roll != null && healing == 0) ? SettingsConstants.COLORS.BAD : SettingsConstants.COLORS.GOOD)
        } else {
            embed.setColor(SettingsConstants.COLORS.DEFAULT)
        }

        const characterName = character.GetName();
        const receiverName = receiver.GetName();

        embed.setTitle('Healing roll')
            .setThumbnail(character.GetAvatarUrl())
            .setDescription(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')} rollt om ${receiver == character ? 'zichzelf' : receiver.GetName()}${(character.IsInspired() ? ' ✨' : '')} te healen.\n\n-- Statistieken --`)
            .addField(`Health van ${receiverName}`, `${receiver.GetCurrentHealth()}/${receiver.GetMaxHealth()}`)
            .addField(`Healing van ${characterName}`, character.GetFullModifierStats().healing)
            .addField('--------------------------------', '-- Roll --')

        if (roll == null)  {
            embed.addField(characterName, 'Rollt de D20...')
        } else {
            embed.addField(characterName, `D20 = ${roll}`)
                .addField('--------------------------------', '-- Resultaat --')
                .setFooter(`Participatiepunten: ${character.GetRewardPoints(CampaignManager.GetBattle()?.GetId())}/${character.GetNextRewardPoints()}`);

            if (healing == 0 ) {
                embed.addField(`${characterName} faalt met healen!`, character.GetHealFailDescription().replaceAll('\\[naam\\]', receiverName));
            } else {
                embed.addField(`${characterName} slaagt er in te healen`, character.GetHealDescription().replaceAll('\\[naam\\]', receiverName).replaceAll('\\[health\\]',  healing.toString()));
            }

            embed.addField('--------------------------------', '-- Cooldown(s) --');

            const battleCooldown = await character.GetBattleCooldown();
            if (battleCooldown > 0) {
                embed.addField('Vechten', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(battleCooldown)}`, true)
            } else {
                embed.addField('Vechten', 'Klaar om te vechten!', true);
            }

            if (character.CanHeal()) {
                const healingCooldown = await character.GetHealingCooldown();
                if (healingCooldown > 0) {
                    embed.addField('Healen', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(healingCooldown)}`, true)
                } else {
                    embed.addField('Healen', 'Klaar om te healen!', true);
                }
            }

            if (character.CanInspire()) {
                const inspiringCooldown = await character.GetInspireCooldown();
                if (inspiringCooldown > 0) {
                    embed.addField('Inspireren', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(inspiringCooldown)}`, true)
                } else {
                    embed.addField('Inspireren', 'Klaar om een mooi lied te spelen!', true);
                }
            }

        }

        return embed;
    }

    public static async GetLowestHealthEmbed() {
        const list:any = await Character.GET_LOW_HEALTH_LIST();
        const embed = new MessageEmbed()
            .setTitle('Deze characters hebben healing nodig!');

        var listString = '';

        for (const item of list) {
            listString += `Health: ${Math.ceil(item.percentage)}% (${item.health}/${item.max_health}) - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopXPEmbed() {
        const list:any = await Character.GET_TOP_XP_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste xp`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.xp} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopRewardPointsEmbed() {
        const list:any = await Character.GET_TOP_REWARD_POINTS_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste participatiepunten`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.reward_points_total} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopRegeneratedEmbed() {
        const list:any = await Character.GET_TOP_REGENERATED_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste health regenerated`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.regenerated} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopSleptEmbed() {
        const list:any = await Character.GET_TOP_SLEPT_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste keren geslapen`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.slept} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopFightsEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_BATTLES_LIST(undefined, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} aanvallen${topListType == TopListType.Current ? ' van dit gevecht' : topListType == TopListType.Previous ? ' van het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopFightsWonEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_BATTLES_LIST(true, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste gewonnen aanvallen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopFightsLostEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_BATTLES_LIST(false, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste verloren aanvallen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopWinRatioEmbed(topListType:TopListType, battleId?:string) {
        const listWon:any = await Attack.GET_TOP_BATTLES_LIST(true, battleId);
        const listLost:any = await Attack.GET_TOP_BATTLES_LIST(false, battleId);

        const listRatio:any = {};
        for (const loss of listLost) {
            listRatio[loss.id] = { name: loss.name, discordName: loss.discord_name, amount: loss.cnt, ratio: 0 };
        }

        for (const victory of listWon) {
            if (listRatio[victory.id] == null) {
                listRatio[victory.id] = { name: victory.name, discordName: victory.discord_name, amount: victory.cnt, ratio: 1 };
            } else {
                const item = listRatio[victory.id];
                item.amount += victory.cnt;
                item.ratio = Math.floor((victory.cnt/item.amount) * 1000)/10;
            }
        }

        const list = new Array<any>();

        for (const id in listRatio) {
            const item = listRatio[id];
            if (item.amount >= 5) {
                list.push(item);
            }
        }

        list.sort((a:any, b:any) => b.ratio - a.ratio);

        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} win ratio ${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.ratio}% - ${item.name} (${item.discordName})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopDamageDoneEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_DAMAGE_LIST(true, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste schade gedaan${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.sumd} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopDamageReceivedEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_DAMAGE_LIST(false, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste schade gekregen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.sumd} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopCritsDoneEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_CRIT_LIST(true, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste crits gedaan${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopCritsReceivedEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Attack.GET_TOP_CRIT_LIST(false, battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste crits gekregen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopHealsDoneEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Heal.GET_TOP_HEALS_DONE_LIST(battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste heals gedaan${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopHealingDoneEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Heal.GET_TOP_HEALING_DONE_LIST(battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste healing gedaan${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.sumh} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopHealsReceivedEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Heal.GET_TOP_HEALS_RECEIVED_LIST(battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste heals gekregen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopHealingReceivedEmbed(topListType:TopListType, battleId?:string) {
        const list:any = await Heal.GET_TOP_HEALING_RECEIVED_LIST(battleId);
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste healing gekregen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.sumh} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopPuzzlesSolvedEmbed() {
        const list:any = await Puzzle.GET_TOP_SOLVED_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste puzzels opgelost`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopFastestPuzzlesSolvedEmbed(all:boolean) {
        const list:any = await Puzzle.GET_TOP_FASTEST_SOLVED_LIST();
        const amount = Math.min(25, list.length);
        const embed = new MessageEmbed()

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            item.duration = Math.ceil((item.solving_date.getTime() - item.creation_date.getTime())/1000);
        }

        list.sort((a:any, b:any) => a.duration - b.duration);

        const seenNames:any = {};

        var count = 0;
        for (let i = 0; i < amount; i++) {
            const item = list[i];
            if (!all && seenNames[item.name + item.discord_name]) {
                continue;
            }

            count += 1;

            seenNames[item.name + item.discord_name] = true;

            listString += `${i+1}. ${Utils.GetSecondsInMinutesAndSeconds(item.duration)} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setTitle(`Top ${count} puzzels het snelst opgelost`);

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopUniqueCards() {
        const list:any = await Character.GET_TOP_CARD_LIST();
        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste unieke kaarten in bezit`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopInspiresDone(topListType:TopListType, battleId?:string) {
        var list:any = null;

        if (topListType == TopListType.All) {
            list = await Log.GET_TOP_ALL_INSPIRES_DONE();
        } else {
            list = await Log.GET_TOP_INSPIRES_DONE(battleId);
        }

        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste inspires gedaan${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.discord_name}\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopInspiresGet(topListType:TopListType, battleId?:string) {
        var list:any = null;

        if (topListType == TopListType.All) {
            list = await Log.GET_TOP_ALL_INSPIRES_GET();
        } else {
            list = await Log.GET_TOP_INSPIRES_GET(battleId);
        }

        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste inspires gekregen${topListType == TopListType.Current ? ' in dit gevecht' : topListType == TopListType.Previous ? ' in het vorige gevecht' : ''}`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.name} (${item.discord_name})\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopCardsReceivedByPieces() {
        var list = await Log.GET_TOP_CARD_RECEIVED_BY_PIECES();

        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste kaarten door kaartstukjes te graven`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.discord_name}\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static async GetTopCardsTaken() {
        var list = await Log.GET_TOP_CARD_TAKEN();

        const embed = new MessageEmbed()
            .setTitle(`Top ${list.length} meeste kaarten afgepakt`);

        var listString = '';

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            listString += `${i+1}. ${item.cnt} - ${item.discord_name}\n`;
        }

        embed.setDescription(listString);

        return embed;
    }

    public static GetResetCharacterWarningEmbed() {
        const embed = new MessageEmbed();
        embed.setTitle('WAARSCHUWING')
            .setColor(SettingsConstants.COLORS.BAD)
            .setDescription('Weet je zeker dat je wilt stoppen met je huidige character?\n**Je kan dit niet ongedaan maken**\n\
Je zal een nieuw character moeten maken die **begint vanaf level 1 met 0 XP**.\n\n\
Als je zeker weet dat je wilt stoppen met dit character, gebruik dan het commando `;ikweetzekerdatikwilstoppenmetditcharacter`');

        return embed;
    }

    public static GetStoryEmbed(text:string, imageUrl:string, thumbnail?:string) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Verhaal')
            .setDescription(text)
            .setImage(imageUrl);

        if (thumbnail != null) {
            embed.setThumbnail(thumbnail);
        }

        return embed;
    }

    private static AddEquipmentToEmbed(embed:MessageEmbed, equipment:Array<Card>) {
        if (equipment.length == 0) {
            embed.addField('Leeg', 'Voeg equipment toe met `;equip [kaart]`.');
        }

        for (const card of equipment) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }
    }

    private static async AddCharacterHistoryToEmbed(embed:MessageEmbed, character:Character) {
        const victories = await character.GetVictories();
        const losses = await character.GetLosses();

        embed.addField('Monsters', await character.GetBattles(), true)
            .addField('Aanvallen', parseInt(victories) + parseInt(losses), true)
            .addField('Gewonnen', victories, true)
            .addField('Verloren', losses, true)
            .addField('Schade gedaan', await character.GetTotalDamageDone(), true)
            .addField('Schade gekregen', await character.GetTotalDamageTaken(), true)
            .addField('Crits gedaan', await character.GetTotalCritsDone(), true)
            .addField('Crits gekregen', await character.GetTotalCritsTaken(), true)
            .addField('Regenerated', character.GetRegenerated(), true)
            .addField('Geslapen', character.GetSleepAmount(), true)

        if (character.CanHeal()) {
            embed.addField('Heals gedaan', await character.GetTotalHealsDone(), true);
            embed.addField('Healing gedaan', await character.GetTotalHealingDone(), true);
        }

        embed.addField('Heals gekregen', await character.GetTotalHealsReceived(), true)
            .addField('Healing gekregen', await character.GetTotalHealingReceived(), true)

        if (character.CanInspire()) {
            embed.addField('Geïnspireerd', await character.GetTotalInspiresDone(), true);
        }

        embed.addField('Puzzels opgelost', await character.GetTotalPuzzlesSolved(), true);
    }

}