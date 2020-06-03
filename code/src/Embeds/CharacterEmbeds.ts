import { MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import CardService from '../Services/CardService';
import Character from '../Objects/Character';
import Card from '../Objects/Card';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterService from '../Services/CharacterService';
import { Utils } from '../Utils/Utils';

export default class CharacterEmbeds {

    public static async GetCharacterInfoEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .addField('XP', `${character.GetXP()}/${character.GetXPForNextLevel()}`, true)
            .addField('Level', character.GetLevel(), true);

        const modifiers = character.GetFullModifierStats();
        const modifiersClass = character.GetClassModifierStats();
        const modifiersCards = character.GetCardModifierStats();

        embed.addField('Health', `${character.GetCurrentHealth()}/${character.GetMaxHealth()} ${modifiersCards.health > 0 ? `(${modifiersClass.health}+${modifiersCards.health})` : ''}`, true)
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

    public static async GetCharacterStatsEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')}`)
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .addField('XP', `${character.GetXP()}/${character.GetXPForNextLevel()}`, true)
            .addField('Level', character.GetLevel(), true);

        const modifiers = character.GetFullModifierStats();
        const modifiersClass = character.GetClassModifierStats();
        const modifiersCards = character.GetCardModifierStats();

        embed.addField('Health', `${character.GetCurrentHealth()}/${character.GetMaxHealth()} ${modifiersCards.health > 0 ? `(${modifiersClass.health}+${modifiersCards.health})` : ''}`, true)
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
            .setTitle(`De equipment van ${character.GetName()}${(character.IsInspired() ? ' ✨' : '')} (${equipment.length}/${character.GetTotalEquipmentSpace()})`);
        this.AddEquipmentToEmbed(embed, equipment);
        return embed;
    }

    public static GetNewCharacterEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .setTitle(character.GetName())

        return embed;
    }

    public static async GetDeadCharacterEmbed(character:Character) {
        const victories = await character.GetVictories();
        const losses = await character.GetLosses();

        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.BAD)
            .setImage(CharacterConstants.CHARACTER_DIED)
            .setTitle(`RIP ${character.GetName()}\n${character.GetBornDateString()} - ${character.GetDeathDateString()}`)
            .setDescription('--------------------')
            .addField('Level', character.GetLevel(), true)
            .addField('XP', character.GetXP(), true)
            .addField('Monsters', await character.GetBattles(), true)
            .addField('Gevechten', parseInt(victories) + parseInt(losses), true)
            .addField('Gewonnen', victories, true)
            .addField('Verloren', losses, true)
            .addField('Schade gedaan', await character.GetTotalDamageGiven(), true)
            .addField('Schade gekregen', await character.GetTotalDamageTaken(), true);

        if (character.CanHeal()) {
            embed.addField('Healing gedaan', await character.GetTotalHealingDone(), true);
        }

        embed.addField('Puzzels opgelost', 0, true)

        const equipment = character.GetEquipment();
        if (equipment.length > 0) {
            embed.addField('-----------------------------', 'Equipment');
            this.AddEquipmentToEmbed(embed, equipment);
        }

        return embed;
    }

    public static GetHealingEmbed(character:Character, receiver:Character, roll?:number, healing?:number) {
        const embed = new MessageEmbed();
        if (healing != null) {
            embed.setColor(healing == 0 ? SettingsConstants.COLORS.BAD : SettingsConstants.COLORS.GOOD)
        } else {
            embed.setColor(SettingsConstants.COLORS.DEFAULT)
        }

        const characterName = character.GetName();
        const receiverName = receiver.GetName();

        embed.setTitle('Healing roll')
            .setDescription(`${character.GetName()}${(character.IsInspired() ? ' ✨' : '')} rollt om ${receiver == character ? 'zichzelf' : receiver.GetName()}${(character.IsInspired() ? ' ✨' : '')} te healen.\n\n-- Statistieken --`)
            .addField(`Health van ${receiverName}`, `${receiver.GetCurrentHealth()}/${receiver.GetMaxHealth()}`)
            .addField(`Healing van ${characterName}`, character.GetFullModifierStats().healing)
            .addField('--------------------------------', '-- Roll --');

        if (roll == null)  {
            embed.addField(characterName, 'Rollt de D20...')
        } else {
            embed.addField(characterName, `D20 = ${roll}`)
                .addField('--------------------------------', '-- Resultaat --')

            if (healing == 0) {
                embed.addField(`${characterName} faalt met healen!`, 'Je healt per ongeluk een steen. Er gebeurt weinig.');
            } else {
                embed.addField(`${characterName} slaagt er in te healen`, `${receiverName} krijgt ${healing} health terug.`);
            }
        }

        return embed;
    }

    public static GetResetCharacterWarningEmbed() {
        var embed = new MessageEmbed();
        embed.setTitle('WAARSCHUWING')
            .setColor(SettingsConstants.COLORS.BAD)
            .setDescription('Weet je zeker dat je wilt stoppen met je huidige character?\n**Je kan dit niet ongedaan maken**\n\
Je zal een nieuw character moeten maken die **begint vanaf level 1 met 0 XP**.\n\n\
Als je zeker weet dat je wilt stoppen met dit character, gebruik dan het commando `;ikweetzekerdatikwilstoppenmetditcharacter`');

        return embed;
    }

    public static AddEquipmentToEmbed(embed:MessageEmbed, equipment:Array<Card>) {
        if (equipment.length == 0) {
            embed.addField('Leeg', 'Voeg equipment toe met `;equip [kaart]`.');
        }

        for (const card of equipment) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }
    }
}