import Player from '../Objects/Player';
import { SortingType } from '../Enums/SortingType';
import PlayerCard from '../Objects/PlayerCard';
import { CardFilterType } from '../Enums/CardFilterType';
import CardService from './CardService';

export default class PlayerCardService {

    public static GetPlayerCardList(player:Player, sortingType?:SortingType, otherPlayer?:Player, filterType?:CardFilterType, filterValue?:string):Array<PlayerCard> {

        var playerCards = player.GetCards();

        if (otherPlayer != null) {
            var otherCards = otherPlayer.GetCards();
            playerCards = playerCards.filter(c => !otherCards.find(o => o.GetCardId() == c.GetCardId()));
        }

        if (filterType != null && filterValue != null) {
            switch (filterType) {
                case CardFilterType.Category:
                    playerCards = playerCards.filter(c => c.GetCard().GetCategory().toLowerCase().includes(filterValue || ''));
                    break;
                case CardFilterType.Season:
                    if (filterValue == '???') {
                        filterValue = '0';
                    }
                    playerCards = playerCards.filter(c => c.GetCard().GetSeason().toString() == filterValue);
                    break;
                case CardFilterType.Class:
                    playerCards = playerCards.filter(c => {
                        const classType = c.GetCard().GetModifierClass();
                        if (classType != null) {
                            return classType.toString().toLowerCase().includes(filterValue || '')
                        }
                        return false;
                    });
                    break;
                case CardFilterType.Buff:
                    playerCards = playerCards.filter(c => CardService.ParseModifierArrayToEmbedString(c.GetCard().GetModifiers()).toLowerCase().includes(filterValue || ''));
                    break;
            }
        }

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


        return playerCards;
    }
}