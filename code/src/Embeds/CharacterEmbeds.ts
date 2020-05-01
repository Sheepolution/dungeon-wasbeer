import { MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import CardService from '../Services/CardService';
import Character from '../Objects/Character';
import Card from '../Objects/Card';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterService from '../Services/CharacterService';

export default class CharacterEmbeds {

    public static GetModifierStatsEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`De statistieken van ${character.GetName()}`)
            .addField('Health', `${character.GetCurrentHealth()}/${character.GetMaxHealth()}`, true)
            .addField('XP', `${character.GetXP()}`, true)
            .addField('Level', `${character.GetLevel()}`, true);

        const modifiers = character.GetFullModifierStats();

        if (modifiers.charisma != null) {
            embed.addField('Armor', `+${modifiers.armor}`, true);
        }

        if (modifiers.dexterity != null) {
            embed.addField('Dexterity', `+${modifiers.dexterity}`, true);
        }

        if (modifiers.healing != null) {
            embed.addField('Healing', `+${modifiers.healing}`, true);
        }

        if (modifiers.regeneration != null) {
            embed.addField('Regeneration', `+${modifiers.regeneration}`, true);
        }

        if (modifiers.strength != null) {
            embed.addField('Strength', `+${modifiers.strength}`, true);
        }

        if (modifiers.spell != null) {
            embed.addField('Spell attack', `+${modifiers.spell}`, true);
        }

        return embed;
    }

    public static GetEquipmentEmbed(character:Character) {
        const equipment = character.GetEquipment();
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`De equipment van Sheepolution (${equipment.length}/${character.GetTotalEquipmentSpace()})`);
        this.AddEquipmentToEmbed(embed, equipment);
        return embed;
    }

    public static GetNewCharacterEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .setTitle(`${character.GetName()}`)

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
            .addField('Monsters', await character.GetBattles(), true)
            .addField('Gewonnen', await character.GetVictories(), true)
            .addField('Verloren', await character.GetLosses(), true)
            .addField('Schade gedaan', await character.GetTotalDamageGiven(), true)
            .addField('Schade gekregen', await character.GetTotalDamageTaken(), true);

        if (character.CanHeal()) {
            embed.addField('Healing gedaan', await character.GetTotalHealingDone(), true);
        }

        embed.addField('Raadsels opgelost', 0, true)
            .addField('-----------------------------', 'Equipment')

        this.AddEquipmentToEmbed(embed, character.GetEquipment());

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
            .setDescription(`${character.GetName()} rollt om ${receiver == character ? 'zichzelf' : receiver.GetName()} te healen.\n\n-- Statistieken --`)
            .addField(`Health van ${receiverName}`, `${receiver.GetCurrentHealth()}/${receiver.GetMaxHealth()}`)
            .addField(`Healing van ${characterName}`, `${character.GetFullModifierStats().healing}`)
            .addField('--------------------------------', '-- Roll --');

        if (roll == null)  {
            embed.addField(characterName, 'Rollt de D20...')
        } else {
            embed.addField(characterName, `D20 = ${roll}`)
                .addField('--------------------------------', '-- Resultaat --')

            if (healing == 0) {
                embed.addField(`${characterName} faalt met healen!`, 'Je healt per ongeluk een steen. Er gebeurt weinig.');
            } else {
                embed.addField(`${characterName} slaagt er in te healen`, `${characterName} krijgt ${healing} health terug.`);
            }
        }

        return embed;
    }

    public static AddEquipmentToEmbed(embed:MessageEmbed, equipment:Array<Card>) {
        if (equipment.length == 0) {
            embed.addField('Empty', '-');
        }
        for (const card of equipment) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }
    }
}