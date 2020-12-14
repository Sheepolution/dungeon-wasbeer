import Player from '../Objects/Player';
import { SortingType } from '../Enums/SortingType';
import PlayerCard from '../Objects/PlayerCard';
import CardManager from '../Managers/CardManager';

export default class PlayerCardService {

    public static GetPlayerCardList(player:Player, sortingType?:SortingType, otherPlayer?:Player):Array<PlayerCard> {

        var playerCards = player.GetCards();

        if (sortingType != null) {
            switch (sortingType) {
                case SortingType.Category:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => a.GetCard().GetCategory() > b.GetCard().GetCategory() ? 1 : -1);
                    break;
                case SortingType.Rank:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => a.GetCard().GetRank() - b.GetCard().GetRank());
                    break;
                case SortingType.Name:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => a.GetCard().GetName() > b.GetCard().GetName() ? 1 : -1);
                    break;
                case SortingType.Class:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => (a.GetCard().GetModifierClass() || '') > (b.GetCard().GetModifierClass() || '') ? -1 : 1);
                    break;
                case SortingType.Buff:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => {
                        const am = a.GetCard().GetModifiers();
                        const bm = b.GetCard().GetModifiers();
                        if (am == null || am.length == 0) { return 1; }
                        if (bm == null || bm.length == 0) { return -1; }
                        return am[0].modifier > bm[0].modifier ? 1 : -1;
                    });
                    break;
                case SortingType.Amount:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => b.GetAmount() - a.GetAmount());
                    break;
                case SortingType.Season:
                    playerCards.sort((a:PlayerCard, b:PlayerCard) => b.GetCard().GetSeason() - a.GetCard().GetSeason());
                    break;

            }
        }

        if (otherPlayer != null) {
            var otherCards = otherPlayer.GetCards();
            playerCards = playerCards.filter(c => !otherCards.find(o => o.GetCardId() == c.GetCardId()));
        }

        return playerCards;
    }

    public static FindCard(name:string) {
        const cards = CardManager.GetCardList().filter(c => c.GetName().toLowerCase().includes(name.toLowerCase()));
        if (cards.length == 0) {
            return;
        }

        cards.sort((a, b) => a.GetName().length - b.GetName().length);

        return cards[0];
    }
}