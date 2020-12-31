import Battle from '../Objects/Battle';
import Character from '../Objects/Character';
import SettingsConstants from '../Constants/SettingsConstants';
import { Utils } from '../Utils/Utils';
import { MessageEmbed } from 'discord.js';

export default class BattleEmbeds {

    public static GetBattleInfoEmbed(battle:Battle) {
        const monster = battle.GetMonster();

        var attackStrength:string|number = monster.GetAttackStrength();
        var attackRoll:string|number = monster.GetAttackRoll();

        const monsterId = monster.GetId();

        if (monsterId == 'fedbc712-557b-414e-ac05-0f283682cb1a' || monsterId == '50a3d80c-80b9-49a9-9411-0953d12422b1' || monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            attackStrength = '???';
            if (monsterId != 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
                attackRoll = '???';
            }
        }

        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.MONSTER)
            .setAuthor(monster.GetCategory(), 'https://cdn.discordapp.com/attachments/694331679204180029/698606955496734781/unknown.png')
            .setTitle(monster.GetName())
            .setDescription(monster.GetDescription())
            .setImage(battle.GetMonsterImageUrl())
            .addField('Level', monster.GetLevelString())
            .addField('Health', `${battle.GetCurrentMonsterHealth()}/${monster.GetHealth()}`, true)
            .addField('Strength', attackStrength, true)
            .addField('Attack', attackRoll, true)

        return embed;
    }

    public static async GetBattleEmbed(battle:Battle, character:Character, roll1?:number, roll2?:number, roll3?:number, roll4?:number, playerWon?:boolean, damage?:number, crit?:boolean) {
        const monster = battle.GetMonster();

        const characterName = character.GetName();
        const characterAttack = character.GetAttackRoll();
        const characterStrength = character.GetAttackStrength();
        const monsterName = monster.GetName();
        const monsterAttack = battle.GetMonsterAttackRoll();
        var monsterStrength:string|number = battle.GetMonsterAttackStrength();

        if (monster.GetId() == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            monsterStrength = '???';
        }

        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor('Aanval')
            .setThumbnail(playerWon ? character.GetAvatarUrl() : battle.GetMonsterImageUrl())
            .setTitle(`${characterName}${character.GetEnhancementsString()} VS ${monsterName}`)
            .setDescription('-- Statistieken --')
            .addField(characterName, `Health: ${character.GetCurrentHealth()}/${character.GetMaxHealth()}\n${character.GetAttackName()}: ${characterStrength}\nAttack: ${characterAttack}\nArmor: ${character.GetArmor()}`, true)
            .addField(monsterName, `Health: ${battle.GetCurrentMonsterHealth()}/${battle.GetMaxMonsterHealth()}\nStrength: ${monsterStrength}\nAttack: ${monsterAttack}`, true)
            .addField('--------------------------------', '-- Rolls --');

        if (roll1 != null && roll2 != null) {
            var message;

            if (roll1 > 0) {
                message = `D20 = ${roll1}`;
            }

            if (characterAttack > 1 && roll2 > 0) {
                message += `\nD${characterAttack} = ${roll2}`;
            }

            embed.addField(characterName, message += `\nTotaal = ${roll1 + roll2}`, true);

            if (roll3 != null && roll4 != null) {
                message = '';
                if (roll3 > 0) {
                    message = `D20 = ${roll3}`;
                }

                if (monsterAttack > 1 && roll4 > 0) {
                    message += `\nD${monsterAttack} = ${roll4}`;
                }

                if (message.length > 0) {
                    embed.addField(monsterName, message + `\nTotaal = ${roll3 + roll4}`, true);
                } else {
                    embed.addField(monsterName, 'Geen rolls.', true);
                }
            } else if (roll3 != null) {
                message = `D20 = ${roll3}`;
                if (monsterAttack > 1) {
                    message += `\nRolt de D${monsterAttack}...`;
                }
                embed.addField(monsterName, message, true);
            } else {
                embed.addField(monsterName, 'Rolt de D20...', true);
            }
        } else if (roll1 != null) {
            message = `D20 = ${roll1}`;
            if (characterAttack > 1) {
                message += `\nRolt de D${characterAttack}...`;
            }

            embed.addField(characterName, message, true);
        } else {
            embed.addField(characterName, 'Rolt de D20...', true);
        }

        if (playerWon != null) {
            embed.setFooter(`Participatiepunten: ${character.GetRewardPoints(battle.GetId())}/${character.GetNextRewardPoints()}`);

            embed.addField('--------------------------------', '-- Resultaat --');
            if (playerWon) {
                var attackDescription = character.GetAttackDescription(crit);
                if (!attackDescription.includes('[damage]')) {
                    attackDescription += '\nJe doet [damage] damage op de [monster].'
                }
                embed.addField(`${characterName} wint${crit ? ' met een crit' : ''}!`, attackDescription.replaceAll('\\[damage\\]', damage?.toString() || '').replaceAll('\\[monster\\]', monsterName || ''));
                embed.setColor(SettingsConstants.COLORS.GOOD)
            } else {
                var attackDescription = crit ? battle.GetMonsterAttackCritDescription() : battle.GetMonsterAttackDescription();
                if (!attackDescription.includes('[damage]')) {
                    attackDescription += '\nHij doet [damage] damage.'
                }

                if (monster.GetId() == '7e476ee1-c32a-426b-b278-a03d6f85f164') {
                    const missing = Math.ceil(monster.GetHealth() / 1000) - Math.ceil(battle.GetCurrentMonsterHealth() / 1000);
                    const heads = Math.min(2 + missing, 7);
                    attackDescription = attackDescription.replaceAll('\\[heads\\]', heads.toString());
                }

                embed.addField(`De ${monsterName} wint${crit ? ' met een crit' : ''}!`, attackDescription.replaceAll('\\[damage\\]', damage?.toString() || '') );
                embed.setColor(SettingsConstants.COLORS.BAD)
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

            if (character.CanEnchant()) {
                const inspiringCooldown = await character.GetEnchantmentCooldown();
                if (inspiringCooldown > 0) {
                    embed.addField('Enchantment', `🕒 ${Utils.GetSecondsInMinutesAndSeconds(inspiringCooldown)}`, true)
                } else {
                    embed.addField('Enchantment', 'Klaar om te enchantment spelen!', true);
                }
            }
        }

        return embed;
    }
}