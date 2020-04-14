import { MessageEmbed } from 'discord.js';
import Player from '../Objects/Player';
import SettingsConstants from '../Constants/SettingsConstants';
import CardService from '../Services/CardService';

export default class PlayerEmbeds {

    public static GetModifierStatsEmbed(player:Player) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`De statistieken van ${player.GetDiscordName()} de ${player.GetClassName()}`)
            .addField('Health', `${player.GetCurrentHealth()}/${player.GetMaxHealth()}`, true)
            .addField('XP', `${player.GetXP()}`, true)
            .addField('Level', `${player.GetLevel()}`, true);

        const modifiers = player.GetFullModifierStats();

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

    public static GetCardSlotsEmbed(player:Player) {
        const cardSlots = player.GetCardSlots();
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`De equipment van Sheepolution (${cardSlots.length}/${player.GetTotalCardSlots()})`);

        for (const card of cardSlots) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }

        return embed;
    }
}