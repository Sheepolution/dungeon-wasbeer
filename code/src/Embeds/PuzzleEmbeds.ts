import { MessageEmbed } from 'discord.js';
import Puzzle from '../Objects/Puzzle';
import ImageConstants from '../Constants/ImageConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { Utils } from '../Utils/Utils';

export default class PuzzleEmbeds {

    public static GetSudokuEmbed(puzzle:Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Sudoku')
            .setDescription('Op de stipjes moeten de cijfers 1 tot en met 9 ingevuld worden op zo\'n manier dat in elke horizontale lijn\
 én in elke verticale kolom en in elk van de negen blokjes de cijfers 1 tot en met 9 één keer voorkomen.\nStuur je antwoord op met `;antwoord [antwoord]`.\n\n```\n' + puzzle.GetContent() +'\n```')

        return embed;
    }

    public static GetPuzzleSolvedEmbed(puzzle:Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle('Opgelost!')
            .setImage(ImageConstants.SOLVED)
            .setDescription((Utils.Coin() ? 'Elke puzzel heeft een antwoord.' : 'Kritisch denken is de sleutel tot succes.') + '\n\n```\n' + puzzle.GetSolution() +'\n```');

        return embed;
    }
}