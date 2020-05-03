import Card from '../Objects/Card';
import { MessageEmbed } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import Player from '../Objects/Player';
import EmojiConstants from '../Constants/EmojiConstants';
import ITradeInfo from '../Interfaces/ITradeInfo';
import CardService from '../Services/CardService';
import CharacterService from '../Services/CharacterService';

export default class CardEmbeds {

    public static GetCardEmbed(card:Card, amount:number = 1) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor(card.GetCategory(), 'https://cdn.discordapp.com/attachments/694331679204180029/706164324573380628/FashionIcoon4.png')
            .setTitle(card.GetName() + (amount == 1 ? '' : ' (x'+ amount + ')'))
            .setDescription(card.GetDescription())
            .setImage(card.GetImageUrl())
            .addField('Level', card.GetRankString());

        const modifiers = card.GetModifiers();
        const modifierClass = card.GetModifierClass();

        if (modifiers.length > 0) {
            embed.addField('Modifiers', CardService.ParseModifierArrayToEmbedString(modifiers),  true)
        }

        if (modifierClass) {
            embed.addField('Class', `${CharacterService.GetClassEmoji(modifierClass)} ${modifierClass.toString()}`, true);
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

    public static GetPlayerModifieCardListEmbed(player:Player) {
        const cardData:any = {};
        const playerCards = player.GetCards();

        for (const playerCard of playerCards) {
            const card = playerCard.GetCard();
            const name = card.GetName();
            const category = card.GetCategory();

            const modifiers = card.GetModifiers();
            if (modifiers.length == 0) {
                continue;
            }

            if (!cardData[category]) {
                cardData[category] = {};
            }

            if (cardData[category][name]) {
                cardData[category][name].amount += playerCard.GetAmount();
                continue;
            }

            cardData[category][name] = {rank: card.GetRank(), amount: playerCard.GetAmount(), modifiers: card.GetModifiers(), equipped: playerCard.IsEquipped()};
        }

        const embed = new MessageEmbed()
            .setTitle('De modifier kaarten van ' + player.GetDiscordName());

        for (const category in cardData) {
            var list = '';
            if ({}.hasOwnProperty.call(cardData, category)) {
                const categoryData = cardData[category];
                for (const name in categoryData) {
                    if ({}.hasOwnProperty.call(categoryData, name)) {
                        const card = categoryData[name];
                        const amount = categoryData[name].amount;
                        list += EmojiConstants.STARS[card.rank] + ' ' + name + (amount == 1 ? '' : ' (x' + amount + ')') + ( card.equipped ? ' ✅' : '') + '\n' + CardService.ParseModifierArrayToEmbedString(card.modifiers) + '\n';
                    }
                }
            }

            embed.addField(category, list, true);
        }

        return embed;
    }

    public static GetPlayerCardListEmbed(player:Player) {
        const cardData:any = {};
        const playerCards = player.GetCards();

        for (const playerCard of playerCards) {
            const card = playerCard.GetCard();
            const name = card.GetName();
            const category = card.GetCategory();

            if (!cardData[category]) {
                cardData[category] = {};
            }

            if (cardData[category][name]) {
                cardData[category][name].amount += playerCard.GetAmount();
                continue;
            }

            cardData[category][name] = {rank: card.GetRank(), amount: playerCard.GetAmount()};
        }

        const embed = new MessageEmbed()
            .setTitle('De kaarten van ' + player.GetDiscordName());

        for (const category in cardData) {
            var list = '';
            if ({}.hasOwnProperty.call(cardData, category)) {
                const categoryData = cardData[category];
                for (const name in categoryData) {
                    if ({}.hasOwnProperty.call(categoryData, name)) {
                        const amount = categoryData[name].amount;
                        list += EmojiConstants.STARS[categoryData[name].rank] + ' ' + name + (amount == 1 ? '' : ' (x' + amount + ')') + '\n'
                    }
                }
            }

            embed.addField(category, list, true);
        }

        return embed;
    }

    public static GetTradeEmbed(tradeInfo:ITradeInfo) {
        const embed = new MessageEmbed()
            .setImage(tradeInfo.yourCard.GetCard().GetImageUrl())
            .setThumbnail(tradeInfo.theirCard.GetCard().GetImageUrl());

        return embed;
    }
}