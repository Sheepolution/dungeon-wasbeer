import { Client, Message } from 'discord.js';

export default class Discord {

    public static client:Client;

    public static eventReadyCallback:Function;
    public static eventMessageCallback:Function;

    public static SetEventReadyCallback(callback:Function) {
        this.eventReadyCallback = callback;
    }

    public static SetEventMessageCallback(callback:Function) {
        this.eventMessageCallback = callback;
    }

    public static Init() {
        this.client = new Client();
        const client = this.client;

        client.on('ready', async () => { await Discord.EventReady() });
        client.on('message', async (message) => { await Discord.EventMessage(message) });
        client.login(process.env.TOKEN);
    }

    private static async EventReady () {
        this.eventReadyCallback();
    }

    private static async EventMessage (message:Message) {
        if (message.author.bot) {
            return;
        }

        if (message.guild == null) {
            return;
        }

        this.eventMessageCallback(message);
    }
}