import Player from '../Objects/Player';
import { ClassType } from '../Enums/ClassType';
import MessageService from '../Services/MessageService';
import IMessageInfo from '../Interfaces/IMessageInfo';

export default class DungeonHandler {

    private static readonly classNames = Object.keys(ClassType);

    public static async OnCommand(messageInfo:IMessageInfo, player:Player, command:string, args:Array<string>) {
        switch (command) {
            case 'class':
                this.ChooseClass(messageInfo, player, args[0]);
                break;
            default:
                return false;
        }

        return true;
    }

    private static async ChooseClass(command:IMessageInfo, player:Player, className:string) {
        const playerClassName = player.GetClassName();
        if (playerClassName) {
            MessageService.SendMessage(command, `Je bent al de class ${playerClassName}. Je kan hier pas van veranderen wanneer je dood bent, of wanneer je opnieuw begint met \`;reset\`.`, false);
            return;
        }

        if (className == null) {
            this.SendUnknownClassName(command);
            return;
        }

        className = className.toTitleCase();

        if (!this.classNames.includes(className)) {
            this.SendUnknownClassName(command);
            return;
        }

        const classType = (<any>ClassType)[className];
        await player.SetClass(classType);
        MessageService.SendMessage(command, `Je bent nu de class ${className}!`, true)
    }

    private static async SendUnknownClassName(command:IMessageInfo) {
        MessageService.SendMessage(command, `Kies een van de volgende classes:\n${this.classNames.join(', ')}`, false);
    }
}