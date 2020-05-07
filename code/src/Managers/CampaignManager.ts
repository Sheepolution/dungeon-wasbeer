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
const { transaction } = require('objection');

export default class CampaignManager {

    private static campaignObject:Campaign;

    public static async ContinueSession() {
        var campaign = new Campaign();

        if (!await campaign.FIND_ACTIVE()) {
            return;
        }

        this.campaignObject = campaign;
    }

    public static async StartNewSession(lastSessionType?:SessionType) {
        var campaign = new Campaign();

        if (lastSessionType == SessionType.Battle) {
            if (Utils.Chance(35)) {
                const puzzle = await PuzzleManager.GetRandomPuzzle();
                await campaign.POST(SessionType.Puzzle, puzzle.GetId());
                this.campaignObject = campaign;
                CampaignManager.SendNewPuzzleMessage(puzzle);
                return;
            }
        }

        const battle = new Battle();
        const monster = MonsterManager.GetRandomMonster();
        await battle.POST(monster);
        await campaign.POST(SessionType.Battle, battle.GetId());
        this.campaignObject = campaign;
        CampaignManager.SendNewBattleMessage(monster);
    }

    public static async SendNewPuzzleMessage(puzzle:Puzzle) {
        MessageService.SendMessageToDNDChannel('Jullie komen aan in een dorp. Daar zien jullie een oud vrouwtje. "Gegroet", zegt ze. "Als jullie door dit dorp willen zul je eerst deze puzzel moeten oplossen."', PuzzleEmbeds.GetSudokuEmbed(puzzle));
    }

    public static async SendNewBattleMessage(monster:Monster) {
        MessageService.SendMessageToDNDChannel(`Jullie volgen het pad in het bos. Plots komen jullie een ${monster.GetName()} tegen!`, MonsterEmbeds.GetMonsterEmbed(monster));
    }

    public static GetBattle() {
        return this.campaignObject.GetBattle();
    }

    public static GetPuzzle() {
        return this.campaignObject.GetPuzzle();
    }

    public static async OnCompletingSession() {
        const battle = this.campaignObject.GetBattle();
        if (battle != null) {
            await this.GiveXPToBattlers(battle);
        }
        await this.campaignObject.CompleteSession();
        await this.StartNewSession();
    }

    private static async GiveXPToBattlers(battle:Battle) {
        const attackData = await Attack.FIND_TOTAL_DAMAGE_GIVEN_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const healData = await Heal.FIND_TOTAL_HEALED_IN_BATTLE_FOR_ALL_CHARACTERS(battle);
        const data:any = {};
        for (const row of attackData) {
            const xp = Math.min(Math.floor(battle.GetMaxMonsterHealth()/10), row.sum);
            data[row.character_id] = xp;
        }

        for (const row of healData) {
            const xp = Math.min(Math.floor(battle.GetMaxMonsterHealth()/10), row.sum);
            if (data[row.character_id]) {
                data[row.character_id] += xp;
            } else {
                data[row.character_id] = xp;
            }
        }

        for (const characterId in data) {
            const character = PlayerManager.GetCachePlayerCharacterByCharacterId(characterId);
            if (character != null) {
                character.IncreaseXP(data[characterId], false);
            }
        }

        const characters = PlayerManager.GetAllCachedCharacters();

        await transaction(CharacterModel.knex(), async (trx:any) => {
            for (const characterId in data) {
                await Character.INCREASE_XP(data[characterId], characterId, trx);
            }

            for (const character of characters) {
                const xp = data[character.GetId()];
                if (xp) {
                    await character.IncreaseXP(xp, trx);
                }
            }
        }).catch((error:any) => {
            console.log(error);
        })
    }
}