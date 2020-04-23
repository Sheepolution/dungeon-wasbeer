import Campaign from '../Objects/Campaign';
import Battle from '../Objects/Battle';
import Monster from '../Objects/Monster';
import MonsterManager from './MonsterManager';
import { SessionType } from '../Enums/SessionType';
import MessageService from '../Services/MessageService';
import BotManager from './BotManager';
import MonsterEmbeds from '../Embeds/MonsterEmbeds';

export default class CampaignManager {

    private static campaignObject:Campaign;

    public static async ContinueSession() {
        var campaign = new Campaign();

        if (!await campaign.FIND_ACTIVE()) {
            this.StartNewSession()
            return;
        }

        this.campaignObject = campaign;
    }

    public static async StartNewSession() {
        var campaign = new Campaign();
        const battle = new Battle();
        const monster = MonsterManager.GetRandomMonster();
        await battle.POST(monster);
        await campaign.POST(SessionType.Battle, battle.GetId());
        this.campaignObject = campaign;
        CampaignManager.SendNewSessionMessage(campaign, monster);
    }

    public static async SendNewSessionMessage(campaign:Campaign, monster:Monster) {
        MessageService.SendMessage(await BotManager.GetMainChannel(), `Jullie volgen het pad in het bos. Plots komen jullie een ${monster.GetName()} tegen!`, MonsterEmbeds.GetMonsterEmbed(monster));
    }
}