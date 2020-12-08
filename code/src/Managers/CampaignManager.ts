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
            CampaignManager.SendNewBattleMessage(monster);
            return this.campaignObject;
        }
    }

    public static async SendNewPuzzleMessage(puzzle:Puzzle) {
        MessageService.SendMessageToDNDChannel(PuzzleService.GetPuzzleIntro(puzzle), PuzzleEmbeds.GetSudokuEmbed(puzzle));
    }

    public static async SendNewBattleMessage(monster:Monster) {
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
        await this.StartNewSession(battle != null ? SessionType.Battle : SessionType.Puzzle)
    }

    private static async GiveXPToBattlers(battle:Battle) {
        const attackData = await Attack.FIND_TOTAL_DAMAGE_GIVEN_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const healData = await Heal.FIND_TOTAL_HEALED_OTHERS_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const data:any = {};

        for (const row of attackData) {
            const xp = parseInt(row.sum);
            data[row.character_id] = xp;
        }

        for (const row of healData) {
            const xp = Math.floor(parseInt(row.sum)/2);
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