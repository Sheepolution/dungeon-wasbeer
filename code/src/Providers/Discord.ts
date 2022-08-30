import { Client, Partials, ClientOptions, Message, MessageReaction, User, GatewayIntentBits } from 'discord.js';
import DiscordService from '../Services/DiscordService';

export default class Discord {

    public static client: Client;
    public static discordClientOptions: ClientOptions = {
        intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMembers , GatewayIntentBits.GuildBans , GatewayIntentBits.GuildMessages , GatewayIntentBits.GuildMessageReactions , GatewayIntentBits.GuildMessageTyping , GatewayIntentBits.GuildVoiceStates , GatewayIntentBits.DirectMessages , GatewayIntentBits.DirectMessageReactions , GatewayIntentBits.DirectMessageTyping , GatewayIntentBits.DirectMessageReactions],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.ThreadMember]
    };

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
        this.client = new Client({
                intents: [GatewayIntentBits.Guilds , GatewayIntentBits.GuildMembers , GatewayIntentBits.GuildBans , GatewayIntentBits.GuildMessages , GatewayIntentBits.GuildMessageReactions , GatewayIntentBits.GuildMessageTyping , GatewayIntentBits.GuildVoiceStates , GatewayIntentBits.DirectMessages , GatewayIntentBits.DirectMessageReactions , GatewayIntentBits.DirectMessageTyping , GatewayIntentBits.DirectMessageReactions],
                partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.ThreadMember]
            }
        );


        DiscordService.SetClient(this.client);

        this.client.on('ready', async () => { await Discord.EventReady(); });
        this.client.on('message', async (message) => { await Discord.EventMessage(message); });
        this.client.on('messageReactionAdd', async (reaction, user) => { 
            if (reaction.partial){
                try {
                    await reaction.fetch();
                } catch (error){
                    console.error('Something went wrong when fetching the message: ', error);
                    return;
                }
            }
            // await Discord.EventReactionAdd(reaction, <User>user); 
        });
        this.client.on('messageReactionRemove', async (reaction, user) => { 

        //Is zeer waarschijnlijk fout, moet getest worden.
            if (reaction.partial){
                try {
                    await reaction.fetch();
                } catch (error){
                    console.error('Something went wrong when fetching the message: ', error);
                    return;
                }
            }
            // await Discord.EventReactionRemove(reaction, <User>user); 
        });
        this.client.login(process.env.TOKEN);
    }

    private static EventReady() {
        this.eventReadyCallback();
    }

    private static EventMessage(message: Message) {
        if (message.author.bot) {
            return;
        }

        if (message.guild == null) {
            return;
        }

        this.eventMessageCallback(message);
    }

    private static EventReactionAdd(reaction: MessageReaction, user: User) {
        if (user.bot) {
            return;
        }

        this.eventReactionAddCallback(reaction, user);
    }

    private static EventReactionRemove(reaction: MessageReaction, user: User) {
        if (user.bot) {
            return;
        }

        this.eventReactionRemoveCallback(reaction, user);
    }
}
