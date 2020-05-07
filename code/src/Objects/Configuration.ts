import ConfigurationModel from '../Models/ConfigurationModel';

export default class Configuration {

    protected id:string;
    private name:string;
    private value:string;
    private editDate:Date;

    public static async GET_ALL() {
        const models:ConfigurationModel = await ConfigurationModel.query();
        return models;
    }

    public async GET(id:string) {
        const model:ConfigurationModel = await ConfigurationModel.query().findById(id);
        await this.ApplyModel(model);
    }

    public async FIND_BY_NAME(name:string) {
        const models:ConfigurationModel = await ConfigurationModel.query().where({name: name});

        if (models.length == 0) {
            return false;
        }

        await this.ApplyModel(models[0]);
        return true;
    }

    public async UPDATE(data:any, trx?:any) {
        await ConfigurationModel.query(trx)
            .findById(this.id)
            .patch(data);
    }

    public async ApplyModel(model:ConfigurationModel) {
        this.id = model.id;
        this.name = await model.GetBattle();
        this.value = model.value;
        this.editDate = new Date(model.edit_date);
    }

    public GetId() {
        return this.id;
    }

    public GetName() {
        return this.name;
    }

    public GetValue() {
        return this.value
    }

    public GetValueAsBoolean() {
        return !(this.value == null || this.value == 'false' || this.value == '0');
    }

    public GetValueAsNumber() {
        return parseInt(this.value);
    }

    public SetValue(value:any) {
        this.value = value;
        this.UPDATE({
            value: this.value
        })
    }
}