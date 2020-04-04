import { Message, MessageEmbed, DiscordAPIError, GuildMember, User, TextChannel, CategoryChannel } from "discord.js";
import DungeonWasbeer from "./DungeonWasbeer";
import Player from "./Player";
import Constants from "./Constants";
import IMessageInfo from "./IMessageInfo";
import Card from "./Card";
import PlayerCard from "./PlayerCard";
import PlayerCardModel from "./models/PlayerCardModel";
import CardModel from "./models/CardModel";

const emojis = {
    good: ":white_check_mark:",
    bad: ":x:"
}

export default class Embedder {

    public static SendMessage(command:IMessageInfo, message:string, good?:boolean, mention?:boolean, embed?:MessageEmbed) {
        if (good != null) {
            message = (good ? emojis.good : emojis.bad) + " " + message;
        }
        if (mention != false) {
            DungeonWasbeer.ReplyMessage(<TextChannel>command.channel, command.member, message, embed)
        }
        else {
            DungeonWasbeer.SendMessage(<TextChannel>command.channel, message, embed)
        }
    }

    // TODO: REDO
    // public static SendArgumentRequired(command:IMessageInfo, message:string) {
    //     const embed = new MessageEmbed()
    //     .setColor(Constants.Colors.red)
    //     .setTitle("Please tell me " + message)
    //     .setFooter(command.member.displayName, command.member.user.displayAvatarURL())

    //     DungeonWasbeer.SendEmbed(embed, command.channel);
    // }

    public static SendMissingAssignedArguments(command:IMessageInfo, missing:Array<string>) {
        this.SendMessage(command, "Je vergeet één of meerdere parameters:\n" + missing.join(", ") , false, true);
    }

    public static SendNoImageAttached(command:IMessageInfo) {
        this.SendMessage(command, "Zorg dat je een afbeelding meegeeft van het formaat .png, .jpg of .jpeg.", false, true);
    }

    public static SendAssignedArgumentsParseError(command:IMessageInfo) {
        this.SendMessage(command, "Ik kon de parameters van je bericht niet verwerken.\nZorg dat dit het juiste format aanhoudt.\n\nVoorbeeld:\n;commando -voorbeeld Dit is een voorbeeld -getal 123", false, true);
    }

    public static SendNoNameArgument(command:IMessageInfo) {
        this.SendMessage(command, "Ik mis de naam van de kaart.")
    }

    // public static SendUpdatePrefix(command:IMessageInfo, prefix:string) {
    //     this.SendMessage(command, "Changed the prefix to '" + prefix + "'.", true);
    // }
    
    public static SendPrefixTooLong(command:IMessageInfo, prefix:string) {
        this.SendMessage(command, "You can't set a prefix longer than 10 characters. Yours is " + prefix.length + " characters long.", false);
    }

    public static SendNoValidChannels(command:IMessageInfo) {
        this.SendMessage(command, "Those aren't valid channels. Make sure to either mention them with #[channel name] or by giving their ids, each channel separated with a space.", false);
    }

    public static SendChannelsAlreadySet(command:IMessageInfo, amount:number) {
        this.SendMessage(command, (amount > 1 ? "These channels are" : "This channel is") + " already included.", false);
    }

    public static SendChannelsChanged(command:IMessageInfo, amount:number, added:boolean, inclusive:boolean) {
        var str = "";

        str += added ? "Added " : "Removed ";
        str += amount == 1 ? "the channel" : (amount + " channels");
        str += added ? " to " : " from ";
        str += " the list of channels where you **can";
        str += inclusive ? "" : "'t";
        str += "** use the bot."

        this.SendMessage(command, str, true);
    }

    public static SendChannelsSet(command:IMessageInfo, amount:number, inclusive:boolean) {
        var str = "Set ";

        str += amount == 1 ? "the channel" : (amount + " channels");
        str +=  " as the list of channels where you **can";
        str += inclusive ? "" : "'t";
        str += "** use the bot."

        this.SendMessage(command, str, true);
    }

    public static SendNewPlayer(command:IMessageInfo) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.green)
        .setAuthor(command.member.displayName, command.member.user.displayAvatarURL())
        .setTitle("Starting your farm")
        .setDescription(`To start your farming adventure type \`;start [time zone] [farm name]\`.\n\
        You can change both of these whenever you want.\n\
        This game is based on real time, so we need your time zone to make it accurate for you.\n\
        You can check your time zone using this [this chart](http://upload.wikimedia.org/wikipedia/commons/8/88/World_Time_Zones_Map.png).\n\
        Examples:\n\`;start +4 My Cool Farm\`\n\`;start -3 Farmy McFarmface\``)

        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendCreatedFarm(command:IMessageInfo, farmName:string) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.green)
        .setAuthor(command.member.displayName, command.member.user.displayAvatarURL())
        .setTitle("Welcome to Farmcord!")
        .setDescription("You are now the proud owner of " + farmName + "!");

        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendSetupComplete(command:IMessageInfo) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.green)
        .setAuthor(command.member.displayName, command.member.user.displayAvatarURL())
        .setTitle("Setup complete!")
        .setDescription("You now have your very own farm. You start with 500G, enough to buy a chicken or some seeds. Go check out the stores.\n`;store animals` and `;store seeds`")

        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendPlayerAlreadyExists(command:IMessageInfo) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.red)
        .setAuthor(command.member.displayName, command.member.user.displayAvatarURL())
        .setTitle("You already own a farm!")
        .setDescription("You can only create one farm.")

        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendCardList(command:IMessageInfo, cards:Array<Card>, animalName:string) {
        // const embed = new MessageEmbed()
        // .setColor(Constants.Colors.default)
        // .setAuthor(farmName, "https://cdn.discordapp.com/attachments/593397362949488661/600030086355353612/farm-barn-icon.png")
        // .setTitle(animalName);

        // for (let i = 0; i < animals.length; i++) {
        //     const animal = animals[i];
        //     embed.addField((i+1) + ". " + animal.GetInfoName(), animal.GetShortInfo(), true);
        // }

        // DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendCard(command:IMessageInfo, card:Card) {
        const embed = this.GetCardEmbed(card);
        DungeonWasbeer.SendEmbed(embed, command.channel);
    }


    public static SendNewCardCreated(command:IMessageInfo, card:Card) {
        this.SendMessage(command, "De kaart is toegevoegd!", true, true, this.GetCardEmbed(card));
    }

    public static SendCardEdited(command:IMessageInfo, card:Card) {
        this.SendMessage(command, "De kaart is aangepast!", true, true, this.GetCardEmbed(card));
    }

    public static SendCardAlreadyExists(command:IMessageInfo, card:Card) {
        this.SendMessage(command, "Er is al een kaart met deze naam in deze categorie!", false, true, this.GetCardEmbed(card));
    }

    public static SendCardNotFound(command:IMessageInfo, name:string) {
        this.SendMessage(command, "Er is geen kaart met de naam '" + name + "'.", false, true);
    }

    public static SendPlayerCardNotFound(command:IMessageInfo, name:string) {
        this.SendMessage(command, "Je hebt geen kaart met de naam '" + name + "'.", false, true);
    }

    public static SendCardStats(command:IMessageInfo, stats:any, amount:number) {
        const embed = new MessageEmbed()
        .setTitle("Card statistics")

        for (const key in stats) {
            if (stats.hasOwnProperty(key)) {
                const list = stats[key];
                embed.addField(key, list.join("/"));
            }
        }
        
        embed.setDescription("Total: " + amount + "\nRank 1/2/3/4/5")

        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    public static SendCardGet(message:IMessageInfo, playerCard:PlayerCard) {
        this.SendMessage(message, "Je hebt een nieuwe kaart!", undefined, true, this.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()))
    }

    public static SendCardGetExtra(message:IMessageInfo, playerCard:PlayerCard) {
        this.SendMessage(message, "Je hebt een extra van deze kaart!", undefined, true, this.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()))
    }


    public static SendPlayerCard(command:IMessageInfo, playerCard:PlayerCard) {
        DungeonWasbeer.SendEmbed(this.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()), command.channel);
    }

    public static SendPlayerCardList(command:IMessageInfo, playerCards:Array<PlayerCard>) {
        const cardData:any = {};

        for (const playerCard of playerCards) {
            const card = playerCard.GetCard();
            const name = card.GetName();
            const category = card.GetCategory();
            
            if (!cardData[category]) {
                cardData[category] = {};
            }

            if (cardData[category][name]) {
                cardData[category][name].amount += playerCard.GetAmount();
                continue;
            }

            cardData[category][name] = {rank: card.GetRank(), amount: playerCard.GetAmount()};
        }

        const embed = new MessageEmbed()
        .setTitle("De kaarten van " + command.member.displayName);
        // .setImage(playerCards[0].GetCard().GetImageUrl());

        for (const category in cardData) {
            var list = "";
            if (cardData.hasOwnProperty(category)) {
                const categoryData = cardData[category];
                for (const name in categoryData) {
                    if (categoryData.hasOwnProperty(name)) {
                        const amount = categoryData[name].amount;
                        list += Constants.Emojis.Stars[categoryData[name].rank] + " " + name + (amount == 1 ? "" : " (x" + amount + ")") + "\n"
                    }
                }
            }

            embed.addField(category, list, true);
        }
        
        DungeonWasbeer.SendEmbed(embed, command.channel);
    }

    // SETS ////////////////////

    public static GetCardEmbed(card:Card, amount:number = 1) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.default)
        .setAuthor(card.GetCategory(), "https://cdn.discordapp.com/attachments/693820455228014612/694328816985702500/chonky.png")
        .setTitle(card.GetName() + (amount == 1 ? "" : "(x"+ amount + ")"))
        .setDescription(card.GetDescription())
        .setImage(card.GetImageUrl())
        .addField("Rank", card.GetRankString())

        return embed;
    }

    // public static SetAnimalInfo(embed:MessageEmbed, animal:Animal) {
    //     embed.setImage(animal.GetImage());

    //     const love = animal.GetLove();
        
    //     if (love > 0) {
    //         embed.addField("Love", "❤".repeat(love))
    //     }

    //     embed.addField("Health", animal.GetHealthInfo())
    //     .addField("State", animal.GetCollectStateInfo())
    // }
}