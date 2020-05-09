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
import RedisConstants from '../Constants/RedisConstants';
import Log from '../Objects/Log';
import { LogType } from '../Enums/LogType';

export default class BattleHandler {

    private static readonly battleCooldownPrefix = RedisConstants.REDIS_KEY + RedisConstants.BATTLE_COOLDOWN_KEY;

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string) {
        switch (command) {
            case 'attack':
            case 'fight':
            case 'vecht':
            case 'aanvallen':
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

    private static async OnAttack(messageInfo:IMessageInfo, player:Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) { return; }

        if (character.GetInBattle()) { return; }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            this.ReplyNoBattle(messageInfo);
            return;
        }

        const cooldown = await character.GetBattleCooldown();

        if (cooldown > 0) {
            const minutes = Utils.GetSecondsInMinutes(cooldown);
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${minutes + (minutes == 1 ? ' minuut' : ' minuten')} cooldown voordat je weer mag aanvallen.`);
            return;
        }

        character.SetBattleCooldown();
        character.SetInBattle(true);

        // Start attack
        const message = await this.SendBattleEmbed(messageInfo, battle, character);
        await Utils.Sleep(3);
        const roll1 = Utils.Dice(20);
        if (roll1 == 1) {
            this.OnMonsterCrit(messageInfo, message, battle, character)
            return
        } else if (roll1 == 20) {
            this.OnCharacterCrit(messageInfo, message, battle, character)
            return
        }

        const playerAttackRoll = character.GetAttackRoll();
        var roll2 = playerAttackRoll;
        if (playerAttackRoll > 1) {
            this.UpdateBattleEmbed(message, battle, character, roll1);
            await Utils.Sleep(3);
            roll2 = Utils.Dice(playerAttackRoll);
        }

        this.UpdateBattleEmbed(message, battle, character, roll1, roll2);
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
            this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3);
            await Utils.Sleep(3);
            roll4 = Utils.Dice(monsterAttackRoll);
        }

        const playerWon = roll1 + (roll2 || 0) >= roll3 + (roll4 || 0);
        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, playerWon, playerWon ? character.GetAttackStrength(): battle.GetMonsterAttackStrength(), roll1, roll2 || 0, roll3, roll4 || 0);
        await this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, roll4, playerWon, damage);
    }

    private static async SaveAttack(battle:Battle, character:Character, messageId:string, rollCharacterBase:number, rollCharacterModifier:number, rollCharacterModifierMax:number, rollMonsterBase:number, rollMonsterModifier:number, rollMonsterModifierMax:number, victory:boolean, damage:number, healthAfter:number) {
        const attack = await Attack.STATIC_POST(battle, character, messageId, rollCharacterBase, rollCharacterModifier, rollCharacterModifierMax, rollMonsterBase, rollMonsterModifier, rollMonsterModifierMax, victory, damage, healthAfter);
        Log.STATIC_POST(character.GetPlayer(), attack.id, LogType.Attack, `${character.GetName()} heeft het monster '${battle.GetMonster().GetName()}' aangevallen en dit gevecht ${victory ? 'gewonnen' : 'verloren'}.`);
    }

    private static async OnCharacterCrit(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, roll1:number = 20, roll2:number = 0, roll3:number = 0) {
        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, true, character.GetAttackStrength(true), roll1, roll2, roll3, 0);
        this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, undefined, true, damage, true);
    }

    private static async OnMonsterCrit(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, roll1:number = 20, roll2:number = 0, roll3:number = 0) {
        const damage = await this.ResolveAttackResult(messageInfo, message, battle, character, false, battle.GetMonsterAttackStrength(true), roll1, roll2, roll3, 0);
        this.UpdateBattleEmbed(message, battle, character, roll1, roll2, roll3, undefined, false, damage, true);
    }

    private static async ResolveAttackResult(messageInfo:IMessageInfo, message:Message, battle:Battle, character:Character, playerWon:boolean, damage:number, roll1:number, roll2:number, roll3:number, roll4:number) {
        if (playerWon) {
            const receivedDamage = await battle.DealDamageToMonster(damage);
            await this.SaveAttack(battle, character, message.id, roll1, roll2, character.GetAttackRoll(), roll3, roll4, battle.GetMonsterAttackRoll(), true, receivedDamage, battle.GetCurrentMonsterHealth());
            character.SetInBattle(false);
            if (battle.IsMonsterDead()) {
                await this.OnDefeatingMonster(battle);
            }
            return receivedDamage;
        } else {
            const receivedDamage = await character.ReceiveDamage(damage);
            await this.SaveAttack(battle, character, message.id, roll1, roll2, battle.GetMonsterAttackRoll(), roll3, roll4, battle.GetMonsterAttackRoll(), false, receivedDamage, character.GetCurrentHealth());
            if (character.IsDead()) {
                await this.OnDefeatingCharacter(messageInfo, character);
            } else {
                character.SetInBattle(false);
            }
            return receivedDamage;
        }
    }

    private static async OnDefeatingMonster(battle:Battle) {
        await battle.Complete();
        await CampaignManager.OnCompletingSession();
        await MessageService.SendMessageToDNDChannel(`De ${battle.GetMonster().GetName()} is verslagen! Iedereen die heeft meegeholpen in deze strijd heeft XP ontvangen.`)
    }

    private static async OnDefeatingCharacter(messageInfo:IMessageInfo, character:Character) {
        await character.Kill();
        await Utils.Sleep(1);
        await MessageService.SendMessageToDNDChannel('', await CharacterEmbeds.GetDeadCharacterEmbed(character));
        await Utils.Sleep(3);
        await MessageService.ReplyMessage(messageInfo, 'Je character is dood. Je kan opnieuw beginnen door een class te kiezen met het commando `;class`.');
        Log.STATIC_POST(character.GetPlayer(), character.GetId(), LogType.CharacterDied, `De character van ${character.GetPlayer().GetDiscordName()} is overleden.`);
    }

    private static async ReplyNoBattle(messageInfo:IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, 'Er is geen gevecht gaande momenteel.', false);
    }

    private static async SendBattleInfo(messageInfo:IMessageInfo) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            this.ReplyNoBattle(messageInfo);
            return;
        }
        return await MessageService.ReplyEmbed(messageInfo, BattleEmbeds.GetBattleInfoEmbed(battle));
    }

    private static async SendBattleEmbed(messageInfo:IMessageInfo, battle:Battle, character:Character) {
        return await MessageService.ReplyEmbed(messageInfo, BattleEmbeds.GetBattleEmbed(battle, character));
    }

    private static async UpdateBattleEmbed(message:Message, battle:Battle, character:Character, roll1?:number, roll2?:number, roll3?:number, roll4?:number, playerWon?:boolean, damage?:number, crit?:boolean) {
        await message.edit('', BattleEmbeds.GetBattleEmbed(battle, character, roll1, roll2, roll3, roll4, playerWon, damage, crit));
    }
}