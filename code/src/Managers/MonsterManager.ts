import Monster from '../Objects/Monster';
import IObjectModifyResult from '../Interfaces/IObjectModifyResult';
import { AttackType } from '../Enums/AttackType';

export default class MonsterManager {

    private static monsterList:Array<Monster>;

    public static async BuildMonsterList() {
        const monsterList = new Array<Monster>();

        const monsterModels:any = await Monster.GET_ALL();
        for (const monsterModel of monsterModels) {
            const monster = new Monster();
            await monster.ApplyModel(monsterModel);
            monsterList.push(monster);
        }

        this.monsterList = monsterList;
    }

    public static async AddNewMonster(name:string, description:string, level:number, category:string, type:AttackType, health:number, strength:number, attack:number, attackDescription:string, attackCritDescription:string, imageUrl:string, creatorId:string) {
        const monster = new Monster();
        const objectModifyResult:IObjectModifyResult = { object: monster, result: false };

        if (await monster.FIND_BY_NAME(name)) {
            return objectModifyResult;
        }

        await monster.POST(name, description, level, category, type, health, strength, attack, attackDescription, attackCritDescription, imageUrl, creatorId);

        objectModifyResult.result = true;
        return objectModifyResult;

    }

    public static async EditMonster(originalName:string, name?:string, description?:string, level?:number, category?:string, type?:AttackType, health?:number, strength?:number, attack?:number, attackDescription?:string, attackCritDescription?:string, imageUrl?:string) {
        const monster = new Monster();
        const monsterModifyResult:IObjectModifyResult = { object: monster, result: false };

        if (!await monster.FIND_BY_NAME(originalName)) {
            return monsterModifyResult;
        }

        await monster.EditMonster(name, description, level, category, type, health, strength, attack, attackDescription, attackCritDescription, imageUrl);

        monsterModifyResult.result = true;
        return monsterModifyResult;
    }

    public static GetRandomMonster() {
        return this.monsterList.randomChoice();
    }
}