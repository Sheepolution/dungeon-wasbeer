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
            .addField('Schade gekregen', await character.GetTotalDamageTaken(), true)
            .addField('Raadsels opgelost', 0, true)
            .addField('-----------------------------', 'Equipment')

        this.AddEquipmentToEmbed(embed, character.GetEquipment());

        return embed;
    }

    public static AddEquipmentToEmbed(embed:MessageEmbed, equipment:Array<Card>) {
        for (const card of equipment) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }
    }
}