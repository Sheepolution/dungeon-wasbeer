import IMessageInfo from "./IMessageInfo";
import Player from "./Player";
import Embedder from "./Embedder";
import { ClassType } from "./Enums/ClassType";

export default class DungeonHandler {

    private static readonly classNames = Object.keys(ClassType);

    public static async ChooseClass(command:IMessageInfo, player:Player, className:string) {
        const playerClassName = player.GetClassName();
        if (playerClassName) {
            Embedder.SendMessage(command, `Je bent al de class ${playerClassName}. Je kan hier pas van veranderen wanneer je dood bent, of wanneer je opnieuw begint met \`;reset\`.`, false);
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
        Embedder.SendMessage(command, `Je bent nu de class ${className}!`, true)
    }

    private static async SendUnknownClassName(command:IMessageInfo) {
        Embedder.SendMessage(command, `Kies een van de volgende classes:\n${this.classNames.join(", ")}`, false);
    }
}