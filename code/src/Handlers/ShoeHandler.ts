import BotManager from '../Managers/BotManager';
import CardEmbeds from '../Embeds/CardEmbeds';
import CardManager from '../Managers/CardManager';
import ConfigurationManager from '../Managers/ConfigurationManager';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import PlayerManager from '../Managers/PlayerManager';
import { LogType } from '../Enums/LogType';
import { ShoeState } from '../Enums/ShoeState';
import { Utils } from '../Utils/Utils';
import { ShoeConfigState } from '../Enums/ShoeConfigState';

export default class ShoeHandler {

    public static OnCommand(messageInfo: IMessageInfo, player: Player, command: string) {
        switch (command) {
            case 'zet':
            case 'zetten':
            case 'schoen-zetten':
            case 'zet-schoen':
                this.OnSettingShoe(messageInfo, player);
                break;
            case 'kijk':
            case 'kijken':
            case 'legen':
            case 'schoen-legen':
            case 'schoen-kijken':
            case 'kijk-schoen':
                this.OnEmptyingShoe(messageInfo, player);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async OnSettingShoe(messageInfo: IMessageInfo, player: Player) {
        const sintConfig = ConfigurationManager.GetConfigurationByName('sinterklaas_state');
        if (sintConfig?.Is('Off')) {
            return;
        }

        if (sintConfig?.Is('Left')) {
            MessageService.ReplyMessage(messageInfo, 'Sinterwasbeer is terug richting Spanje. Tot volgend jaar!', undefined, true);
            return;
        }

        const shoeConfig = ConfigurationManager.GetConfigurationByName('shoe_state');

        const now = new Date();
        const hour = now.getHours() + 1;
        const shoeState = player.GetShoeState();

        if (shoeState == ShoeState.Set) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt je schoentje al gezet. Was jij nou van plan een tweede schoentje aan het zetten? Ben jij aan het bedelen?!', false, true);
            return;
        } else if (shoeState == ShoeState.Filled) {
            MessageService.ReplyMessage(messageInfo, 'Er zit nog iets in je schoentje! Gebruik `;legen` om te kijken wat er in zit.', false, true);
            return;
        }

        if (hour >= 18 || hour < 1) {
            if (!shoeConfig?.Is(ShoeConfigState.Night)) {
                shoeConfig?.SetValue(ShoeConfigState.Night);
            }
            await player.SetShoeState(ShoeState.Set);
            await LogService.Log(player, player.GetId(), LogType.ShoeEmptied, `${player.GetDiscordName()} heeft hun schoentje geleegd.`);
            await MessageService.ReplyMessage(messageInfo, 'Je schoentje is gezet! Als je braaf bent geweest zit er morgen een cadeautje in.', true, true);
        } else if (hour < 8) {
            MessageService.ReplyMessage(messageInfo, 'Je bent te laat met het zetten van je schoentje. Sinterklaas is al onderweg.', false, true);
        } else {
            MessageService.ReplyMessage(messageInfo, 'Je bent te vroeg met het zetten van je schoentje. Was je van plan de rest van de dag op één schoen te lopen?!', false, true);
        }
    }

    private static async OnEmptyingShoe(messageInfo: IMessageInfo, player: Player) {
        const sintConfig = ConfigurationManager.GetConfigurationByName('sinterklaas_state');
        if (sintConfig?.Is('Off')) {
            return;
        }

        const shoeConfig = ConfigurationManager.GetConfigurationByName('shoe_state');

        const now = new Date();
        const hour = now.getHours() + 1;
        var shoeState = player.GetShoeState();

        if (hour >= 8 || hour < 1) {
            if (hour >= 8 && hour < 18) {
                if (shoeConfig?.Is(ShoeConfigState.Night)) {
                    await shoeConfig?.SetValue(ShoeConfigState.Day);
                    await Player.UPDATE_SHOES();
                    PlayerManager.ResetPlayerCache();
                    player = <Player>await PlayerManager.GetPlayerById(player.GetId());
                    shoeState = player.GetShoeState();
                }
            }

            if (shoeState == ShoeState.Emptied) {
                MessageService.ReplyMessage(messageInfo, 'Je hebt je schoentje al geleegd. Hoopte je dat er nog iets in zou zitten? Ben je nou gierig bezig?!', false, true);
                return;
            } else if (shoeState == ShoeState.Empty) {
                MessageService.ReplyMessage(messageInfo, 'Je bent vergeten je schoentje te zetten jij dommerik!', false, true);
                return;
            } else if (shoeState == ShoeState.Set) {
                MessageService.ReplyMessage(messageInfo, 'Sinterklaas moet nog langskomen joh! Nog even geduld.', false, true);
                return;
            } else if (shoeState == ShoeState.Filled) {

                await player.SetShoeState(ShoeState.Emptied);

                const left = sintConfig?.Is('Left');
                LogService.Log(player, player.GetId(), LogType.ShoeEmptied, `${player.GetDiscordName()} heeft hun schoentje geleegd.`);

                for (let i = 0; i < (left ? 3 : 1); i++) {
                    const cardModifyResult = await CardManager.GivePlayerCard(player);
                    const playerCard = <PlayerCard>cardModifyResult.object;
                    messageInfo.channel = BotManager.GetCardChannel();

                    if (cardModifyResult.result) {
                        var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je kijkt in je schoentje... je hebt van Sinterklaas een nieuwe kaart gekregen!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                        if (cardMessage != null) {
                            await LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedShoe, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door hun schoen te legen.`);
                            await CardManager.OnCardMessage(cardMessage, playerCard);
                        }
                    } else {
                        var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je kijkt in je schoentje... je hebt van Sinterklaas een extra van deze kaart gekregen!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                        if (cardMessage != null) {
                            await LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedShoe, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door hun schoen te legen, en heeft daar nu ${playerCard.GetAmount()} van.`);
                            await CardManager.OnCardMessage(cardMessage, playerCard);
                        }
                    }

                    await Utils.Sleep(10);
                }
            }
        } else if (hour < 8) {
            MessageService.ReplyMessage(messageInfo, 'Sinterklaas is onderweg. Nog even geduld!', false, true);
        }
    }
}
