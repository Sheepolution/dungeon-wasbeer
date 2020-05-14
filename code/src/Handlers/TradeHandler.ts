import IMessageInfo from '../Interfaces/IMessageInfo';
import ITradeInfo from '../Interfaces/ITradeInfo';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import PlayerService from '../Services/PlayerService';
import EmojiConstants from '../Constants/EmojiConstants';
import MessageService from '../Services/MessageService';
import CardEmbeds from '../Embeds/CardEmbeds';
import SettingsConstants from '../Constants/SettingsConstants';
import Trade from '../Objects/Trade';
import Log from '../Objects/Log';
import { LogType } from '../Enums/LogType';

export default class TradeHandler {

    private static trades:Array<ITradeInfo> = new Array<ITradeInfo>();
    private static readonly tradeInstructions = 'Zeg beiden `;accepteer` als je de ruil wilt accepteren. Zeg `;annuleer` als je de ruil wilt annuleren.';

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, content:string) {
        switch (command) {
            case 'ruil':
                this.OnTrade(messageInfo, player, content);
                break;
            case 'accept':
            case 'accepteer':
                this.AcceptTrade(messageInfo, player);
                break;
            case 'cancel':
            case 'annuleer':
                this.CancelTrade(messageInfo, player);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async OnTrade(messageInfo:IMessageInfo, player:Player, args:string) {
        var match = args.match(/<@!?(\d+)>\s(.+?)\s>\s(.+)/);
        if (match == null) {
            MessageService.ReplyMessage(messageInfo, 'Ik begrijp je niet helemaal. Zorg dat je het formaat aanhoudt:\n`;ruil @mention jouw kaart > hun kaart`', false);
            return;
        }

        var otherPlayerGet = await PlayerService.GetPlayer(match[1]);

        if (otherPlayerGet == null) {
            if (match[1] == SettingsConstants.BOT_ID) {
                MessageService.ReplyMessage(messageInfo, 'Dat is een mooie kaart, maar nee bedankt.');
            } else {
                MessageService.ReplyMessage(messageInfo, 'Die gozer heeft nog helemaal geen kaarten joh.', false);
            }
            return;
        }

        const otherPlayer = <Player>otherPlayerGet;

        if (player == otherPlayer) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet met jezelf ruilen. Het klinkt ook wel een beetje zielig.', false);
            return;
        }

        const yourTrade = this.FindExistingTrade(player);
        const theirTrade = this.FindExistingTrade(otherPlayer);

        if (yourTrade != null && yourTrade == theirTrade) {
            MessageService.ReplyMessage(messageInfo, 'Jullie twee zijn al aan het ruilen. ' + this.tradeInstructions, false);
            return;
        }

        if (yourTrade != null) {
            MessageService.ReplyMessage(messageInfo, `Jij bent al aan het ruilen met ${yourTrade.with.GetDiscordName()}. ${this.tradeInstructions}`, false);
            return;
        }

        if (theirTrade != null) {
            MessageService.ReplyMessage(messageInfo, `${theirTrade.trader.GetDiscordName()} is al aan het ruilen met ${theirTrade.with.GetDiscordName()}`, false);
            return;
        }

        const searchMine = match[2];
        const searchTheirs = match[3];

        const yourCard = player.FindCard(searchMine);
        const theirCard = otherPlayer.FindCard(searchTheirs);

        if (yourCard == null) {
            MessageService.ReplyMessage(messageInfo, `Je hebt geen kaart die lijkt op ${searchMine}.`, false);
            return;
        }

        if (theirCard == null) {
            MessageService.ReplyMessage(messageInfo, `${otherPlayer.GetDiscordName()} heeft geen kaart die lijkt op ${searchTheirs}.`, false);
            return;
        }

        if (!yourCard.CanBeTraded()) {
            MessageService.ReplyMessage(messageInfo, `Jouw kaart '${yourCard.GetCard().GetName()}' zit in je equipment en dus je kan deze niet ruilen.`, false);
            return;
        }

        if (!theirCard.CanBeTraded()) {
            MessageService.ReplyMessage(messageInfo, `De kaart van ${otherPlayer.GetDiscordName()}, '${yourCard.GetCard().GetName()}', zit in hun equipment en dus kunnen ze deze niet ruilen.`, false);
            return;
        }

        this.StartTrade(messageInfo, player, otherPlayer, yourCard, theirCard);
    }

    private static AcceptTrade(messageInfo:IMessageInfo, player:Player) {
        const tradeInfo = this.FindExistingTrade(player);
        if (tradeInfo == null) {
            this.SendTradeNotFound(messageInfo, true);
            return;
        }

        if (tradeInfo.trader == player) {
            tradeInfo.youAccepted = true;
        } else {
            tradeInfo.theyAccepted = true;
        }

        if (tradeInfo.youAccepted && tradeInfo.theyAccepted) {
            this.CompleteTrade(messageInfo, tradeInfo)
            for (let i = 0; i < this.trades.length; i++) {
                if (tradeInfo == this.trades[i]) {
                    this.trades.splice(i, 1);
                    break;
                }
            }
        } else {
            messageInfo.message?.react(EmojiConstants.STATUS.GOOD);
        }
    }

    private static CancelTrade(messageInfo:IMessageInfo, player:Player) {
        const tradeInfo = this.FindExistingTrade(player);
        if (tradeInfo == null) {
            this.SendTradeNotFound(messageInfo, false)
            return;
        }

        this.RemoveTrade(tradeInfo);
        MessageService.ReplyMessage(messageInfo, 'De ruil is geannuleerd.');
    }

    private static StartTrade(messageInfo:IMessageInfo, player:Player, otherPlayer:Player, yourCard:PlayerCard, theirCard:PlayerCard) {
        const tradeInfo:ITradeInfo = {
            trader: player,
            with: otherPlayer,
            yourCard: yourCard,
            theirCard: theirCard,
            youAccepted: false,
            theyAccepted: false,
        };

        yourCard.StartUsingInTrade();
        theirCard.StartUsingInTrade();

        this.trades.push(tradeInfo);
        MessageService.ReplyEmbed(messageInfo, CardEmbeds.GetTradeEmbed(tradeInfo), `${tradeInfo.with.GetMention()}, wil jij jouw '${tradeInfo.theirCard.GetCard().GetName()}' ruilen voor de '${tradeInfo.yourCard.GetCard().GetName()}' van ${tradeInfo.trader.GetMention()}? ${this.tradeInstructions}`)
    }

    private static async CompleteTrade(messageInfo:IMessageInfo, tradeInfo:ITradeInfo) {
        const you = tradeInfo.trader;
        const they = tradeInfo.with;
        const yourCard = tradeInfo.yourCard;
        const theirCard = tradeInfo.theirCard;

        const existingTheirCard = they.GetCards().find(x => x.GetCardId() == yourCard.GetCardId());

        if (existingTheirCard != null) {
            await existingTheirCard.AddCard();
        } else {
            const newPlayerCard = new PlayerCard(they);
            await newPlayerCard.POST(yourCard.GetCardId(), they.GetId());
            await they.GiveCard(newPlayerCard);
        }

        const existingYourCard = you.GetCards().find(x => x.GetCardId() == theirCard.GetCardId());

        if (existingYourCard != null) {
            await existingYourCard.AddCard();
        } else {
            const newPlayerCard = new PlayerCard(you);
            await newPlayerCard.POST(theirCard.GetCardId(), you.GetId());
            await you.GiveCard(newPlayerCard);
        }

        await tradeInfo.yourCard.RemoveOne();
        await tradeInfo.theirCard.RemoveOne();

        MessageService.ReplyMessage(messageInfo, `${tradeInfo.trader.GetMention()} en ${tradeInfo.with.GetMention()}, jullie hebben de kaarten geruild. Veel plezier ermee!`, true, false);
        this.RemoveTrade(tradeInfo);
        const trade = await Trade.STATIC_POST(tradeInfo.trader, tradeInfo.with, tradeInfo.yourCard.GetCard(), tradeInfo.theirCard.GetCard());
        Log.STATIC_POST(tradeInfo.trader, trade.id, LogType.Trade, `${tradeInfo.trader.GetDiscordName()} heeft de kaart '${tradeInfo.yourCard.GetCard().GetName()}' geruild met '${tradeInfo.with.GetDiscordName()}' voor de kaart ${tradeInfo.theirCard.GetCard()}.`);
    }

    private static FindExistingTrade(player:Player) {
        return this.trades.find(t => (t.trader == player || t.with == player));
    }

    private static RemoveTrade(tradeInfo:ITradeInfo) {
        tradeInfo.yourCard.StopUsingInTrade();
        tradeInfo.theirCard.StopUsingInTrade();

        const index = this.trades.indexOf(tradeInfo);
        this.trades.splice(index, 1);
    }

    private static async SendTradeNotFound(messageInfo:IMessageInfo, accept:boolean) {
        MessageService.ReplyMessage(messageInfo, 'Wat loop je nou allemaal te ' + (accept ? 'accepteren' : 'annuleren') + '? Je bent helemaal niet aan het ruilen!', false)
    }
}
