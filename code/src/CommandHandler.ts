import Player from "./Player";
import { Message, TextChannel, GuildMember, Guild } from "discord.js";
import Embedder from "./Embedder";
import { Redis, RedisAsync } from "./Redis";
import IMessageInfo from "./IMessageInfo";
import DungeonWasbeer from "./DungeonWasbeer";
import GameManager from "./GameManager";
import Card from "./Card";
import CardModel from "./models/CardModel";
import CardHandler from "./CardHandler";
import PlayerCardModel from "./models/PlayerCardModel";
import PlayerCard from "./PlayerCard";
import MessageHandler from "./MessageHandler";

export default class CommandHandler {

    private commandList = [
        "test",
        "add",
        "card",
        "edit",
        "random",
        "stats",
        "kaart",
        "lijst"
    ]
        
    private game:GameManager;
    private cardHandler:CardHandler

    constructor(game:GameManager) {
        this.game = game
        this.cardHandler = new CardHandler();
    }

    private GetCommaArgs(content:string) {
        const commaArgs = content.split(",");
        for (let i = 0; i < commaArgs.length; i++) {
            commaArgs[i] = commaArgs[i].trim();
        }
        return commaArgs;
    }

    private GetNumberedArguments(content:string) {
        const obj:any = {};
        var success = false;

        const commaArgs = content.split(",");
        for (let i = 0; i < commaArgs.length; i++) {
            var arg = commaArgs[i].trim();
            var countMatch = arg.match(/^(\w+)/);
            if (countMatch) {
                success = true;
                var count = countMatch[1];
                var countNumber = parseInt(count);

                var nan = isNaN(countNumber);
                if (!nan && countNumber <= 0) {
                    continue;
                }

                if (count == "all" || (!nan)) {
                    arg = arg.substring(count.length, arg.length).trim();
                    obj[arg] = count;
                }
                else {
                    obj[arg] = 1;
                }
            }
        }

        if (!success) {
            return null;
        }

        return obj;
    }
    
    // TODO: DRY???
    private GetSingleNumberedArgument(content:string) {
        const obj:any = {};

        const commaArgs = content.split(",");
        var arg = commaArgs[0].trim();
        obj.name = arg;

        var countMatch = arg.match(/^(\w+)/);
        if (countMatch) {
            var count = countMatch[1];
            var countNumber = parseInt(count);

            var nan = isNaN(countNumber);
            if (!nan && countNumber <= 0) {
                return {};
            }

            if (count == "all" || (!nan)) {
                arg = arg.substring(count.length, arg.length).trim();
                obj.name = arg;
                obj.amount = count;
            }
            else {
                obj.amount = 1;
            }
        }
        else {
            return null;
        }

        return obj;
    }


    private GetAssignedArguments(content:string) {
        const obj:any = {};
        var assignedArgs = (" " + content).split(" -").slice(1);

        for (let i = 0; i < assignedArgs.length; i++) {
            const arg = assignedArgs[i].trim();

            const argumentNameMatch = arg.match(/^(\w+)/);
            if (argumentNameMatch) {
                var name = argumentNameMatch[1];
                const value = arg.substring(name.length).trim();
                obj[name] = value;
            }
            else {
                return null;
            }
        }

        return obj;
    }

    private ValidateArguments(command:IMessageInfo, args:any) {
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const val = arg.value;

            if (arg.required) {
                if (val == null) {
                    // Embedder.SendArgumentRequired(command, arg.requiredMessage);
                    return false;
                }
            }
            
            if (arg.numeric) {
                const n = parseInt(val);
                if (n != null && args.numeric == false) {
                    // No number
                    return false;
                }
                else if (n == null && args.numeric == true) {
                    return false;
                }
            }

            if (args.regex) {
                const match = val.match(arg.regex);
                if (match == null) {
                    return false;
                }
            }
        };
        return true;
    }

    private async GetSpam(message:IMessageInfo) {

        const spam_levels = [{amount: 40, expire: 60*5, message: "5 minutes"}, {amount: 10, expire: 60, message: "1 minute"}, {amount: 3, expire: 5, message: "5 seconds"}]

        for (let i = 0; i < spam_levels.length; i++) {
            const spam_level = spam_levels[i];
            const spam_id = "spam:" + i + message.member.id;
            const spam:number = await Redis.get(spam_id);

            if (spam) {
                const level = await Redis.incr(spam_id);
                if (level == spam_level.amount) {
                    Redis.expire(spam_id, spam_level.expire);
                    return spam_level.message;
                }
            }
            else {
                Redis.set(spam_id, 1, "EX", spam_level.expire);
            }
        }
    }

    public async OnCommand(commandMessage:IMessageInfo, player:Player, content:string, command:string, args:Array<string>) {
        if (!this.commandList.includes(command)) {
            return;
        }

        // const spam = await this.GetSpam(message);

        // if (spam) {
        //     message.channel.send("<@" + message.author.id + "> Please wait " + spam + " before using a command.")
        //     return;
        // }

        if (commandMessage == null) {
            return;
        }

        if (commandMessage.message?.guild?.id == "693820353365147658") {
            switch (command) {
                case "add":
                    this.AddNewCard(commandMessage, player, this.GetAssignedArguments(content));
                    break;
                case "edit":
                    this.EditCard(commandMessage, player, this.GetAssignedArguments(content));
                    break;
                case "stats":
                    this.SendCardStats(commandMessage);
                break;
                case "card":
                    this.SendCard(commandMessage, args[0]);
                    break;
                case "random":
                    this.SendRandomCard(commandMessage);
                break;

            }
        }

        switch(command) {
            case "kaart":
                this.SendPlayerCard(commandMessage, player, args.join(" "));
                break;
            case "lijst":
                this.SendPlayerCardList(commandMessage, player);
            break;
            case "info":
                // this.SendPlayerInfo(commandMessage, player, args[0])
                break;
            default:
                return;
        }

            // player.UpdateLastActive();
    }

    public async HandleNormalMessage(message:IMessageInfo, player:Player) {
        MessageHandler.OnMessage(message, player);
    }

    // PLAYER////////////////////

    public async SendPlayerCard(commandMessage:IMessageInfo, player:Player, name:string) {
        if (name == null) {
            Embedder.SendNoNameArgument(commandMessage);
            return;
        }

        const player_card = player.GetCards().find(card => card.GetCard().GetName().toLowerCase() == name.toLowerCase());
        if (player_card) {
            Embedder.SendPlayerCard(commandMessage, player_card);
            return;
        }

        Embedder.SendPlayerCardNotFound(commandMessage, name);
    }


    // ADMIN ////////////////////

    public async AddNewCard(command:IMessageInfo, player:Player, args:any) {
        if (args == null) {
            Embedder.SendAssignedArgumentsParseError(command)
            return;
        }

        const attachment = command.message?.attachments.first();
        if (attachment == null || ![".png", "jpeg", ".jpg"].includes(attachment.name?.toLowerCase().slice(-4) || "")) {
            Embedder.SendNoImageAttached(command);
            return;
        }
        
        const argKeys = Object.keys(args);
        const required = ["n", "b", "c", "r"];
        const missing = [];
        for (const key of required) {
            if (!argKeys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            Embedder.SendMissingAssignedArguments(command, missing);
            return;
        }

        var card = new Card();
        if (await card.FIND_BY_NAME(args.n)) {
            Embedder.SendCardAlreadyExists(command, card)
            return;
        }

        await card.POST(args.n, args.b, args.r, args.c, attachment?.proxyURL, player.GetId());

        Embedder.SendNewCardCreated(command, card)
    }

    public async EditCard(command:IMessageInfo, player:Player, args:any) {
        if (args == null) {
            Embedder.SendAssignedArgumentsParseError(command)
            return;
        }

        const attachment = command.message?.attachments.first();
        if (attachment != null && ![".png", "jpeg", ".jpg"].includes(attachment.name?.toLowerCase().slice(-4) || "")) {
            Embedder.SendNoImageAttached(command);
            return;
        }
        
        const arg_keys = Object.keys(args);
        const required = ["on"];
        const missing = [];
        for (const key of required) {
            if (!arg_keys.includes(key)) {
                missing.push(key);
            }
        }

        if (missing.length > 0) {
            Embedder.SendMissingAssignedArguments(command, missing);
            return;
        }

        var card = new Card();
        if (!await card.FIND_BY_NAME(args.on)) {
            Embedder.SendCardNotFound(command, args.on);
            return
        }

        await card.UpdateCard(args.n, args.b, args.r, args.c)

        Embedder.SendCardEdited(command, card)
    }

    public async SendCard(command:IMessageInfo, name:string) {
        if (name == null) {
            this.SendRandomCard(command);
            return;
        }

        var card = new Card();
        if (!await card.FIND_BY_NAME(name)) {
            Embedder.SendCardNotFound(command, name);
            return;
        }

        Embedder.SendCard(command, card);
    }

    private async SendCardStats(command:IMessageInfo) {
        const cards:any = await Card.GET_ALL();
        const stats:any = {}
        for (const card of cards) {
            if (stats[card.category] == null) {
                stats[card.category] = [0, 0, 0, 0, 0];
            }

            stats[card.category][card.rank - 1]++;
        }

        Embedder.SendCardStats(command, stats, cards.length);
    }

    private async SendRandomCard(command:IMessageInfo) {
        const card_models:CardModel = await Card.GET_ALL();
        var cardModel = card_models.randomChoice();
        var card = new Card();
        card.ApplyModel(cardModel);
        Embedder.SendCard(command, card);
    }

    private async SendPlayerCardList(command:IMessageInfo, player:Player) {
        Embedder.SendPlayerCardList(command, player.GetCards());
    }
}