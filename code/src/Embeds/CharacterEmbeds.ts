import { MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import CardService from '../Services/CardService';
import Character from '../Objects/Character';
import Card from '../Objects/Card';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterService from '../Services/CharacterService';

export default class CharacterEmbeds {

    public static GetCharacterInfoEmbed(character:Character) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`${character.GetName()}`)
            .setImage(CharacterService.GetClassImage(character.GetClass()))
            .addField('XP', `${character.GetXP()}`, true)
            .addField('Level', `${character.GetLevel()}`, true);

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

        embed.addField('-----------------------------', 'Equipment')
        this.AddEquipmentToEmbed(embed, character.GetEquipment());

        return embed;
    }

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
            embed.addField('Leeg', '-');
        }

        for (const card of equipment) {
            embed.addField(card.GetName(), CardService.ParseModifierArrayToEmbedString(card.GetModifiers()), true);
        }
    }
}