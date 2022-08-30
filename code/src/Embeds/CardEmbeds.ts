import Card from '../Objects/Card';
import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import Player from '../Objects/Player';
import EmojiConstants from '../Constants/EmojiConstants';
import ITradeInfo from '../Interfaces/ITradeInfo';
import CardService from '../Services/CardService';
import CharacterService from '../Services/CharacterService';
import CardManager from '../Managers/CardManager';
import PlayerCard from '../Objects/PlayerCard';
import { CardFilterType } from '../Enums/CardFilterType';
import IMessageInfo from '../Interfaces/IMessageInfo';

export default class CardEmbeds {

    public static GetCardEmbed(card: Card, amount: number = 1) {

        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({ name: card.GetCategory(), iconURL: CardService.GetIconByCategory(card.GetCategory()) })
            .setTitle(card.GetName() + (amount == 1 ? '' : ' (x' + amount + ')'))
            .setDescription(card.GetDescription())
            .setFooter({ text: `Seizoen ${card.GetSeason()}` })
            .setImage(card.GetImageUrl())
            .addFields({ name: 'Level', value: card.GetRankString() });

        const season = card.GetSeason();
        embed.setFooter({ text: `Seizoen ${season > 0 ? season : '???'}` });

        const modifiers = card.GetModifiers();
        const modifierClass = card.GetModifierClass();

        if (modifiers.length > 0) {
            embed.addFields({ name: 'Modifiers', value: CardService.ParseModifierArrayToEmbedString(modifiers), inline: true });
        }

        if (modifierClass) {
            embed.addFields({ name: 'Class', value: `${CharacterService.GetClassIconEmoji(modifierClass)} ${modifierClass.toString()}`, inline: true });
        }

        return embed;
    }

    public static GetFakeCardEmbed(messageInfo: IMessageInfo) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({ name: 'Exclusief', iconURL: CardService.GetIconByCategory('Exclusief') })
            .setTitle(messageInfo.member.displayName)
            .setDescription(['Dit is een topgozer!', 'Held.', 'Ja daar is ie dan!', 'Droomgozer', 'Misschien wel mijn favoriete persoon'].randomChoice())
            .setFooter({ text: 'Seizoen 4' })
            .setImage(messageInfo.member.user.displayAvatarURL())
            .addFields({ name: 'Level', value: ':star:'.repeat(5) });

        const season = 4;
        embed.setFooter({ text: `Seizoen ${season > 0 ? season : '???'}` });

        return embed;
    }

    public static GetCardStatsEmbed(cards: any) {
        const stats: any = {};
        for (const card of cards) {
            if (stats[card.category] == null) {
                stats[card.category] = [0, 0, 0, 0, 0];
            }

            stats[card.category][card.rank - 1]++;
        }

        const embed = new EmbedBuilder()
            .setTitle('Card statistics')
            .setDescription('Total: ' + cards.length + '\nRank 1/2/3/4/5');

        for (const key in stats) {
            if ({}.hasOwnProperty.call(stats, key)) {
                const list = stats[key];
                embed.addFields({ name: key, value: list.join('/') });
            }
        }

        return embed;
    }

    public static GetPlayerCardListEmbed(playerCards: Array<PlayerCard>, player: Player, page?: number, otherPlayer?: Player, filterType?: CardFilterType, filterValue?: string) {
        const cardsAmount = CardManager.GetAmountOfNormalCards();
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT);

        let title = `De kaarten van ${player.GetDiscordName()}`;

        if (otherPlayer != null) {
            title += ` die ${otherPlayer.GetDiscordName()} niet heeft`;
        }

        if (filterType != null && filterValue != null) {
            title += ` gefilterd op ${filterType.toString().toLowerCase()} ${filterValue.toTitleCase()}`;
        }

        embed.setTitle(title);

        const split = SettingsConstants.CARD_AMOUNT_SPLIT_PAGES;
        const pages = Math.ceil(playerCards.length / split);

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

        const start = page == null ? 0 : (page - 1) * split;
        const end = page == null ? playerCards.length : Math.min(playerCards.length, page * split);

        if (page != null) {
            embed.setFooter({ text: `${start + 1}-${end} van de ${playerCards.length} kaarten` });
        }

        let list = '';

        for (let i = start; i < end; i++) {
            const playerCard = playerCards[i];
            if (playerCard == null) {
                continue;
            }
            const card = playerCard.GetCard();
            const amount = playerCard.GetAmount();
            list += EmojiConstants.STARS[card.GetRank()] + CardService.GetIconEmojiByCategory(card.GetCategory()) + (playerCard.IsEquipped() ? ' ✅' : '') + ' ' + card.GetName() + (amount == 1 ? '' : ' (x' + amount + ')') + CardService.ParseCardModifersToEmbedString(card) + '\n';
        }

        const seasons = [];

        for (const playerCard of playerCards) {
            const cardSeason = playerCard.GetCard().GetSeason();
            if (cardSeason <= 0) {
                continue;
            }

            if (seasons[cardSeason] == null) {
                seasons[cardSeason] = 1;
            } else {
                seasons[cardSeason]++;
            }
        }

        let seasonText = '';

        for (let i = 0; i < seasons.length; i++) {
            const season = seasons[i];
            if (season != null) {
                seasonText += `\nSeizoen ${i}: ${season}/${CardManager.GetCardList().filter(c => c.GetSeason() == i).length}`;
            }
        }

        embed.setDescription(`Unieke kaarten: ${playerCards.length} van de ${cardsAmount}${seasonText}\n\n${list}`);

        return embed;
    }

    public static GetPlayerCardOwnerListEmbed(card: Card, ownerList: Array<any>, page?: number) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT);

        embed.setTitle(`Iedereen die de kaart ${card.GetName()} heeft`);

        const category = card.GetCategory();
        embed.setAuthor({ name: category, iconURL: CardService.GetIconByCategory(category) });

        const split = SettingsConstants.CARD_AMOUNT_SPLIT_PAGES;
        const pages = Math.ceil(ownerList.length / split);

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

        const start = page == null ? 0 : (page - 1) * split;
        const end = page == null ? ownerList.length : Math.min(ownerList.length, page * split);

        if (page != null) {
            embed.setFooter({ text: `${start + 1}-${end} van de ${ownerList.length} eigenaren` });
        }

        let list = '';

        for (let i = start; i < end; i++) {
            const owner = ownerList[i];

            if (owner == null) {
                continue;
            }

            list += `${(owner.equipped ? '✅ ' : ' ')}${owner.discord_name}${owner.amount > 1 ? ` (x${owner.amount})` : ''}\n`;
        }

        const classType = card.GetModifierClass();
        const modifiers = card.GetModifiers();
        const season = card.GetSeason();
        embed.setDescription(`${EmojiConstants.STARS[card.GetRank()]} Seizoen ${season > 0 ? season : '???'}\n${classType == null ? '' : `${CharacterService.GetClassIconEmoji(classType)} `}${modifiers.length > 0 ? `${CardService.ParseModifierArrayToEmbedString(modifiers)}\n` : ''}\n**Eigenaren**\n${list}`);
        embed.setThumbnail(card.GetImageUrl());

        return embed;
    }

    public static GetTradeEmbed(tradeInfo: ITradeInfo) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(tradeInfo.yourCard.GetCard().GetImageUrl())
            .setThumbnail(tradeInfo.theirCard.GetCard().GetImageUrl());

        return embed;
    }
}