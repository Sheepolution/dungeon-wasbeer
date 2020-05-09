import { ICardModifier } from '../Interfaces/ICardModifier';
import { ModifierType } from '../Enums/ModifierType';
import ImageConstants from '../Constants/ImageConstants';

export default class CardService {

    public static ParseModifierStringToArray(modifierString?:string) {
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

            parsedModifiers.push({ modifier: modifier, value: parseInt(match[2]) })
        }

        return parsedModifiers;
    }

    public static ParseModifierArrayToDataString(modifierArray?:Array<ICardModifier>) {
        if (modifierArray == null || modifierArray.length == 0) {
            return ''
        }

        var modifierString = '';
        for (let i = 0; i < modifierArray.length; i++) {
            const modifier = modifierArray[i];
            modifierString += `${modifier.modifier.toString()}=${modifier.value}`;
            if (i < modifierArray.length - 1) {
                modifierString += '/';
            }
        }

        return modifierString
    }

    public static ParseModifierArrayToEmbedString(modifierArray?:Array<ICardModifier>) {
        if (modifierArray == null || modifierArray.length == 0) {
            return ''
        }

        var modifierString = '';
        for (let i = 0; i < modifierArray.length; i++) {
            const modifier = modifierArray[i];
            modifierString += `${modifier.modifier.toString()}: +${modifier.value}`;
            if (i < modifierArray.length - 1) {
                modifierString += '\n';
            }
        }

        return modifierString
    }

    public static GetIconByCategory(category:string) {
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
        }
    }
}