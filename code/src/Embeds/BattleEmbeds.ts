import Battle from '../Objects/Battle';
import Character from '../Objects/Character';
import SettingsConstants from '../Constants/SettingsConstants';
import { Utils } from '../Utils/Utils';
import { EmbedBuilder } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';

export default class BattleEmbeds {

    public static GetBattleInfoEmbed(battle: Battle) {
        const monster = battle.GetMonster();

        var monsterName = monster.GetName();

        var attackStrength: string | number = monster.GetAttackStrength();
        var attackRoll: string | number = monster.GetAttackRoll();

        const monsterId = monster.GetId();

        if (monster.GetId() == '3125ae9e-d51b-4cf0-a964-d92cf4f711ac') {
            monsterName = `${monsterName} ${EmojiConstants.DNW_STATES.ENCHANTED}`;
        }

        if (monsterId == 'fedbc712-557b-414e-ac05-0f283682cb1a' || monsterId == '50a3d80c-80b9-49a9-9411-0953d12422b1' || monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            attackStrength = '???';
            if (monsterId != 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
                attackRoll = '???';
            }
        }

        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.MONSTER)
            .setAuthor({name: monster.GetCategory(), iconURL:'https://cdn.discordapp.com/attachments/694331679204180029/698606955496734781/unknown.png'})
            .setTitle(monsterName)
            .setDescription(monster.GetDescription())
            .setImage(battle.GetMonsterImageUrl())
            .addFields({name: 'Level', value: monster.GetLevelString()})
            .addFields({name: 'Health', value: `${battle.GetCurrentMonsterHealth()}/${monster.GetHealth()}`, inline: true})
            .addFields({name: 'Strength', value: `${attackStrength}`, inline: true})
            .addFields({name: 'Attack', value: `${attackRoll}`, inline: true});

        return embed;
    }

    public static async GetBattleEmbed(battle: Battle, character: Character, roll1?: number, roll2?: number, roll3?: number, roll4?: number, playerWon?: boolean, damage?: number, crit?: boolean) {
        const monster = battle.GetMonster();

        const characterName = character.GetName();
        const characterAttack = character.GetAttackRoll();
        const characterStrength = character.GetAttackStrength();
        const monsterName = monster.GetName();
        const monsterAttack = battle.GetMonsterAttackRoll();
        var monsterStrength: string | number = battle.GetMonsterAttackStrength();

        const monsterId = monster.GetId();

        if (monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            monsterStrength = '???';
        }

        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({name: 'Aanval'})
            .setThumbnail(playerWon ? character.GetAvatarUrl() : battle.GetMonsterImageUrl())
            .setTitle(`${characterName}${character.GetEnhancementsString()} VS ${monsterName}${monsterId == '3125ae9e-d51b-4cf0-a964-d92cf4f711ac' ? ` ${EmojiConstants.DNW_STATES.ENCHANTED}` : ''}`)
            .setDescription('-- Statistieken --')
            .addFields({name: characterName, value: `Health: ${character.GetCurrentHealth() + character.GetProtection()}/${character.GetMaxHealth()}\n${character.GetAttackName()}: ${characterStrength}\nAttack: ${characterAttack}\nArmor: ${character.GetArmor()}`, inline: true})
            .addFields({name: monsterName, value: `Health: ${battle.GetCurrentMonsterHealth()}/${battle.GetMaxMonsterHealth()}\nStrength: ${monsterStrength}\nAttack: ${monsterAttack}`, inline: true})
            .addFields({name: '--------------------------------', value: '-- Rolls --'});

        if (roll1 != null && roll2 != null) {
            var message;

            if (roll1 > 0) {
                message = `D20 = ${roll1}`;
            }

            if (characterAttack > 1 && roll2 > 0) {
                message += `\nD${characterAttack} = ${roll2}`;
            }

            embed.addFields({name: characterName, value: message += `\nTotaal = ${roll1 + roll2}`, inline: true});

            if (roll3 != null && roll4 != null) {
                message = '';
                if (roll3 > 0) {
                    message = `D20 = ${roll3}`;
                }

                if (monsterAttack > 1 && roll4 > 0) {
                    message += `\nD${monsterAttack} = ${roll4}`;
                }

                if (message.length > 0) {
                    embed.addFields({name: monsterName, value: message + `\nTotaal = ${roll3 + roll4}`, inline: true});
                } else {
                    embed.addFields({name: monsterName, value: 'Geen rolls.', inline: true});
                }
            } else if (roll3 != null) {
                message = `D20 = ${roll3}`;
                if (monsterAttack > 1) {
                    message += `\nRolt de D${monsterAttack}...`;
                }
                embed.addFields({name: monsterName, value: message, inline: true});
            } else {
                embed.addFields({name: monsterName, value: 'Rolt de D20...', inline: true});
            }
        } else if (roll1 != null) {
            message = `D20 = ${roll1}`;
            if (characterAttack > 1) {
                message += `\nRolt de D${characterAttack}...`;
            }

            embed.addFields({name: characterName, value: message,inline: true});
        } else {
            embed.addFields({name: characterName, value: 'Rolt de D20...', inline: true});
        }

        if (playerWon != null) {
            embed.setFooter({text: `Participatiepunten: ${character.GetRewardPoints(battle.GetId())}/${character.GetNextRewardPoints()}`});

            embed.addFields({name: '--------------------------------', value: '-- Resultaat --'});
            if (playerWon) {
                var attackDescription = character.GetAttackDescription(crit);
                if (!attackDescription.includes('[damage]')) {
                    attackDescription += '\nJe doet [damage] damage op de [monster].';
                }
                embed.addFields({name: `${characterName} wint${crit ? ' met een crit' : ''}!`, value: attackDescription.replaceAll('\\[damage\\]', damage?.toString() || '').replaceAll('\\[monster\\]', monsterName || '')});
                embed.setColor(SettingsConstants.COLORS.GOOD);
            } else {
                var attackDescription = crit ? battle.GetMonsterAttackCritDescription() : battle.GetMonsterAttackDescription();
                if (!attackDescription.includes('[damage]')) {
                    attackDescription += '\nHij doet [damage] damage.';
                }

                if (monster.GetId() == '7e476ee1-c32a-426b-b278-a03d6f85f164') {
                    const missing = Math.ceil(monster.GetHealth() / 1000) - Math.ceil(battle.GetCurrentMonsterHealth() / 1000);
                    const heads = Math.min(2 + missing, 7);
                    attackDescription = attackDescription.replaceAll('\\[heads\\]', heads.toString());
                }

                embed.addFields({name: `De ${monsterName} wint${crit ? ' met een crit' : ''}!`, value: attackDescription.replaceAll('\\[damage\\]', damage?.toString() || '')});
                embed.setColor(SettingsConstants.COLORS.BAD);
            }

            embed.addFields({name: '--------------------------------', value: '-- Cooldown(s) --'});

            const battleCooldown = await character.GetBattleCooldown();
            if (battleCooldown > 0) {
                embed.addFields({name: 'Vechten', value: `🕒 ${Utils.GetSecondsInMinutesAndSeconds(battleCooldown)}`,inline: true});
            } else {
                embed.addFields({name: 'Vechten', value: 'Klaar om te vechten!', inline: true});
            }

            if (character.CanHeal()) {
                const healingCooldown = await character.GetHealingCooldown();
                if (healingCooldown > 0) {
                    embed.addFields({name: 'Healen', value: `🕒 ${Utils.GetSecondsInMinutesAndSeconds(healingCooldown)}`,inline: true});
                } else {
                    embed.addFields({name: 'Healen', value: 'Klaar om te healen!', inline: true});
                }
            }

            if (character.CanInspire()) {
                const inspiringCooldown = await character.GetInspireCooldown();
                if (inspiringCooldown > 0) {
                    embed.addFields({name: 'Inspireren', value: `🕒 ${Utils.GetSecondsInMinutesAndSeconds(inspiringCooldown)}`, inline: true});
                } else {
                    embed.addFields({name: 'Inspireren', value: 'Klaar om een mooi lied te spelen!', inline: true});
                }
            }

            if (character.CanEnchant()) {
                const enchantingCooldown = await character.GetEnchantmentCooldown();
                if (enchantingCooldown > 0) {
                    embed.addFields({name: 'Enchantment', value: `🕒 ${Utils.GetSecondsInMinutesAndSeconds(enchantingCooldown)}`, inline: true});
                } else {
                    embed.addFields({name: 'Enchantment', value: 'Klaar voor een enchantment!', inline: true});
                }
            }

            if (character.CanPercept()) {
                const perceptingCooldown = await character.GetPerceptionCooldown();
                if (perceptingCooldown > 0) {
                    embed.addFields({name: 'Perception check', value:`🕒 ${Utils.GetSecondsInMinutesAndSeconds(perceptingCooldown)}`, inline:true});
                } else {
                    embed.addFields({name:'Perception check', value:'Klaar voor een perception check!', inline:true});
                }
            }

            if (character.CanReinforce()) {
                const reinforcementCooldown = await character.GetReinforcementCooldown();
                if (reinforcementCooldown > 0) {
                    embed.addFields({name: 'Reinforcement', value:`🕒 ${Utils.GetSecondsInMinutesAndSeconds(reinforcementCooldown)}`, inline:true});
                } else {
                    embed.addFields({name:'Reinforcement', value:'Klaar om te reinforcen!', inline:true});
                }
            }

            if (character.CanProtect()) {
                const protectCooldown = await character.GetProtectCooldown();
                if (protectCooldown > 0) {
                    embed.addFields({name:'Protection', value:`🕒 ${Utils.GetSecondsInMinutesAndSeconds(protectCooldown)}`, inline:true});
                } else {
                    embed.addFields({name:'Protection', value:'Klaar om te protecten!', inline:true});
                }
            }
        }

        return embed;
    }
}