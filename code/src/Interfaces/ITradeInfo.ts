import Player from '../Objects/Player';
import PlayerCard from '../Objects/PlayerCard';

export default interface ITradeInfo {
    trader: Player;
    with: Player;
    theirCard: PlayerCard;
    yourCard: PlayerCard;
    youAccepted: boolean,
    theyAccepted: boolean
}