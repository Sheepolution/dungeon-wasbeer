import SettingsConstants from '../Constants/SettingsConstants';
import Monster from '../Objects/Monster';
import { MessageEmbed } from 'discord.js';

export default class MonsterEmbeds {

    public static GetMonsterEmbed(monster:Monster) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.MONSTER)
            .setAuthor(monster.GetCategory(), 'https://cdn.discordapp.com/attachments/694331679204180029/698606955496734781/unknown.png')
            .setTitle(monster.GetName())
            .setDescription(monster.GetDescription())
            .setImage(monster.GetImageUrl())
            .addField('Level', monster.GetLevelString())
            .addField('Health', monster.GetHealth(), true)
            .addField('Attack', monster.GetAttackRoll(), true)

        return embed;
    }
}