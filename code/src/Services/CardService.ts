import { ICardModifier } from '../Interfaces/ICardModifier';
import { ModifierType } from '../Enums/ModifierType';
import ImageConstants from '../Constants/ImageConstants';
import EmojiConstants from '../Constants/EmojiConstants';
import Card from '../Objects/Card';
import CharacterService from './CharacterService';
import { CardFilterType } from '../Enums/CardFilterType';
import CardManager from '../Managers/CardManager';

export default class CardService {

    public static ParseModifierStringToArray(modifierString?: string) {
        if (modifierString == null) {
            return null;
        }

        const parsedModifiers = new Array<ICardModifier>();
        const modifierParts = modifierString.split('/');
        for (const modifierPart of modifierParts) {
            const match = modifierPart.match(/(.+?)=(-?\d+)/);
            if (match == null) {
                return;
            }

            const modifier = (<any>ModifierType)[match[1].toTitleCase()];
            if (modifier == null) {
                return;
            }

            parsedModifiers.push({ modifier: modifier, value: parseInt(match[2]) });
        }

        return parsedModifiers;
    }

    public static ParseModifierArrayToDataString(modifierArray?: Array<ICardModifier>) {
        if (modifierArray == null || modifierArray.length == 0) {
            return undefined;
        }

        var modifierString = '';
        for (let i = 0; i < modifierArray.length; i++) {
            const modifier = modifierArray[i];
            modifierString += `${modifier.modifier.toString()}=${modifier.value}`;
            if (i < modifierArray.length - 1) {
                modifierString += '/';
            }
        }

        return modifierString;
    }

    public static ParseCardModifersToEmbedString(card: Card) {
        const modifierArray = card.GetModifiers();
        if (modifierArray == null || modifierArray.length == 0) {
            return '';
        }

        var modifierString = ' | ';
        for (let i = 0; i < modifierArray.length; i++) {
            const modifier = modifierArray[i];
            modifierString += `${modifier.modifier.toString()}: +${modifier.value}`;
            if (i < modifierArray.length - 1) {
                modifierString += ', ';
            }
        }

        const modifierClass = card.GetModifierClass();
        if (modifierClass != null) {
            modifierString += ' | ' + `${CharacterService.GetClassIconEmoji(modifierClass)} ${modifierClass.toString()}`;
        }

        return modifierString;
    }

    public static ParseModifierArrayToEmbedString(modifierArray?: Array<ICardModifier>) {
        if (modifierArray == null || modifierArray.length == 0) {
            return '';
        }

        var modifierString = '';
        for (let i = 0; i < modifierArray.length; i++) {
            const modifier = modifierArray[i];
            modifierString += `${modifier.modifier.toString()}: ${modifier.value >= 0 ? '+' : ''}${modifier.value}`;
            if (i < modifierArray.length - 1) {
                modifierString += '\n';
            }
        }

        return modifierString;
    }

    public static GetIconByCategory(category: string) {
        switch (category) {
            case 'Chonky':
                return ImageConstants.ICONS.CHONKY;
            case 'Feestdagen':
                return ImageConstants.ICONS.HOLIDAYS;
            case 'Fashion':
                return ImageConstants.ICONS.FASHION;
            case 'Baby':
                return ImageConstants.ICONS.BABY;
            case 'Cosplay':
                return ImageConstants.ICONS.COSPLAY;
            case 'Vrienden':
                return ImageConstants.ICONS.FRIENDS;
            case 'Strijders':
                return ImageConstants.ICONS.FIGHTER;
            case 'Snacc':
                return ImageConstants.ICONS.SNACK;
            case 'Trash':
                return ImageConstants.ICONS.TRASH;
            case 'Sleepy':
                return ImageConstants.ICONS.SLEEP;
            case 'Stream':
                return ImageConstants.ICONS.STREAM;
            case 'Vintage':
                return ImageConstants.ICONS.VINTAGE;
            case 'Drunk':
                return ImageConstants.ICONS.DRUNK;
            case 'Voertuigen':
                return ImageConstants.ICONS.DRIVE;
            case 'Legendarisch':
                return ImageConstants.ICONS.LEGENDARY;
            case 'Sport':
                return ImageConstants.ICONS.SPORT;
            case 'Opgezet':
                return ImageConstants.ICONS.TAXIDERMIZED;
            case 'Nachtmerrie':
                return ImageConstants.ICONS.NIGHTMARE;
            case 'Albino':
                return ImageConstants.ICONS.ALBINO;
            case 'Dungeons en Wasberen':
                return ImageConstants.ICONS.DNW;
            case 'Kunst':
                return ImageConstants.ICONS.ART;
            case 'Exclusief':
                return ImageConstants.ICONS.EXCLUSIVE;
            case 'Media':
                return ImageConstants.ICONS.MEDIA;
            case 'Furry':
                return ImageConstants.ICONS.FURRY;
            case 'Meme':
                return ImageConstants.ICONS.MEME;
            default:
                return ImageConstants.ICONS.EXCLUSIVE;
        }
    }

    public static GetIconEmojiByCategory(category: string) {
        switch (category) {
            case 'Chonky':
                return EmojiConstants.CARD_CATEGORIES.CHONKY;
            case 'Feestdagen':
                return EmojiConstants.CARD_CATEGORIES.HOLIDAYS;
            case 'Fashion':
                return EmojiConstants.CARD_CATEGORIES.FASHION;
            case 'Baby':
                return EmojiConstants.CARD_CATEGORIES.BABY;
            case 'Cosplay':
                return EmojiConstants.CARD_CATEGORIES.COSPLAY;
            case 'Vrienden':
                return EmojiConstants.CARD_CATEGORIES.FRIENDS;
            case 'Strijders':
                return EmojiConstants.CARD_CATEGORIES.FIGHTER;
            case 'Snacc':
                return EmojiConstants.CARD_CATEGORIES.SNACK;
            case 'Trash':
                return EmojiConstants.CARD_CATEGORIES.TRASH;
            case 'Sleepy':
                return EmojiConstants.CARD_CATEGORIES.SLEEP;
            case 'Stream':
                return EmojiConstants.CARD_CATEGORIES.STREAM;
            case 'Vintage':
                return EmojiConstants.CARD_CATEGORIES.VINTAGE;
            case 'Drunk':
                return EmojiConstants.CARD_CATEGORIES.DRUNK;
            case 'Voertuigen':
                return EmojiConstants.CARD_CATEGORIES.DRIVE;
            case 'Legendarisch':
                return EmojiConstants.CARD_CATEGORIES.LEGENDARY;
            case 'Sport':
                return EmojiConstants.CARD_CATEGORIES.SPORT;
            case 'Opgezet':
                return EmojiConstants.CARD_CATEGORIES.TAXIDERMIZED;
            case 'Nachtmerrie':
                return EmojiConstants.CARD_CATEGORIES.NIGHTMARE;
            case 'Albino':
                return EmojiConstants.CARD_CATEGORIES.ALBINO;
            case 'Dungeons en Wasberen':
                return EmojiConstants.CARD_CATEGORIES.DNW;
            case 'Kunst':
                return EmojiConstants.CARD_CATEGORIES.ART;
            case 'Exclusief':
                return EmojiConstants.CARD_CATEGORIES.EXCLUSIVE;
            case 'Media':
                return EmojiConstants.CARD_CATEGORIES.MEDIA;
            case 'Furry':
                return EmojiConstants.CARD_CATEGORIES.FURRY;
            case 'Meme':
                return EmojiConstants.CARD_CATEGORIES.MEME;
            default:
                return ImageConstants.ICONS.EXCLUSIVE;
        }
    }

    public static FindCards(name: string) {
        const cards = CardManager.GetCardList().filter(c => c.GetName().toLowerCase().includes(name.toLowerCase()));
        if (cards.length == 0) {
            return;
        }

        cards.sort((a, b) => a.GetName().length - b.GetName().length);

        return cards;
    }

    public static GetFilterType(filterType: string) {
        switch (filterType.toLowerCase()) {
            case 'categorie':
            case 'category':
                return CardFilterType.Category;
            case 'level':
            case 'sterren':
            case 'stars':
            case 'rank':
                return CardFilterType.Level;
            case 'season':
            case 'seizoen':
                return CardFilterType.Season;
            case 'class':
                return CardFilterType.Class;
            case 'buff':
            case 'buffs':
                return CardFilterType.Buff;
        }

        return CardFilterType.None;
    }
}