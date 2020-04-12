import IMessageInfo from '../Interfaces/IMessageInfo';
import ITradeInfo from '../Interfaces/ITradeInfo';
import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';
import PlayerService from '../Services/PlayerService';
import EmojiConstants from '../Constants/EmojiConstants';
import MessageService from '../Services/MessageService';
import CardEmbeds from '../Embeds/CardEmbeds';

export default class TradeHandler {

    private static trades:Array<ITradeInfo> = new Array<ITradeInfo>();
    private static readonly tradeInstructions = 'Zeg beiden `;accepteer` als je de ruil wilt accepteren. Zeg `;annuleer` als je de ruil wilt annuleren.';

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>) {
        switch (command) {
            case 'ruil':
                this.OnTrade(messageInfo, player, args[0]);
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
            MessageService.SendMessage(messageInfo, 'Ik begrijp je niet helemaal. Zorg dat je het formaat aanhoudt:\n`;ruil @mention jouw kaart > hun kaart`', false);
            return;
        }

        var otherPlayerGet = await PlayerService.GetPlayer(match[1]);

        if (otherPlayerGet == null) {
            if (match[1] == process.env.BOT_ID) {
                MessageService.SendMessage(messageInfo, 'Dat is een mooie kaart, maar nee bedankt.');
            } else {
                MessageService.SendMessage(messageInfo, 'Die gozer heeft nog helemaal geen kaarten joh.', false);
            }
            return;
        }

        const otherPlayer = <Player> otherPlayerGet;

        if (player == otherPlayer) {
            MessageService.SendMessage(messageInfo, 'Je kan niet met jezelf ruilen. Het klinkt ook wel een beetje zielig.', false);
            return;
        }

        const yourTrade = this.FindExistingTrade(player);
        const theirTrade = this.FindExistingTrade(otherPlayer);

        if (yourTrade != null && yourTrade == theirTrade) {
            MessageService.SendMessage(messageInfo, 'Jullie twee zijn al aan het ruilen. ' + this.tradeInstructions, false);
            return;
        }

        if (yourTrade != null) {
            MessageService.SendMessage(messageInfo, `Jij bent al aan het ruilen met ${yourTrade.with.GetDiscordName()}. ${this.tradeInstructions}`, false);
            return;
        }

        if (theirTrade != null) {
            MessageService.SendMessage(messageInfo, `${theirTrade.trader.GetDiscordName()} is al aan het ruilen met ${theirTrade.with.GetDiscordName()}`, false);
            return;
        }

        const searchMine = match[2];
        const searchTheirs = match[3];

        const yourCard = player.FindCard(searchMine);
        const theirCard = otherPlayer.FindCard(searchTheirs);

        if (yourCard == null) {
            MessageService.SendMessage(messageInfo, `Je hebt geen kaart die lijkt op ${searchMine}.`, false);
            return;
        }

        if (theirCard == null) {
            MessageService.SendMessage(messageInfo, `${otherPlayer.GetDiscordName()} heeft geen kaart die lijkt op ${searchTheirs}.`, false);
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
        MessageService.SendMessage(messageInfo, 'De ruil is geannuleerd.');
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

        this.trades.push(tradeInfo);
        MessageService.SendEmbed(messageInfo, CardEmbeds.GetTradeEmbed(tradeInfo), `${tradeInfo.with.GetMention()}, wil jij jouw '${tradeInfo.theirCard.GetCard().GetName()}' ruilen voor de '${tradeInfo.yourCard.GetCard().GetName()}' van ${tradeInfo.trader.GetMention()}? ${this.tradeInstructions}`)
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

        MessageService.SendMessage(messageInfo, `${tradeInfo.trader.GetMention()} en ${tradeInfo.with.GetMention()}, jullie hebben de kaarten geruild. Veel plezier ermee!`, true, false);
        this.RemoveTrade(tradeInfo);
    }

    private static FindExistingTrade(player:Player) {
        return this.trades.find(t => (t.trader == player || t.with == player));
    }

    private static RemoveTrade(tradeInfo:ITradeInfo) {
        for (let i = 0; i < this.trades.length; i++) {
            if (tradeInfo == this.trades[i]) {
                this.trades.splice(i, 1);
                break;
            }
        }
    }

    private static async SendTradeNotFound(messageInfo:IMessageInfo, accept:boolean) {
        MessageService.SendMessage(messageInfo, 'Wat loop je nou allemaal te ' + (accept ? 'accepteren' : 'annuleren') + '? Je bent helemaal niet aan het ruilen!', false)
    }
}