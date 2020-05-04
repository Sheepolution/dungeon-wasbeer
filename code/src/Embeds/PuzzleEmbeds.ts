import { MessageEmbed } from 'discord.js';
import Puzzle from '../Objects/Puzzle';
import ImageConstants from '../Constants/ImageConstants';
import SettingsConstants from '../Constants/SettingsConstants';

export default class PuzzleEmbeds {

    public static GetSudokuEmbed(puzzle:Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Sudoku')
            .setDescription('Op de stipjes moeten de cijfers 1 tot en met 9 ingevuld worden op zo\'n manier dat in elke horizontale lijn\
 én in elke verticale kolom en in elk van de negen blokjes de cijfers 1 tot en met 9 één keer voorkomen.\n\n```\n' + puzzle.GetContent() +'\n```')

        return embed;
    }
}