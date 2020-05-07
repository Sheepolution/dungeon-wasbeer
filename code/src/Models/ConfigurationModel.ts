import { Utils } from '../Utils/Utils';

const { Model } = require('objection');

export default class ConfigurationModel extends Model {

    static get tableName() {
        return 'configurations';
    }

    public static async New(name:string, value:any) {
        const configurationId = Utils.UUID();

        const configuration = await ConfigurationModel.query()
            .insert({
                id: configurationId,
                name: name,
                value: value,
                edit_date: Utils.GetNowString(),
            })

        return configuration;
    }
}