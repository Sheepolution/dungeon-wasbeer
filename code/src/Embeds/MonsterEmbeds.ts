import SettingsConstants from '../Constants/SettingsConstants';
import Monster from '../Objects/Monster';
import { EmbedBuilder } from 'discord.js';

export default class MonsterEmbeds {

    public static GetMonsterEmbed(monster: Monster) {
        var attackStrength: string | number = monster.GetAttackStrength();
        var attackRoll: string | number = monster.GetAttackRoll();

        const monsterId = monster.GetId();

        if (monsterId == 'fedbc712-557b-414e-ac05-0f283682cb1a' || monsterId == '50a3d80c-80b9-49a9-9411-0953d12422b1' || monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            attackStrength = '???';
            if (monsterId != 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
                attackRoll = '???';
            }
        }

        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.MONSTER)
            .setAuthor({name: monster.GetCategory(), iconURL: 'https://cdn.discordapp.com/attachments/694331679204180029/698606955496734781/unknown.png'})
            .setTitle(monster.GetName())
            .setDescription(monster.GetDescription())
            .setImage(monster.GetImageUrl())
            .addFields({ name: 'Level', value: monster.GetLevelString() })
            .addFields({ name: 'Health', value: `${monster.GetHealth()}`, inline: true})
            .addFields({ name: 'Strength', value: `${attackStrength}`, inline: true})
            .addFields({ name: 'Attack', value: `${attackRoll}`, inline: true})

        return embed;
    }
}