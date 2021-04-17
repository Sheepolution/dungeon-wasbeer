import { MessageEmbed } from 'discord.js';
import Puzzle from '../Objects/Puzzle';
import ImageConstants from '../Constants/ImageConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import PuzzleService from '../Services/PuzzleService';
import { Utils } from '../Utils/Utils';

export default class PuzzleEmbeds {

    public static GetSudokuEmbed(puzzle: Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(PuzzleService.GetPuzzleImage(puzzle))
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Sudoku')
            .setDescription('Op de stipjes moeten de cijfers 1 tot en met 9 ingevuld worden op zo\'n manier dat in elke horizontale lijn\
 én in elke verticale kolom en in elk van de negen blokjes de cijfers 1 tot en met 9 één keer voorkomen.\nStuur je antwoord op met `;antwoord [oplossing]`.\n\n```\n' + puzzle.GetContent() + '\n```');

        return embed;
    }

    public static GetChestEmbed(puzzle: Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setImage(PuzzleService.GetPuzzleImage(puzzle))
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Monsters')
            .setDescription(`Tijdens jullie reis zijn jullie vele monsters tegengekomen. Wat weten jullie daar nog over? Geef als antwoord de namen van de monsters in de volgorde van de vragen, onder elkaar.

Voorbeeld:
;antwoord Dragon Turtle
Ancient Red Dragon
Ancient Gold Dragon
etc...

Beantwoord de volgende vragen:
${puzzle.GetContent()}`);

        return embed;
    }

    public static GetPuzzleSolvedEmbed(puzzle: Puzzle) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle('Opgelost!')
            .setImage(ImageConstants.SOLVED)
            .setDescription('Kritisch denken is de sleutel tot succes.' + '\n\n```\n' + puzzle.GetSolution() + '\n```')
            .setFooter(`Tijd: ${Utils.GetSecondsInMinutesAndSeconds(puzzle.GetDuration())}`);

        return embed;
    }

    public static GetFocusSudokuEmbed(sudoku: string) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Sudoku')
            .setDescription('Op de stipjes moeten de cijfers 1 tot en met 9 ingevuld worden op zo\'n manier dat in elke horizontale lijn\
 én in elke verticale kolom en in elk van de negen blokjes de cijfers 1 tot en met 9 één keer voorkomen.\nStuur je antwoord op met `;antwoord [oplossing]`\
 in het #kantoorberen kanaal. Als je Sudoku\'s lastig vind kan je natuurlijk gewoon zo\'n sudoku solver gebruiken. Zolang je het maar een beetje stiekem doet!\n\n```\n' + sudoku + '\n```');
        return embed;
    }

    public static GetTrainingSudokuEmbed(sudoku: string) {
        const embed = new MessageEmbed()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor('Puzzel', ImageConstants.ICONS.PUZZLE)
            .setTitle('Sudoku')
            .setDescription('Op de stipjes moeten de cijfers 1 tot en met 9 ingevuld worden op zo\'n manier dat in elke horizontale lijn\
 én in elke verticale kolom en in elk van de negen blokjes de cijfers 1 tot en met 9 één keer voorkomen.\nStuur je antwoord op met `;antwoord [oplossing]`\
 in dit kanaal.\n\n```\n' + sudoku + '\n```');
        return embed;
    }
}