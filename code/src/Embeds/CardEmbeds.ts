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

        const season = card.GetSeason();
        embed.setFooter(`Seizoen ${season > 0 ? season : '???'}`)

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

    public static GetPlayerCardListEmbed(playerCards:Array<PlayerCard>, player:Player, page?:number, otherPlayer?:Player) {
        const cardsAmount = CardManager.GetAmountOfNormalCards();
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT);

        if (otherPlayer != null) {
            embed.setTitle(`De kaarten van ${player.GetDiscordName()} die ${otherPlayer.GetDiscordName()} niet heeft`);
        } else {
            embed.setTitle(`De kaarten van ${player.GetDiscordName()}`);
        }

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

        const seasons = [];

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

    public static GetPlayerCardOwnerListEmbed(cardName:string, ownerList:Array<any>, page?:number) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT);

        embed.setTitle(`Iedereen die de kaart ${cardName} heeft`);

        var split = SettingsConstants.CARD_AMOUNT_SPLIT_PAGES;
        var pages = Math.ceil(ownerList.length/split);

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
        var end = page == null ? ownerList.length : Math.min(ownerList.length, page * split);

        if (page != null) {
            embed.setFooter(`${start + 1}-${end} van de ${ownerList.length} eigenaren`);
        }

        var list = '';

        for (let i = start; i < end; i++) {
            const owner = ownerList[i];

            if (owner == null) {
                continue;
            }

            list += `${(owner.equipped ? '✅ ' : ' ')}${owner.discord_name}${owner.amount > 1 ? ` (x${owner.amount})` : ''}\n`;
        }

        embed.setDescription(list);

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