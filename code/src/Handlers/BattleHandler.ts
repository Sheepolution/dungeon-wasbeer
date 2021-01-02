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

export default class BattleHandler {

    private static waitList:Array<IMessageInfo> = new Array<IMessageInfo>();
    private static inBattle:boolean = false;
    private static inBattleTimeout:any;

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string) {
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

    private static async OnAttack(messageInfo:IMessageInfo, player:Player, fromWaitlist?:boolean) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }

        if (character.IsInBattle()) { return; }

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

        if (character.IsBeingInspired()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet vechten want je wordt momenteel geïnspireerd.', false);
            return;
        }

        const cooldown = await character.GetBattleCooldown();

        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag aanvallen.`);
            return;
        }

        if (!fromWaitlist) {
            if (BattleHandler.inBattle) {
                const fight = this.waitList.find(b => b.member.id == messageInfo.member.id);
                if (fight != null) {
                    messageInfo.message?.react(EmojiConstants.STATUS.BAD);
                    return;
                }

                character.SetInBattle(true);
                this.waitList.push(messageInfo);
                messageInfo.message?.react(EmojiConstants.STATUS.GOOD);
                return;
            }
        }

        character.SetBattleCooldown();
        character.SetInBattle(true);
        BattleHandler.inBattle = true;

        const monster = battle.GetMonster();
        const monsterId = monster.GetId();

        if (monsterId == 'fedbc712-557b-414e-ac05-0f283682cb1a') {
            monster.SetAttackStrength(character.GetAttackStrength());
            monster.SetAttackRoll(character.GetAttackRoll());
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
        }, Utils.GetMinutesInMiliSeconds(.5));

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
            await this.UpdateBattleEmbed(message, battle, character, roll1, roll2);
            await Utils.Sleep(1.5);
            roll2 += roll2;
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

                var monsterAttackStrength = battle.GetMonsterAttackStrength();
                if (!playerWon && monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
                    monsterAttackStrength = (roll3 + (roll4 || 0)) - (roll1 + (roll2 || 0));
                }

                const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? character.GetAttackStrength() : monsterAttackStrength, roll1, roll2 || 0, roll3, roll4 || 0);
                await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, roll4, playerWon, damage, false);
                secondAttack = false;
            }

        } while (secondAttack);

        await this.UpdateStates(character, battle);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }

        if (battle.IsMonsterDead()) {
            return;
        }
    }

    private static async SaveAttack(battle:Battle, character:Character, messageId:string, rollCharacterBase:number, rollCharacterModifier:number, rollCharacterModifierMax:number, rollMonsterBase:number, rollMonsterModifier:number, rollMonsterModifierMax:number, victory:boolean, damage:number, healthAfter:number) {
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

    private static async OnCharacterCrit(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, roll1:number, roll2:number = 0, roll3:number = 0) {
        var playerWon = true;
        if (battle.GetMonster().GetId() == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
            playerWon = false;
        }

        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? character.GetAttackStrength(true) : battle.GetMonsterAttackStrength(true), roll1, roll2, roll3, 0);
        await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, 0, playerWon, damage, true);
        await this.UpdateStates(character, battle);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }
    }

    private static async OnMonsterCrit(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, roll1:number, roll2:number = 0, roll3:number = 0) {
        var playerWon = false;
        const monsterId = battle.GetMonster().GetId();
        if (monsterId == '57ea9222-d3d5-4f26-96a7-07c7415d3873') {
            playerWon = true;
        }

        var monsterAttackStrength = battle.GetMonsterAttackStrength(true);
        if (!playerWon && monsterId == 'e6e3aa15-b39b-40aa-a113-6b5add2994c4') {
            monsterAttackStrength = 20 + battle.GetMonsterAttackRoll();
        }

        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? character.GetAttackStrength(true) : monsterAttackStrength, roll1, roll2, roll3, 0);
        await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, 0, playerWon, damage, true);
        await this.UpdateStates(character, battle);

        if (this.inBattleTimeout != null) {
            clearTimeout(this.inBattleTimeout);
            this.inBattleTimeout = null;
        }
    }

    private static async ResolveAttackResult(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, playerWon:boolean, damage:number, roll1:number, roll2:number, roll3:number, roll4:number) {
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

    private static async OnDefeatingMonster(battle:Battle) {
        await battle.Complete();
        await MessageService.SendMessageToDNDChannel(`De ${battle.GetMonster().GetName()} is verslagen! Iedereen die heeft meegeholpen in deze strijd heeft XP ontvangen.`)
        await CampaignManager.OnCompletingSession();
    }

    private static async OnDefeatingCharacter(messageInfo:IMessageInfo, character:Character) {
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

    private static async ReplyNoBattle(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Er is geen monster om tegen te vechten.', false);
    }

    private static async SendBattleInfo(messageInfo:IMessageInfo) {
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

    private static async ReplyMonsterDefeated(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Het monster is al verslagen.', false);
    }

    private static async SendBattleEmbed(messageInfo:IMessageInfo, battle:Battle, character:Character) {
        return await MessageService.ReplyEmbed(messageInfo, await BattleEmbeds.GetBattleEmbed(battle, character));
    }

    private static async UpdateBattleEmbed(message:Message, battle:Battle, character:Character, roll1?:number, roll2?:number, roll3?:number, roll4?:number, playerWon?:boolean, damage?:number, crit?:boolean) {
        await message.edit('', await BattleEmbeds.GetBattleEmbed(battle, character, roll1, roll2, roll3, roll4, playerWon, damage, crit));
    }

    private static async UpdateStates(character:Character, battle:Battle) {
        await character.StopBeingInspired();
        await character.StopBeingEnchanted();
        await battle.StopBeingIntimidated(character);
    }
}