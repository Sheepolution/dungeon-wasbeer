import IMessageInfo from "./IMessageInfo";
import Card from "./Card";
import PlayerCard from "./PlayerCard";
import Player from "./Player";
import Embedder from "./Embedder";
import Constants from "./Constants";
import ITradeInfo from "./Interfaces/ITradeInfo";
import GameManager from "./GameManager";

export default class TradeHandler {

    public static trades:Array<ITradeInfo> = new Array<ITradeInfo>();

    public static async OnTrade(command:IMessageInfo, player:Player, args:string) {
        var match = args.match(/<@!?(\d+)>\s(.+?)\s>\s(.+)/);
        if (match == null) {
            Embedder.SendTradeParseFailed(command);
            return;
        }

        var otherPlayerGet = await GameManager.GetPlayer(match[1]);

        if (otherPlayerGet == null) {
            if (match[1] == process.env.BOT_ID) {
                Embedder.SendTradeNotWithBot(command);
            }
            else {
                Embedder.SendTradeOtherPlayerNoCards(command);
            }
            return;
        }

        const otherPlayer = <Player> otherPlayerGet;
        
        if (player == otherPlayer) {
            Embedder.SendTradeWithSelf(command);
            return;
        }

        const yourTrade = this.FindExistingTrade(player);
        const theirTrade = this.FindExistingTrade(otherPlayer);

        if (yourTrade != null && yourTrade == theirTrade) {
            Embedder.SendTradeBothAlreadyTrading(command);
            return;
        }

        if (yourTrade != null) {
            Embedder.SendTradeYouAlreadyTrading(command, yourTrade);
            return;
        }

        if (theirTrade != null) {
            Embedder.SendTradeTheyAlreadyTrading(command, theirTrade);
            return;
        }

        const searchMine = match[2];
        const searchTheirs = match[3];

        const yourCard = player.FindCard(searchMine);
        const theirCard = otherPlayer.FindCard(searchTheirs);

        if (yourCard == null) {
            Embedder.SendTradeYourCardNotFound(command, searchMine);
            return;
        }

        if (theirCard == null) {
            Embedder.SendTradeTheirCardNotFound(command, otherPlayer, searchTheirs);
            return;
        }

        this.StartTrade(command, player, otherPlayer, yourCard, theirCard);
    }

    private static StartTrade(command:IMessageInfo, player:Player, otherPlayer:Player, yourCard:PlayerCard, theirCard:PlayerCard) {
        const tradeInfo:ITradeInfo = {
            trader: player,
            with: otherPlayer,
            yourCard: yourCard,
            theirCard: theirCard,
            youAccepted: false,
            theyAccepted: false
        };

        this.trades.push(tradeInfo);
        Embedder.SendTradeStarted(command, tradeInfo)
    }

    public static AcceptTrade(command:IMessageInfo, player:Player) {
        const tradeInfo = this.FindExistingTrade(player);
        if (tradeInfo == null) {
            Embedder.SendTradeNotFound(command, true);
            return;
        }

        if (tradeInfo.trader == player) {
            tradeInfo.youAccepted = true;
        }
        else {
            tradeInfo.theyAccepted = true;
        }

        if (tradeInfo.youAccepted && tradeInfo.theyAccepted) {
            this.CompleteTrade(command, tradeInfo)
            for (let i = 0; i < this.trades.length; i++) {
                if (tradeInfo == this.trades[i]) {
                    this.trades.splice(i, 1);
                    break;
                }
            }
        }
        else {
            command.message?.react(Constants.Emojis.Status.good);
        }
    }

    public static CancelTrade(command:IMessageInfo, player:Player) {
        const tradeInfo = this.FindExistingTrade(player);
        if (tradeInfo == null) {
            Embedder.SendTradeNotFound(command, false);
            return;
        }
        this.RemoveTrade(tradeInfo);
        Embedder.SendTradeCancelled(command);
    }

    private static async CompleteTrade(command:IMessageInfo, tradeInfo:ITradeInfo) {
        const you = tradeInfo.trader;
        const they = tradeInfo.with;
        const yourCard = tradeInfo.yourCard;
        const theirCard = tradeInfo.theirCard;

        const existingTheirCard = they.GetCards().find(x => x.GetCardId() == yourCard.GetCardId());

        if (existingTheirCard != null) {
            await existingTheirCard.AddCard();
        }
        else {
            const newPlayerCard = new PlayerCard(they);
            await newPlayerCard.POST(yourCard.GetCardId(), they.GetId());
            await they.GiveCard(newPlayerCard);
        }

        const existingYourCard = you.GetCards().find(x => x.GetCardId() == theirCard.GetCardId());

        if (existingYourCard != null) {
            await existingYourCard.AddCard();
        }
        else {
            const newPlayerCard = new PlayerCard(you);
            await newPlayerCard.POST(theirCard.GetCardId(), you.GetId());
            await you.GiveCard(newPlayerCard);
        }

        await tradeInfo.yourCard.RemoveOne();
        await tradeInfo.theirCard.RemoveOne();

        Embedder.SendTradeSuccessful(command, tradeInfo);
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
}