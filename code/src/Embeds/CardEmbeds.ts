import Card from '../Objects/Card';
import { MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import Player from '../Objects/Player';
import EmojiConstants from '../Constants/EmojiConstants';
import ITradeInfo from '../Interfaces/ITradeInfo';
import CardService from '../Services/CardService';
import CharacterService from '../Services/CharacterService';
import CardManager from '../Managers/CardManager';
import PlayerCard from '../Objects/PlayerCard';
import { SortingType } from '../Enums/SortingType';

export default class CardEmbeds {

    public static GetCardEmbed(card:Card, amount:number = 1) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(card.GetCategory(), CardService.GetIconByCategory(card.GetCategory()))
            .setTitle(card.GetName() + (amount == 1 ? '' : ' (x'+ amount + ')'))
            .setDescription(card.GetDescription())
            .setFooter(`Seizoen ${card.GetSeason()}`)
            .setImage(card.GetImageUrl())
            .addField('Level', card.GetRankString());

        const modifiers = card.GetModifiers();
        const modifierClass = card.GetModifierClass();

        if (modifiers.length > 0) {
            embed.addField('Modifiers', CardService.ParseModifierArrayToEmbedString(modifiers),  true)
        }

        if (modifierClass) {
            embed.addField('Class', `${CharacterService.GetClassIconEmoji(modifierClass)} ${modifierClass.toString()}`, true);
        }

        return embed;
    }

    public static GetCardStatsEmbed(cards:any) {
        const stats:any = {};
        for (const card of cards) {
            if (stats[card.category] == null) {
                stats[card.category] = [0, 0, 0, 0, 0];
            }

            stats[card.category][card.rank - 1]++;
        }

        const embed = new MessageEmbed()
            .setTitle('Card statistics')
            .setDescription('Total: ' + cards.length + '\nRank 1/2/3/4/5')

        for (const key in stats) {
            if ({}.hasOwnProperty.call(stats, key)) {
                const list = stats[key];
                embed.addField(key, list.join('/'));
            }
        }

        return embed;
    }

    public static GetPlayerCardListEmbed(player:Player, page?:number, sortingType?:SortingType) {
        const playerCards = player.GetCards();

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

            }
        }

        const cardsAmount = CardManager.GetAmountOfNormalCards();
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('De kaarten van ' + player.GetDiscordName())

        var split = SettingsConstants.CARD_AMOUNT_SPLIT_PAGES;
        var pages = Math.ceil(playerCards.length/split);

        if (page != null) {
            if (page == 0) {
                page = pages;
            } else {
                while (page <= 0) {
                    page += pages;
                }

                while (page > pages) {
                    page -= pages;
                }
            }
        }

        var start = page == null ? 0 : (page-1) * split;
        var end = page == null ? playerCards.length : Math.min(playerCards.length, page * split);

        if (page != null) {
            embed.setFooter(`${start + 1}-${end} van de ${playerCards.length} kaarten`);
        }

        var list = '';

        for (let i = start; i < end; i++) {
            const playerCard = playerCards[i];
            if (playerCard == null) {
                continue;
            }
            const card = playerCard.GetCard();
            const amount = playerCard.GetAmount();
            list += EmojiConstants.STARS[card.GetRank()] + CardService.GetIconEmojiByCategory(card.GetCategory()) + ( playerCard.IsEquipped() ? ' ✅' : '') + ' ' + card.GetName() + (amount == 1 ? '' : ' (x' + amount + ')') + CardService.ParseCardModifersToEmbedString(card) + '\n';
        }

        var seasons = [];

        for (const playerCard of playerCards) {
            var cardSeason = playerCard.GetCard().GetSeason()
            if (cardSeason <= 0) {
                continue;
            }

            if (seasons[cardSeason] == null) {
                seasons[cardSeason] = 1;
            } else {
                seasons[cardSeason]++;
            }
        }

        var seasonText = '';

        for (let i = 0; i < seasons.length; i++) {
            const season = seasons[i];
            if (season != null) {
                seasonText += `\nSeizoen ${i}: ${season}/${CardManager.GetCardList().filter(c => c.GetSeason() == i).length}`;
            }
        }

        embed.setDescription(`Unieke kaarten: ${playerCards.length} van de ${cardsAmount}${seasonText}\n\n${list}`);

        return embed;
    }

    public static GetTradeEmbed(tradeInfo:ITradeInfo) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(tradeInfo.yourCard.GetCard().GetImageUrl())
            .setThumbnail(tradeInfo.theirCard.GetCard().GetImageUrl());

        return embed;
    }
}