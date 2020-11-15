import CardEmbeds from '../Embeds/CardEmbeds';
import { LogType } from '../Enums/LogType';
import { ShoeConfigShate, ShoeConfigShate as ShoeConfigState } from '../Enums/ShoeConfigState';
import { ShoeState } from '../Enums/ShoeState';
import IMessageInfo from '../Interfaces/IMessageInfo';
import BotManager from '../Managers/BotManager';
import CardManager from '../Managers/CardManager';
import ConfigurationManager from '../Managers/ConfigurationManager';
import PlayerManager from '../Managers/PlayerManager';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';

export default class ShoeHandler {

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string) {
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

    private static async OnSettingShoe(messageInfo:IMessageInfo, player:Player) {
        const config = ConfigurationManager.GetConfigurationByName('shoe_state');
        if (config?.Is('Off')) {
            return;
        }

        const now = new Date();
        const hour = now.getHours();
        const shoeState = player.GetShoeState();

        if (shoeState == ShoeState.Set) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt je schoentje al gezet. Was jij nou van plan een tweede schoentje aan het zetten? Ben jij aan het bedelen?!', false, true);
            return;
        } else if (shoeState == ShoeState.Filled) {
            MessageService.ReplyMessage(messageInfo, 'Er zit nog iets in je schoentje! Gebruik `;legen` om te kijken wat er in zit.', false, true);
            return;
        }

        if (hour >= 18 || hour < 1) {
            if (!config?.Is(ShoeConfigState.Night)) {
                config?.SetValue(ShoeConfigShate.Night);
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

    private static async OnEmptyingShoe(messageInfo:IMessageInfo, player:Player) {
        const config = ConfigurationManager.GetConfigurationByName('shoe_state');
        if (config?.Is('Off')) {
            return;
        }

        const now = new Date();
        const hour = now.getHours();
        var shoeState = player.GetShoeState();

        if (hour >= 8 || hour < 1) {
            if (hour < 18) {
                if (config?.Is(ShoeConfigState.Night)) {
                    await config?.SetValue(ShoeConfigShate.Day);
                    await Player.UPDATE_SHOES();
                    PlayerManager.ResetPlayerCache();
                    player = <Player> await PlayerManager.GetPlayerById(player.GetId());
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
                LogService.Log(player, player.GetId(), LogType.ShoeEmptied, `${player.GetDiscordName()} heeft hun schoentje geleegd.`);

                const cardModifyResult = await CardManager.GivePlayerCard(player);
                const playerCard = <PlayerCard>cardModifyResult.object;
                messageInfo.channel = BotManager.GetCardChannel();

                if (cardModifyResult.result) {
                    var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je kijkt in je schoentje... je hebt van Sinterklaas een nieuwe kaart gekregen!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes.`);
                } else {
                    var cardMessage = await MessageService.ReplyMessage(messageInfo, 'Je kijkt in je schoentje... je hebt van Sinterklaas een extra van deze kaart gekregen!', undefined, true, CardEmbeds.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()));
                    CardManager.OnCardMessage(cardMessage, playerCard);
                    LogService.Log(player, playerCard.GetCardId(), LogType.CardReceivedPieces, `${player.GetDiscordName()} heeft de kaart '${playerCard.GetCard().GetName()}' door kaartstukjes, en heeft daar nu ${playerCard.GetAmount()} van.`);
                }
            }
        } else if (hour < 8) {
            MessageService.ReplyMessage(messageInfo, 'Sinterklaas is onderweg. Nog even geduld!', false, true);
        }
    }
}
