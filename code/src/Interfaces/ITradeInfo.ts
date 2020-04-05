import PlayerCard from "../PlayerCard";
import Player from "../Player";

export default interface ITradeInfo {
    trader: Player;
    with: Player;
    theirCard: PlayerCard;
    yourCard: PlayerCard;
    youAccepted: boolean,
    theyAccepted: boolean
}