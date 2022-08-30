import { Channel, GuildMember, Message } from 'discord.js';

export default interface IMessageInfo {
    channel: Channel;
    member: GuildMember;
    message?: Message;
}