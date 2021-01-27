import IMessageInfo from '../Interfaces/IMessageInfo';
import Player from '../Objects/Player';
import CampaignManager from '../Managers/CampaignManager';
import MessageService from '../Services/MessageService';
import BattleEmbeds from '../Embeds/BattleEmbeds';
import { Utils } from '../Utils/Utils';
import { Message } from 'discord.js';
import Battle from '../Objects/Battle';
import PlayerManager from '../Managers/PlayerManager';
import Character from '../Objects/Character';
import CharacterEmbeds from '../Embeds/CharacterEmbeds';
import Attack from '../Objects/Attack';
import { LogType } from '../Enums/LogType';
import EmojiConstants from '../Constants/EmojiConstants';
import LogService from '../Services/LogService';
import Charge from '../Objects/Charge';

export default class BattleHandler {

    private static waitList: Array<IMessageInfo> = new Array<IMessageInfo>();
    private static inBattle: boolean = false;
    private static inBattleTimeout: any;

    public static async OnCommand(messageInfo: IMessageInfo, player: Player, command: string) {
        switch (command) {
            case 'attack':
            case 'fight':
            case 'vecht':
            case 'vechten':
            case 'engage':
            case 'aanvallen':
            case 'v':
            case 'f':
                this.OnAttack(messageInfo, player);
                break;
            case 'charge':
            case 'charging':
                this.OnAttack(messageInfo, player, false, true);
                break;
            case 'battle':
            case 'monster':
            case 'gevecht':
                this.SendBattleInfo(messageInfo);
                break;
            default:
                return false;
        }

        return true;
    }

    public static IsInBattle() {
        return this.inBattle;
    }

    private static async OnAttack(messageInfo: IMessageInfo, player: Player, fromWaitlist?: boolean, charge?: boolean) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }

        if (character.IsInBattle() && !fromWaitlist) { return; }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            this.ReplyNoBattle(messageInfo);
            return;
        }

        if (battle.IsMonsterDead()) {
            this.ReplyMonsterDefeated(messageInfo);
            return;
        }

        if (character.IsHealing()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je bent momenteel aan het healen.', false);
            return;
        }

        if (character.IsBeingHealed()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je wordt momenteel geheald.', false);
            return;
        }

        if (character.IsInspiring()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je bent momenteel aan het inspireren.', false);
            return;
        }

        if (character.IsBeingInspired()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je wordt momenteel geïnspireerd.', false);
            return;
        }

        if (character.IsProtecting()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je bent momenteel aan het beschermen.', false);
            return;
        }

        if (character.IsBeingProtected()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je wordt momenteel beschermd.', false);
            return;
        }

        if (character.IsPraying()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je bent momenteel aan het bidden.', false);
            return;
        }

        const cooldown = await character.GetBattleCooldown();

        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag aanvallen.`);
            return;
        }

        if (charge) {
            if (!character.CanCharge()) {
                MessageService.ReplyMessage(messageInfo, `Alleen paladins kunnen chargen, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
                return;
            }

            if (character.IsProtecting()) {
                return;
            }

            const chargeCooldown = await character.GetChargeCooldown();
            if (chargeCooldown > 0) {
                MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(chargeCooldown)} cooldown voordat je weer mag chargen.`);
                return;
            }

        }

        if (!fromWaitlist) {
            if (BattleHandler.inBattle) {
                const fight = this.waitList.find(b => b.member.id == messageInfo.member.id);
                if (fight != null) {
                    messageInfo.message?.react(EmojiConstants.STATUS.BAD);
                    return;
                }

                character.SetInBattle(true);
                if (charge) {
                    character.SetIsCharging(true);
                }
                this.waitList.push(messageInfo);
                messageInfo.message?.react(EmojiConstants.STATUS.GOOD);
                return;
            }
        }

        character.SetInBattle(true);
        BattleHandler.inBattle = true;

        if (charge) {
            await this.OnCharge(messageInfo, character);
            await Utils.Sleep(2);
        } else {
            await character.SetBattleCooldown();
        }

        const monster = battle.GetMonster();
        const monsterId = monster.GetId();

        if (monsterId == 'fedbc712-557b-414e-ac05-0f283682cb1a') {
            const stats = character.GetFullModifierStatsWithoutInspire();
            monster.SetAttackStrength(stats.strength);
            monster.SetAttackRoll(stats.attack);
        } else if (monsterId == '50a3d80c-80b9-49a9-9411-0953d12422b1') {
            monster.SetAttackStrength(Utils.Random(5, 30, true));
            monster.SetAttackRoll(Utils.Random(5, 30, true));
        }

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
        }

        this.inBattleTimeout = setTimeout(() => {
            BattleHandler.inBattle = false;
            this.waitList = [];
            this.inBattleTimeout = null;
            character.SetInBattle(false);
            character.RemoveBattleCooldown();
        }, Utils.GetMinutesInMiliSeconds(1));

        // Start attack
        var secondAttack = false;

        const message = await this.SendBattleEmbed(messageInfo, battle, character);
        if (message == null) {
            return;
        }

        await Utils.Sleep(3);
        const roll1 = Utils.Dice(20);
        if (roll1 == 1) {
            this.OnMonsterCrit(messageInfo, message, battle, character, roll1, undefined, undefined)
            return
        } else if (roll1 == 20) {
            this.OnCharacterCrit(messageInfo, message, battle, character, roll1, undefined, undefined)
            return
        }

        const playerAttackRoll = character.GetAttackRoll();
        var roll2 = playerAttackRoll;
        if (playerAttackRoll > 1) {
            await this.UpdateBattleEmbed(message, battle, character, roll1);
            await Utils.Sleep(3);
            roll2 = Utils.Dice(playerAttackRoll);
        }

        if (character.IsEnchanted()) {
            const secondRoll2 = Utils.Dice(playerAttackRoll);
            var lowestRoll = 0;
            if (secondRoll2 < roll2) {
                lowestRoll = secondRoll2;
            } else {
                lowestRoll = roll2;
                roll2 = secondRoll2;
            }
            if (lowestRoll != roll2) {
                await this.UpdateBattleEmbed(message, battle, character, roll1, lowestRoll);
                await Utils.Sleep(1.5);
            }
        }

        do {
            await this.UpdateBattleEmbed(message, battle, character, roll1, roll2);
            await Utils.Sleep(3);

            const roll3 = Utils.Dice(20);

            if (roll3 == 20) {
                this.OnMonsterCrit(messageInfo, message, battle, character, roll1, roll2, roll3)
                return
            } else if (roll3 == 1) {
                this.OnCharacterCrit(messageInfo, message, battle, character, roll1, roll2, roll3)
                return
            }

            const monsterAttackRoll = battle.GetMonsterAttackRoll();
            var roll4 = monsterAttackRoll;
            if (monsterAttackRoll > 1) {
                await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3);
                await Utils.Sleep(3);
                roll4 = Utils.Dice(monsterAttackRoll);
            }

            var playerWon = roll1 + (roll2 || 0) >= roll3 + (roll4 || 0);
            if (monsterId == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
                playerWon = !playerWon;
            }

            if (playerWon && !secondAttack && monsterId == 'fb835c7f-0eea-402f-97a2-e4f9cdd7fc35') {
                secondAttack = true;
            } else {
                var playerStrength = character.GetAttackStrength();
                if (playerWon && character.IsReinforced()) {
                    var reinforcementAddition = 0;
                    if (monsterId == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
                        reinforcementAddition = Math.ceil(((roll3 + (roll4 || 0)) - (roll1 + (roll2 || 0))) / 2);
                        reinforcementAddition -= ((monsterAttackRoll - playerAttackRoll) / 60) * reinforcementAddition;
                    } else {
                        reinforcementAddition = Math.ceil(((roll1 + (roll2 || 0)) - (roll3 + (roll4 || 0))) / 2);
                        reinforcementAddition -= ((playerAttackRoll - monsterAttackRoll) / 60) * reinforcementAddition;
                    }

                    playerStrength = Math.min(playerStrength + Math.ceil(reinforcementAddition), character.GetAttackStrength(true));
                }

                var monsterAttackStrength = battle.GetMonsterAttackStrength();
                if (!playerWon && monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
                    monsterAttackStrength = (roll3 + (roll4 || 0)) - (roll1 + (roll2 || 0));
                }

                const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? playerStrength : monsterAttackStrength, roll1, roll2 || 0, roll3, roll4 || 0);
                await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, roll4, playerWon, damage, false);
                secondAttack = false;
            }
        } while (secondAttack);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }

        await this.UpdateStates(character);
    }

    private static async OnCharge(messageInfo: IMessageInfo, character: Character) {
        character.SetIsCharging(true);

        const message = await this.SendChargeEmbed(messageInfo, character);
        if (message == null) {
            return;
        }

        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const charge = character.GetChargeBasedOnRoll(roll);

        const oldArmor = character.GetFullModifierStats().armor;
        await character.BecomeCharged(charge);
        await this.UpdateChargeEmbed(message, character, roll, charge);
        await character.SetChargeCooldown();
        await character.SetBattleCooldown();

        this.SaveCharge(character, oldArmor, roll, charge);
    }

    private static async SaveAttack(battle: Battle, character: Character, messageId: string, rollCharacterBase: number, rollCharacterModifier: number, rollCharacterModifierMax: number, rollMonsterBase: number, rollMonsterModifier: number, rollMonsterModifierMax: number, victory: boolean, damage: number, healthAfter: number) {
        const attack = await Attack.STATIC_POST(battle, character, messageId, rollCharacterBase, rollCharacterModifier, rollCharacterModifierMax, rollMonsterBase, rollMonsterModifier, rollMonsterModifierMax, victory, damage, healthAfter);
        const crit = rollCharacterBase == 20 || rollCharacterBase == 1 || rollMonsterBase == 20 || rollMonsterBase == 1;
        if (healthAfter <= 0) {
            if (victory) {
                LogService.Log(character.GetPlayer(), attack.id, LogType.AttackKill, `${character.GetName()} heeft het monster '${battle.GetMonster().GetName()}' aangevallen en dit gevecht gewonnen${crit ? ' met een crit' : ''} en hiermee het monster gedood.`);
            } else {
                LogService.Log(character.GetPlayer(), attack.id, LogType.AttackKilled, `${character.GetName()} heeft het monster '${battle.GetMonster().GetName()}' aangevallen en dit gevecht verloren${crit ? ' met een crit' : ''} en is hierdoor gedood.`);
            }
        } else {
            LogService.Log(character.GetPlayer(), attack.id, victory ? LogType.AttackWon : LogType.AttackLost, `${character.GetName()} heeft het monster '${battle.GetMonster().GetName()}' aangevallen en dit gevecht ${victory ? 'gewonnen' : 'verloren'}${crit ? ' met een crit' : ''}.`);
        }
    }

    private static async SaveCharge(character: Character, characterArmor: number, roll: number, finalCharge: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const charge = await Charge.STATIC_POST(battle, character, characterArmor, roll, finalCharge);
        await LogService.Log(character.GetPlayer(), charge.id, LogType.Charge, `${character.GetName()} heeft een charge gedaan.`);
    }

    private static async OnCharacterCrit(messageInfo: IMessageInfo, message: Message, battle: Battle, character: Character, roll1: number, roll2: number = 0, roll3: number = 0) {
        var playerWon = true;
        if (battle.GetMonster().GetId() == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
            playerWon = false;
        }

        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? character.GetAttackStrength(true) : battle.GetMonsterAttackStrength(true), roll1, roll2, roll3, 0);
        await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, 0, playerWon, damage, true);
        await this.UpdateStates(character);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }
    }

    private static async OnMonsterCrit(messageInfo: IMessageInfo, message: Message, battle: Battle, character: Character, roll1: number, roll2: number = 0, roll3: number = 0) {
        var playerWon = false;
        const monsterId = battle.GetMonster().GetId();
        if (monsterId == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
            playerWon = true;
        }

        var playerStrength = character.GetAttackStrength(true);
        if (playerWon && character.IsReinforced()) {
            playerStrength += battle.GetMonsterAttackRoll();
        }

        var monsterAttackStrength = battle.GetMonsterAttackStrength(true);
        if (!playerWon && monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            monsterAttackStrength = 20 + battle.GetMonsterAttackRoll();
        }

        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? playerStrength : monsterAttackStrength, roll1, roll2, roll3, 0);
        await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, 0, playerWon, damage, true);
        await this.UpdateStates(character);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }
    }

    private static async ResolveAttackResult(messageInfo: IMessageInfo, message: Message, battle: Battle, character: Character, playerWon: boolean, damage: number, roll1: number, roll2: number, roll3: number, roll4: number) {
        if (playerWon) {
            var monsterId = battle.GetMonster().GetId();

            const receivedDamage = await battle.DealDamageToMonster(damage);
            await this.SaveAttack(battle, character, message.id, roll1, roll2, character.GetAttackRoll(), roll3, roll4, battle.GetMonsterAttackRoll(), true, receivedDamage, battle.GetCurrentMonsterHealth());

            character.SetInBattle(false);
            character.GiveDamagePoints(receivedDamage, battle.GetId(), messageInfo);

            if (battle.IsMonsterDead()) {
                BattleHandler.inBattle = false;
                this.OnDefeatingMonster(battle);
            } else {
                if (this.waitList.length == 0) {
                    BattleHandler.inBattle = false;
                } else {
                    this.ResolveWaitList();
                }
            }
            return receivedDamage;
        } else {
            const receivedDamage = await character.ReceiveDamage(damage);

            await this.SaveAttack(battle, character, message.id, roll1, roll2, character.GetAttackRoll(), roll3, roll4, battle.GetMonsterAttackRoll(), false, receivedDamage, character.GetCurrentHealth());

            var monsterId = battle.GetMonster().GetId();
            if (monsterId == '1a788fa2-11f0-45b2-8d70-8dff8f5843c9') {
                await battle.HealMonster(receivedDamage);
            }

            if (character.IsDead()) {
                this.OnDefeatingCharacter(messageInfo, character);
            } else {
                character.SetInBattle(false);
            }
            if (this.waitList.length == 0) {
                BattleHandler.inBattle = false;
            } else {
                this.ResolveWaitList();
            }
            return receivedDamage;
        }
    }

    private static async OnDefeatingMonster(battle: Battle) {
        await battle.Complete();
        await MessageService.SendMessageToDNDChannel(`De ${battle.GetMonster().GetName()} is verslagen! Iedereen die heeft meegeholpen in deze strijd heeft XP ontvangen.`)
        await CampaignManager.OnCompletingSession();
    }

    private static async OnDefeatingCharacter(messageInfo: IMessageInfo, character: Character) {
        await character.Kill();
        await Utils.Sleep(2);
        await MessageService.SendMessageToDNDChannel('', await CharacterEmbeds.GetDeadCharacterEmbed(character));
        await Utils.Sleep(3);
        await MessageService.ReplyMessage(messageInfo, 'Je character is dood. Je kan opnieuw beginnen door een class te kiezen met het commando `;class`.');
        LogService.Log(character.GetPlayer(), character.GetId(), LogType.CharacterDied, `${character.GetName()} is overleden.`);
    }

    private static async ResolveWaitList() {
        if (BattleHandler.waitList.length == 0) {
            return;
        }

        const nextBattle = BattleHandler.waitList.shift();
        if (nextBattle == null) {
            return;
        }

        const nextPlayer = await PlayerManager.GetPlayer(nextBattle?.member.id);
        await Utils.Sleep(3);
        this.OnAttack(<IMessageInfo>nextBattle, nextPlayer, true)
    }

    private static async ReplyNoBattle(messageInfo: IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Er is geen monster om tegen te vechten.', false);
    }

    private static async SendBattleInfo(messageInfo: IMessageInfo) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            this.ReplyNoBattle(messageInfo);
            return;
        }

        if (battle.IsMonsterDead()) {
            this.ReplyMonsterDefeated(messageInfo);
            return;
        }

        return await MessageService.ReplyEmbed(messageInfo, BattleEmbeds.GetBattleInfoEmbed(battle));
    }

    private static async ReplyMonsterDefeated(messageInfo: IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Het monster is al verslagen.', false);
    }

    private static async SendBattleEmbed(messageInfo: IMessageInfo, battle: Battle, character: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await BattleEmbeds.GetBattleEmbed(battle, character));
    }

    private static async SendChargeEmbed(messageInfo: IMessageInfo, character: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetChargingEmbed(character));
    }

    private static async UpdateBattleEmbed(message: Message, battle: Battle, character: Character, roll1?: number, roll2?: number, roll3?: number, roll4?: number, playerWon?: boolean, damage?: number, crit?: boolean) {
        await message.edit('', await BattleEmbeds.GetBattleEmbed(battle, character, roll1, roll2, roll3, roll4, playerWon, damage, crit));
    }

    private static async UpdateChargeEmbed(message: Message, character: Character, roll?: number, charge?: number) {
        await message.edit('', await CharacterEmbeds.GetChargingEmbed(character, roll, charge));
    }

    private static async UpdateStates(character: Character) {
        await character.StopBeingInspired();
        await character.StopBeingEnchanted();
        await character.StopBeingReinforced();
        await character.StopBeingProtected();
        await character.StopBeingCharged();
        await character.StopBeingBlessed();
    }
}