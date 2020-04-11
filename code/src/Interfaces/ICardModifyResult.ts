import Card from '../Objects/Card';
import PlayerCard from '../Objects/PlayerCard';

export default interface ICardModifyResult {
    card:Card|PlayerCard;
    result:boolean;
}