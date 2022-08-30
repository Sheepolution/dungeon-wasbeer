import Configuration from '../Objects/Configuration';

export default class ConfigurationManager {

    private static configurations: Array<Configuration>;

    public static async BuildConfigurationList() {
        const configurations = new Array<Configuration>();

        const configurationModels: any = await Configuration.GET_ALL();
        for (const configurationModel of configurationModels) {
            const configuration = new Configuration();
            await configuration.ApplyModel(configurationModel);
            configurations.push(configuration);
        }

        this.configurations = configurations;
    }

    public static GetConfigurationByName(name: string) {
        return this.configurations.find(c => c.GetName() == name);
    }
}