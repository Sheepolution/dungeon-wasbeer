import LogXPModel from '../Models/LogXPModel';

export default class LogXP {

    protected id: string;

    public static async STATIC_POST(battleId: string, characterId: string, xp: number, dateString: string, trx: any) {
        await LogXPModel.New(battleId, characterId, xp, dateString, trx);
    }
}