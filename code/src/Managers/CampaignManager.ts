import Campaign from '../Objects/Campaign';
import Battle from '../Objects/Battle';
import Monster from '../Objects/Monster';
import MonsterManager from './MonsterManager';
import { SessionType } from '../Enums/SessionType';
import MessageService from '../Services/MessageService';
import MonsterEmbeds from '../Embeds/MonsterEmbeds';
import Attack from '../Objects/Attack';
import Character from '../Objects/Character';
import Heal from '../Objects/Heal';
import CharacterModel from '../Models/CharacterModel';
import PlayerManager from './PlayerManager';
import PuzzleManager from './PuzzleManager';
import Puzzle from '../Objects/Puzzle';
import PuzzleEmbeds from '../Embeds/PuzzleEmbeds';
import { Utils } from '../Utils/Utils';
import ConfigurationManager from './ConfigurationManager';
import PuzzleService from '../Services/PuzzleService';
import LogService from '../Services/LogService';
import CharacterEmbeds from '../Embeds/CharacterEmbeds';
const { transaction } = require('objection');

export default class CampaignManager {

    private static campaignObject:Campaign;
    private static previousBattle:Campaign;

    public static async ContinueSession() {
        var campaign = new Campaign();

        if (!await campaign.FIND_ACTIVE()) {
            this.StartNewSession();
        }

        this.campaignObject = campaign;
    }

    public static async StartNewSession(lastSessionType?:SessionType) {
        var campaign = new Campaign();

        if (lastSessionType == SessionType.Battle) {
            const puzzle = await PuzzleManager.GetRandomPuzzle();
            await campaign.POST(SessionType.Puzzle, puzzle.GetId());
            this.previousBattle = this.campaignObject;
            this.campaignObject = campaign;
            CampaignManager.SendNewPuzzleMessage(puzzle);
            return;
        }

        const battle = new Battle();
        var monster;
        var monsterInOrderConfig = ConfigurationManager.GetConfigurationByName('monsters_in_order');
        if (monsterInOrderConfig?.GetValueAsBoolean()) {
            var number = 0;
            if (this.campaignObject != null) {
                var latestBattle = this.campaignObject.GetBattle();
                if (latestBattle == null) {
                    latestBattle = new Battle();
                    await latestBattle.GET_LATEST();
                }
                number = latestBattle.GetMonster().GetNumber()
            }

            if (number == MonsterManager.GetNumberOfMonsters()) {
                await monsterInOrderConfig?.SetValue(false);
                monster = MonsterManager.GetRandomMonster();
            } else {
                monster = MonsterManager.GetMonsterByNumber(number + 1);
            }
        } else {
            monster = MonsterManager.GetRandomMonster();
        }

        if (monster) {
            await battle.POST(monster);
            await campaign.POST(SessionType.Battle, battle.GetId());
            this.campaignObject = campaign;
            CampaignManager.SendNewBattleMessage(monster, battle);
            return this.campaignObject;
        }
    }

    public static async SendNewPuzzleMessage(puzzle:Puzzle) {
        MessageService.SendMessageToDNDChannel(PuzzleService.GetPuzzleIntro(puzzle), PuzzleEmbeds.GetSudokuEmbed(puzzle));
    }

    public static async SendNewBattleMessage(monster:Monster, battle:Battle) {
        if (battle.GetMonster().GetId() == '20110b21-0a15-48f8-83a9-b4f804235355') {
            MessageService.SendMessageToDNDChannel(`Jullie vervolgen jullie reis richting de schatkist. Plots komen jullie een ${monster.GetName()} tegen! Vecht tegen het monster met \`;vecht\`. Dit is het laatste gevecht!`,
                MonsterEmbeds.GetMonsterEmbed(monster));
        } else {
            MessageService.SendMessageToDNDChannel(`Jullie vervolgen jullie reis ${[
                'in het bos',
                'door de bergen',
                'langs de rivier',
                'in een grot',
                'langs de zee',
                'over een brug',
                'onder een brug',
                'door een open veld',
                'door een uitgestrekte vlakte',
                'door een woestijnlandschap'
            ].randomChoice()}. Plots komen jullie een ${monster.GetName()} tegen! Vecht tegen het monster met \`;vecht\`.`,
            MonsterEmbeds.GetMonsterEmbed(monster));
        }
    }

    public static GetBattle() {
        if (this.campaignObject == null) {
            return;
        }

        return this.campaignObject.GetBattle();
    }

    public static GetPreviousBattle() {
        if (this.previousBattle == null) {
            return;
        }

        return this.previousBattle.GetBattle();
    }

    public static GetPuzzle() {
        if (this.campaignObject == null) {
            return;
        }

        return this.campaignObject.GetPuzzle();
    }

    public static async OnCompletingSession() {
        const battle = this.campaignObject.GetBattle();
        if (battle != null) {
            await this.GiveXPToBattlers(battle);
        }
        await this.campaignObject.CompleteSession();
        await Utils.Sleep(3);
        if (battle == null) {
            if (this.previousBattle.GetBattle().GetMonster().GetId() == '16afcb5c-7ff7-480c-ad9d-005fe50856d3') {
                await Utils.Sleep(40);
                MessageService.SendMessageToDNDChannel('', CharacterEmbeds.GetStoryEmbed('Het was een lang en zwaar gevecht. De party waren al vele monsters tegengekomen, maar de Ancient Red Dragon was de sterkste van allemaal. Maar niet sterk genoeg! De party wist de draak te verslaan, en begint met hun klim naar de top.', 'https://cdn.discordapp.com/attachments/694331679204180029/783402540632506398/ancient_dragon_defeated.png'));
                await Utils.Sleep(40);
                MessageService.SendMessageToDNDChannel('', CharacterEmbeds.GetStoryEmbed(`"Zijn we er al bijna?" vraagt Dixie.
"Bijna," zegt de rest van de party in koor.
"Ja maar hoelang moeten we dan nog?" vraagt Dixie.
"Nog even," zegt de rest van de party, nogmaals in koor.

De klim lijkt een oneindigheid te duren. Dit is waar ze maanden voor hebben gereisd en gevochten. Waar ze breinbrekers voor hebben opgelost, en hun beste vrienden voor hebben verloren. De party kan niet wachten om hun quest te voltooien.`, 'https://cdn.discordapp.com/attachments/694331679204180029/783402575646425108/the_climb.png'));
                await Utils.Sleep(40);
                MessageService.SendMessageToDNDChannel('', CharacterEmbeds.GetStoryEmbed(`Maar uiteindelijk bereiken ze dan toch echt de top.
"Moet ik mijn bril schoonpoetsen, of zien jullie dit ook?" vraagt Healing Hector.
Skaldsen the Virtuoso knikt enthousiast. "Het heeft 600 inspires gekost, maar we hebben 'm eindelijk!"
"De legende was dus waar! Ik wist het!" zegt Wes de Bard.
Mora de cleric staart vol bewondering. "Wat is ie mooi!"`, 'https://cdn.discordapp.com/attachments/694331679204180029/783402614464970822/reaching_the_top.png'));
                await Utils.Sleep(40);
                MessageService.SendMessageToDNDChannel('', CharacterEmbeds.GetStoryEmbed(`De party staat recht tegenover de Schatkist van Draakeiland.
"Na al die tijd! We hebben 'm!" zegt Juul de Wizard.
"Wat een gigantisch ding!" zegt Heer Wout.
"..." zwijgt Gerrit, zoals hij al heel de campaign heeft gedaan.
"En goud! Niemand zei iets over het goud! We zijn rijk!" zegt Ruby Ratcoon.
"Iedereen... onze quest is voorbij!", roept Schapolo de Vlammende Wol naar de party.`, 'https://cdn.discordapp.com/attachments/694331679204180029/783402639786246206/omg_a_chest.png'));
                await Utils.Sleep(40);
                MessageService.SendMessageToDNDChannel('', CharacterEmbeds.GetStoryEmbed(`Maar ineens komt er een gouden staart te voorschijn, en vervolgens een gouden kop.
De party maakt een gezamenlijk "oof" geluid.
De gouden hoop staat op. Het blijkt een Ancient Gold Dragon te zijn!

"Sorry, wat zei je, Schapolo?" vraagt Juul de Wizard.
"Ja, kan je dat misschien herhalen?" vraagt Heer Wout.
"..." zwijgt Gerrit.
"Maar... mijn goud..." snikt Ruby Ratcoon.
"Ah-um. Correctie! Na dit monster is onze quest echt voltooid! TEN AANVAL!" roept Schapolo de Vlammende Wol.`, 'https://cdn.discordapp.com/attachments/694331679204180029/783402663340671036/omg_a_dragon.png'));
                await Utils.Sleep(40);
            }
        }
        await this.StartNewSession(battle != null ? SessionType.Battle : SessionType.Puzzle);
    }

    private static async GiveXPToBattlers(battle:Battle) {
        const attackData = await Attack.FIND_TOTAL_DAMAGE_GIVEN_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const healData = await Heal.FIND_TOTAL_HEALED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const data:any = {};

        for (const row of attackData) {
            const xp = row.sum;
            data[row.character_id] = xp;
        }

        for (const row of healData) {
            const xp = Math.floor(row.sum/2);
            if (data[row.character_id]) {
                data[row.character_id] += xp;
            } else {
                data[row.character_id] = xp;
            }
        }

        for (const characterId in data) {
            data[characterId] = Math.min(Math.floor(battle.GetMaxMonsterHealth()/10), data[characterId]);
        }

        const characters = PlayerManager.GetAllCachedCharacters();
        const battleId = battle.GetId();
        const nowString = Utils.GetNowString();

        await transaction(CharacterModel.knex(), async (trx:any) => {
            for (const character of characters) {
                const charId = character.GetId();
                const xp = data[charId];
                if (xp) {
                    await character.IncreaseXP(xp, trx, true);
                    await LogService.LogXP(battleId, character.GetId(), xp, nowString, trx);
                    delete data[charId];
                }

                await character.RestoreToFullHealth(trx);
            }

            for (const characterId in data) {
                await Character.INCREASE_XP(data[characterId], characterId, trx);
                await LogService.LogXP(battleId, characterId, data[characterId], nowString, trx);
                await Character.RESTORE_HEALTH(characterId, trx);
            }
        }).catch((error:any) => {
            console.log(error);
        })
    }
}