import { Client, Message, MessageReaction, User } from 'discord.js';
import DiscordService from '../Services/DiscordService';

export default class Discord {

    public static client: Client;

    public static eventReadyCallback: Function;
    public static eventMessageCallback: Function;
    public static eventReactionAddCallback: Function;
    public static eventReactionRemoveCallback: Function;

    public static SetEventReadyCallback(callback: Function) {
        this.eventReadyCallback = callback;
    }

    public static SetEventMessageCallback(callback: Function) {
        this.eventMessageCallback = callback;
    }

    public static SetEventReactionAddCallback(callback: Function) {
        this.eventReactionAddCallback = callback;
    }

    public static SetEventReactionRemoveCallback(callback: Function) {
        this.eventReactionRemoveCallback = callback;
    }

    public static Init() {
        this.client = new Client();

        DiscordService.SetClient(this.client)

        this.client.on('ready', async () => { await Discord.EventReady() });
        this.client.on('message', async (message) => { await Discord.EventMessage(message) });
        this.client.on('messageReactionAdd', async (reaction, user) => { await Discord.EventReactionAdd(reaction, <User>user) });
        this.client.on('messageReactionRemove', async (reaction, user) => { await Discord.EventReactionRemove(reaction, <User>user) });
        this.client.login(process.env.TOKEN);
    }

    private static async EventReady() {
        this.eventReadyCallback();
    }

    private static async EventMessage(message: Message) {
        if (message.author.bot) {
            return;
        }

        if (message.guild == null) {
            return;
        }

        this.eventMessageCallback(message);
    }

    private static async EventReactionAdd(reaction: MessageReaction, user: User) {
        if (user.bot) {
            return;
        }

        this.eventReactionAddCallback(reaction, user);
    }

    private static async EventReactionRemove(reaction: MessageReaction, user: User) {
        if (user.bot) {
            return;
        }

        this.eventReactionRemoveCallback(reaction, user);
    }
}
