import Monster from '../Objects/Monster';
import IObjectModifyResult from '../Interfaces/IObjectModifyResult';
import { AttackType } from '../Enums/AttackType';
import Battle from '../Objects/Battle';
import { Utils } from '../Utils/Utils';
import SettingsConstants from '../Constants/SettingsConstants';

export default class MonsterManager {

    private static monsterList: Array<Monster>;

    public static async BuildMonsterList() {
        const monsterList = new Array<Monster>();

        const monsterModels: any = await Monster.GET_ALL();
        for (const monsterModel of monsterModels) {
            const monster = new Monster();
            await monster.ApplyModel(monsterModel);
            monsterList.push(monster);
        }

        this.monsterList = monsterList;
    }

    public static async AddNewMonster(name: string, description: string, level: number, category: string, type: AttackType, health: number, strength: number, attack: number, attackDescription: string, attackCritDescription: string, imageUrl: string, creatorId: string) {
        const monster = new Monster();
        const objectModifyResult: IObjectModifyResult = { object: monster, result: false };

        if (await monster.FIND_BY_NAME(name)) {
            return objectModifyResult;
        }

        this.monsterList.push(monster);
        await monster.POST(name, description, level, category, type, health, strength, attack, attackDescription, attackCritDescription, imageUrl, creatorId, this.monsterList.length);

        objectModifyResult.result = true;
        return objectModifyResult;

    }

    public static async EditMonster(originalName: string, name?: string, description?: string, level?: number, category?: string, type?: AttackType, health?: number, strength?: number, attack?: number, attackDescription?: string, attackCritDescription?: string, imageUrl?: string) {
        const monster = new Monster();
        const monsterModifyResult: IObjectModifyResult = { object: monster, result: false };

        if (!await monster.FIND_BY_NAME(originalName)) {
            return monsterModifyResult;
        }

        await monster.EditMonster(name, description, level, category, type, health, strength, attack, attackDescription, attackCritDescription, imageUrl);

        monsterModifyResult.result = true;
        return monsterModifyResult;
    }

    public static GetMonsterByNumber(n: number) {
        return this.monsterList.find(m => m.GetNumber() == n);
    }

    public static async GetRandomMonster(previousMonster?: Monster) {
        const count = parseInt(await Battle.GET_COUNT());
        if (count == 201 || (count > 100 && (count + 1) % 100 == 0)) {
            return <Monster>this.monsterList.find(m => m.GetId() == '20110b21-0a15-48f8-83a9-b4f804235355');
        }

        const monsterCountList = await Battle.GET_MONSTER_COUNT_LIST();

        var monster: Monster = new Monster();
        do {
            for (const row of monsterCountList) {
                if (Utils.Chance(SettingsConstants.MONSTER_PICK_CHANCE)) {
                    monster = <Monster>this.monsterList.find(m => m.GetId() == row.id);
                    break;
                }
            }
        } while ((previousMonster != null && monster.GetId() == previousMonster.GetId()) || monster.GetId() == '20110b21-0a15-48f8-83a9-b4f804235355');

        return monster;
    }

    public static GetNumberOfMonsters() {
        return this.monsterList.length;
    }
}