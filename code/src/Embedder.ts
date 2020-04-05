import { Message, MessageEmbed, DiscordAPIError, GuildMember, User, TextChannel, CategoryChannel } from "discord.js";
import DungeonWasbeer from "./DungeonWasbeer";
import Player from "./Player";
import Constants from "./Constants";
import IMessageInfo from "./IMessageInfo";
import Card from "./Card";
import PlayerCard from "./PlayerCard";
import PlayerCardModel from "./models/PlayerCardModel";
import CardModel from "./models/CardModel";
import ITradeInfo from "./Interfaces/ITradeInfo";

const emojis = {
    good: ":white_check_mark:",
    bad: ":x:"
}

const tradeInstructions = 'Zeg beiden `;accepteer` als je de ruil wilt accepteren. Zeg `;annuleer` als je de ruil wilt annuleren.';

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
    
    // ADMIN ////////////////////

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

    public static SendRefreshedCache(command:IMessageInfo) {
        this.SendMessage(command, "Refreshed the cache.", true);
    }

    // PLAYERS /////////////////////////

    public static SendPlayerCardNotFound(command:IMessageInfo, name:string) {
        this.SendMessage(command, "Je hebt geen kaart met de naam '" + name + "'.", false, true);
    }

    public static SendCardGet(message:IMessageInfo, playerCard:PlayerCard) {
        message.channel =  DungeonWasbeer.mainChannel;
        this.SendMessage(message, "Je hebt een nieuwe kaart!", undefined, true, this.GetCardEmbed(playerCard.GetCard(), playerCard.GetAmount()))
    }

    public static SendCardGetExtra(message:IMessageInfo, playerCard:PlayerCard) {
        message.channel =  DungeonWasbeer.mainChannel;
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

    // TRADE ///////////////////

    public static SendTradeStarted(command:IMessageInfo,  tradeInfo:ITradeInfo) {
        const embed = new MessageEmbed()
        .setImage(tradeInfo.yourCard.GetCard().GetImageUrl())
        .setThumbnail(tradeInfo.theirCard.GetCard().GetImageUrl());
        this.SendMessage(command, `${tradeInfo.with.GetMention()}, wil jij jouw '${tradeInfo.theirCard.GetCard().GetName()}' ruilen voor de '${tradeInfo.yourCard.GetCard().GetName()}' van ${tradeInfo.trader.GetMention()}? ${tradeInstructions}`, undefined, false, embed);
    }

    public static SendTradeParseFailed(command:IMessageInfo) {
        this.SendMessage(command, "Ik begrijp je niet helemaal. Zorg dat je het formaat aanhoudt:\n`;ruil @mention jouw kaart > hun kaart`", false);
    }

    public static SendTradeWithSelf(command:IMessageInfo) {
        this.SendMessage(command, "Je kan niet met jezelf ruilen. Het klinkt ook wel een beetje zielig.", false);
    }

    public static SendTradeOtherPlayerNoCards(command:IMessageInfo) {
        this.SendMessage(command, "Die gozer heeft nog helemaal geen kaarten joh.", false)
    }

    public static SendTradeNotWithBot(command:IMessageInfo) {
        this.SendMessage(command, "Dat is een mooie kaart, maar nee bedankt.")
    }

    public static SendTradeBothAlreadyTrading(command:IMessageInfo) {
        this.SendMessage(command, "Jullie twee zijn al aan het ruilen. " + tradeInstructions, false);
    }

    public static SendTradeYouAlreadyTrading(command:IMessageInfo, tradeInfo:ITradeInfo) {
        this.SendMessage(command, `Jij bent al aan het ruilen met ${tradeInfo.with.GetDiscordName()}. ${tradeInstructions}`, false);
    }

    public static SendTradeTheyAlreadyTrading(command:IMessageInfo, tradeInfo:ITradeInfo) {
        this.SendMessage(command, `${tradeInfo.trader.GetDiscordName()} is al aan het ruilen met ${tradeInfo.with.GetDiscordName()}`, false);
    }

    public static SendTradeYourCardNotFound(command:IMessageInfo, search:string) {
        this.SendMessage(command, `Je hebt geen kaart die lijkt op ${search}.`, false);
    }

    public static SendTradeTheirCardNotFound(command:IMessageInfo, otherPlayer:Player, search:string) {
        this.SendMessage(command, `${otherPlayer.GetDiscordName()} heeft geen kaart die lijkt op ${search}.`, false);
    }

    public static SendTradeNotFound(command:IMessageInfo, accept:boolean) {
        this.SendMessage(command, "Wat loop je nou allemaal te " + (accept ? "accepteren" : "annuleren") + "? Je bent helemaal niet aan het ruilen!", false)
    }

    public static SendTradeCancelled(command:IMessageInfo) {
        this.SendMessage(command, "De ruil is geannuleerd.")
    }

    public static SendTradeSuccessful(command:IMessageInfo, tradeInfo:ITradeInfo) {
        this.SendMessage(command, `${tradeInfo.trader.GetMention()} en ${tradeInfo.with.GetMention()}, jullie hebben de kaarten geruild. Veel plezier ermee!`, true, false);
    }


    // SETS ////////////////////

    public static GetCardEmbed(card:Card, amount:number = 1) {
        const embed = new MessageEmbed()
        .setColor(Constants.Colors.default)
        .setAuthor(card.GetCategory(), "https://cdn.discordapp.com/attachments/694331679204180029/696112797221650432/general.png")
        .setTitle(card.GetName() + (amount == 1 ? "" : "(x"+ amount + ")"))
        .setDescription(card.GetDescription())
        .setImage(card.GetImageUrl())
        .addField("Level", card.GetRankString())

        return embed;
    }
}