import CampaignManager from '../Managers/CampaignManager';
import Character from '../Objects/Character';
import CharacterConstants from '../Constants/CharacterConstants';
import CharacterEmbeds from '../Embeds/CharacterEmbeds';
import DiscordUtils from '../Utils/DiscordUtils';
import Heal from '../Objects/Heal';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import Player from '../Objects/Player';
import PlayerManager from '../Managers/PlayerManager';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { ClassType } from '../Enums/ClassType';
import { LogType } from '../Enums/LogType';
import { Redis } from '../Providers/Redis';
import { TopListType } from '../Enums/TopListType';
import { Utils } from '../Utils/Utils';
import { Message } from 'discord.js';
import Inspire from '../Objects/Inspire';
import Enchantment from '../Objects/Enchantment';
import Perception from '../Objects/Perception';
import Reinforcement from '../Objects/Reinforcement';
import DiscordService from '../Services/DiscordService';
import Protection from '../Objects/Protection';
import Prayer from '../Objects/Prayer';
import Attack from '../Objects/Attack';
import Equipment from '../Objects/Equipment';
import CharacterModel from '../Models/CharacterModel';
import { transaction } from 'objection';

export default class CharacterHandler {

    private static readonly classNames = Object.keys(ClassType);
    private static readonly resetConfirmTimerPrefix = RedisConstants.REDIS_KEY + RedisConstants.RESET_CONFIRM_TIMER_KEY;

    public static OnCommand(messageInfo: IMessageInfo, player: Player, command: string, args: Array<string>, content: string) {
        if (command == 'class') {
            this.CreateCharacter(messageInfo, player, args[0]);
            return;
        } else if (command == 'switch') {
            this.SwitchCharacter(messageInfo, player);
        }

        switch (command) {
            case 'info':
                this.SendCharacterInfo(messageInfo, player);
                break;
            case 'character':
            case 'ik':
            case 'me':
                this.SendCharacterDescription(messageInfo, player);
                break;
            case 'cooldowns':
            case 'cooldown':
            case 'cd':
                this.SendCooldownsInfo(messageInfo, player);
                break;
            case 'stats':
            case 'statistieken':
                this.SendStatsInfo(messageInfo, player);
                break;
            case 'history':
            case 'geschiedenis':
            case 'verleden':
                this.SendHistoryInfo(messageInfo, player);
                break;
            case 'top':
                this.SendTopList(messageInfo, content, TopListType.Current);
                break;
            case 'top-all':
            case 'topall':
                this.SendTopList(messageInfo, content, TopListType.All);
                break;
            case 'top-pre':
            case 'toppre':
                this.SendTopList(messageInfo, content, TopListType.Previous);
                break;
            case 'equipment':
                this.SendEquipment(messageInfo, player);
                break;
            case 'equip':
                this.Equip(messageInfo, player, content);
                break;
            case 'unequip':
                this.Unequip(messageInfo, player, content);
                break;
            case 'save':
                this.SaveEquipment(messageInfo, player, content);
                break;
            case 'restore':
                this.RestoreEquipment(messageInfo, player, content);
                break;
            case 'heal':
            case 'genees':
            case 'h':
                this.OnHeal(messageInfo, player, args[0]);
                break;
            case 'sleep':
            case 'slaap':
            case 'rust':
            case 'rest':
            case 'dutje':
            case 'tukken':
            case 'tukkie':
            case 'dommel':
                this.Sleep(messageInfo, player);
                break;
            case 'sos':
            case 'health':
            case 's':
                this.ShowLowestHealth(messageInfo);
                break;
            case 'inspireer':
            case 'inspire':
            case 'i':
                this.OnInspire(messageInfo, player, args[0]);
                break;
            case 'protect':
            case 'bescherm':
            case 'b':
                this.OnProtect(messageInfo, player, args[0]);
                break;
            case 'pray':
            case 'bid':
            case 'bless':
                this.OnPray(messageInfo, player);
                break;
            case 'enchant':
            case 'betover':
            case 'e':
                this.OnEnchant(messageInfo, player, args[0]);
                break;
            case 'perception':
            case 'percept':
            case 'kijk':
            case 'p':
                this.OnPercept(messageInfo, player, args[0]);
                break;
            case 'reinforce':
            case 'r':
                this.OnReinforce(messageInfo, player, args[0]);
                break;
            case 'art':
            case 'avatar':
            case 'oc':
                this.EditAvatar(messageInfo, player, content);
                break;
            case 'lore':
            case 'description':
            case 'beschrijving':
                this.EditLore(messageInfo, player, content);
                break;
            case 'name':
            case 'naam':
                this.EditName(messageInfo, player, content);
                break;
            case 'aanval-beschrijving':
            case 'ab':
                this.EditAttackDescription(messageInfo, player, content);
                break;
            case 'aanval-crit-beschrijving':
            case 'acb':
                this.EditAttackCritDescription(messageInfo, player, content);
                break;
            case 'heal-beschrijving':
            case 'hb':
                this.EditHealDescription(messageInfo, player, content);
                break;
            case 'heal-faal-beschrijving':
            case 'hfb':
                this.EditHealFailDescription(messageInfo, player, content);
                break;
            case 'inspire-beschrijving':
            case 'ib':
                this.EditInspireDescription(messageInfo, player, content);
                break;
            case 'inspire-faal-beschrijving':
            case 'ifb':
                this.EditInspireFailDescription(messageInfo, player, content);
                break;
            case 'protect-beschrijving':
            case 'prb':
                this.EditProtectionDescription(messageInfo, player, content);
                break;
            case 'protect-faal-beschrijving':
            case 'pfb':
                this.EditProtectionFailDescription(messageInfo, player, content);
                break;
            case 'enchantment-beschrijving':
            case 'eb':
                this.EditEnchantmentDescription(messageInfo, player, content);
                break;
            case 'perception-beschrijving':
            case 'pb':
                this.EditPerceptionDescription(messageInfo, player, content);
                break;
            case 'reinforcement-beschrijving':
            case 'rb':
                this.EditReinforcementDescription(messageInfo, player, content);
                break;
            case 'charge-beschrijving':
            case 'cb':
                this.EditChargeDescription(messageInfo, player, content);
                break;
            case 'charge-faal-beschrijving':
            case 'cfb':
                this.EditChargeFailDescription(messageInfo, player, content);
                break;
            case 'bid-beschrijving':
            case 'bb':
                this.EditPrayDescription(messageInfo, player, content);
                break;
            case 'bid-faal-beschrijving':
            case 'bfb':
                this.EditPrayFailDescription(messageInfo, player, content);
                break;
            case 'reset':
                this.OnReset(messageInfo, player);
                break;
            case 'ikweetzekerdatikwilstoppenmetditcharacter':
                this.OnResetConfirm(messageInfo, player);
                break;
            // case 'profile':
            //     this.OnProfile(messageInfo, player);
            //     break;
            default:
                return false;
        }

        return true;
    }

    private static async CreateCharacter(messageInfo: IMessageInfo, player: Player, className: string) {
        const characterModels = await Character.GET_BY_PLAYER_ID(player.GetId());

        for (const characterModel of characterModels) {
            if (characterModel.xp < CharacterConstants.XP_PER_LEVEL[19]) {
                MessageService.ReplyMessage(messageInfo, `Je hebt al een character genaamd ${characterModel.name} Je kan een nieuw character aanmaken wanneer deze overlijdt, of wanneer je opnieuw begint met \`;reset\`.`, false);
                return;
            }
        }

        if (className == null) {
            this.SendUnknownClassName(messageInfo);
            return;
        }

        className = className.toTitleCase();

        if (!this.classNames.includes(className)) {
            this.SendUnknownClassName(messageInfo);
            return;
        }

        const classType = (<any>ClassType)[className];
        const newCharacter = await player.CreateCharacter(classType);
        MessageService.ReplyMessage(messageInfo, 'Je character is aangemaakt!', undefined, true, CharacterEmbeds.GetNewCharacterEmbed(newCharacter));
        LogService.Log(player, newCharacter.GetId(), LogType.CharacterCreated, `${player.GetDiscordName()} heeft een nieuw character aangemaakt van de class ${classType}.`);
    }

    private static async SwitchCharacter(messageInfo: IMessageInfo, player: Player) {
        const characterModels = await Character.GET_BY_PLAYER_ID(player.GetId());

        if (characterModels.length <= 1) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt niet meerdere characters, dus je kan niet switchen.', false, true);
            return;
        }

        const character = player.GetCharacter();

        if (character == null) {
            return;
        }

        const battle = CampaignManager.GetBattle();

        var next = 0;

        if (battle != null) {
            const count = await Attack.FIND_ATTACKS_BY_CHARACTER(character, battle.GetId());
            if (count > 0) {
                MessageService.ReplyMessage(messageInfo, 'Je hebt al aangevallen met dit character dus je mag niet meer switchen.', false, true);
                return;
            }
        }

        for (let i = 0; i < characterModels.length; i++) {
            const characterModel = characterModels[i];
            if (character.GetId() == characterModel.id) {
                next = i + 1;
                if (next == characterModels.length) {
                    next = 0;
                }
                break;
            }
        }

        const toCharacter = new Character();
        await toCharacter.GET(characterModels[next].id);

        await player.SwitchToCharacter(toCharacter);
        MessageService.ReplyMessage(messageInfo, `Je bent geswitched naar ${toCharacter.GetName()}`, undefined, true, await CharacterEmbeds.GetCharacterInfoEmbed(toCharacter));
    }

    private static async Equip(messageInfo: IMessageInfo, player: Player, cardName: string) {
        // TODO: Dit soort checks doe je ergens anders ook. Dat moet anders kunnen.
        // TODO: Dat je gewoon iets hebt van GetCardFromArgument() ofzo.
        // TODO: Net zoals met het aanmaken/aanpassen van kaarten en monsters. Dat moet minder DRY hebben.
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan je equipment niet aanpassen want je zit momenteel in een gevecht.', false);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = character.GetPlayer().FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        const card = playerCard.GetCard();
        const modifierClass = card.GetModifierClass();
        if (modifierClass != null && modifierClass != character.GetClass()) {
            MessageService.ReplyMessage(messageInfo, `Deze kaart is specifiek voor de class ${modifierClass} en jouw class is ${character.GetClass()}.`, false);
            return;
        }

        if (!character.HasEquipmentSpace()) {
            MessageService.ReplyMessage(messageInfo, 'Je equipment zit vol. Haal een kaart weg voordat je er weer een toevoegt.', false);
            return;
        }

        const realCardName = card.GetName();

        if (!card.HasBuffs()) {
            MessageService.ReplyMessage(messageInfo, `Je equipment is alleen voor kaarten met buffs. De kaart '${realCardName}' heeft geen buffs.`, false);
            return;
        }

        if (playerCard.IsEquipped()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit al in je equipment. Je kan maar één van elke kaart in je equipment hebben.`, false);
            return;
        }

        if (playerCard.IsUsedInTrade()) {
            MessageService.ReplyMessage(messageInfo, `Iemand is een ruil gestart met jouw kaart '${realCardName}', dus je kan deze nu niet equippen.`, false);
            return;
        }

        await character.Equip(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is aan je equipment toegevoegd.`, true, true, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async Unequip(messageInfo: IMessageInfo, player: Player, cardName: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (cardName == null) {
            MessageService.ReplyMissingCardName(messageInfo);
            return;
        }

        const playerCard = character.GetPlayer().FindCard(cardName);
        if (playerCard == null) {
            MessageService.ReplyNotOwningCard(messageInfo, cardName);
            return;
        }

        const realCardName = playerCard.GetCard().GetName();

        if (!playerCard.IsEquipped()) {
            MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' zit niet in je equipment.`, false);
            return;
        }

        await character.Unequip(playerCard);
        MessageService.ReplyMessage(messageInfo, `De kaart '${realCardName}' is uit je equipment gehaald.`, true, true, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static async SaveEquipment(messageInfo: IMessageInfo, player: Player, name: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (name == null || name == '') {
            MessageService.ReplyMessage(messageInfo, 'Sla je huidige equipment op met `;save [name]`.');
            return;
        }

        if (name.length > 100) {
            MessageService.ReplyMessage(messageInfo, `De naam mag niet langer zijn dan 100 tekens, en jouw gegeven naam is ${name.length} tekens.`, false, true);
            return;
        }

        name = name.toLowerCase();

        const equipment = new Equipment();

        if (await equipment.FIND_BY_NAME(player.GetId(), name)) {
            await equipment.SetCardIds(character.GetEquipmentIds());
            MessageService.ReplyMessage(messageInfo, 'De opgeslagen equipment is geupdate.', true, true);
            return;
        }

        await equipment.POST(player.GetId(), name, character.GetEquipmentIds());
        MessageService.ReplyMessage(messageInfo, `Je huidige equipment is nu opgeslagen als '${name}'.`, true, true);
    }

    private static async RestoreEquipment(messageInfo: IMessageInfo, player: Player, name: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.IsFullHealth()) {
            this.ReplyNotFullHealth(messageInfo, character);
            return;
        }

        if (name == null || name == '') {
            MessageService.ReplyMessage(messageInfo, 'Sla je huidige equipment op met `;save [name]`.');
            return;
        }

        const equipment = new Equipment();

        if (!await equipment.FIND_BY_NAME(player.GetId(), name.toLowerCase())) {
            MessageService.ReplyMessage(messageInfo, 'Je hebt geen opgeslagen equipment met deze naam.', false, true);
            return;
        }

        const equipmentIds = equipment.GetCardIds();

        await character.RemoveAllEquipment(true);

        const toEquipCards = player.GetCards().filter(pc => equipmentIds.includes(pc.GetCardId()));

        await transaction(CharacterModel.knex(), async (trx: any) => {
            for (const card of toEquipCards) {
                await character.Equip(card, trx);
            }
        }).catch((error: any) => {
            console.log(error);
        });

        MessageService.ReplyMessage(messageInfo, 'Je equipment is aangepast.', true, true);
    }

    private static async OnHeal(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanHeal()) {
            MessageService.ReplyMessage(messageInfo, `Alleen clerics kunnen healen, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen inspireren wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet healen want je zit momenteel in een gevecht.', false);
            return;
        }

        if (character.IsHealing()) {
            return;
        }

        if (character.IsPraying()) {
            return;
        }

        if (character.IsBeingHealed()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet healen want je wordt momenteel zelf geheald.', false);
            return;
        }

        const cooldown = await character.GetHealingCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag healen.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt healen moet je die persoon taggen.\n`;heal @persoon`.', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfHeal = receiver == character;
        const healthBefore = receiver.GetCurrentHealth();

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet healen want die zit momenteel in een gevecht.`, false);
            return;
        }

        if (character.IsBeingHealed()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet healen want die wordt momenteel al geheald.', false);
            return;
        }

        if (receiver.IsFullHealth()) {
            MessageService.ReplyMessage(messageInfo, `${selfHeal ? 'Je bent' : receiver.GetName() + ' is'} al full health.`, false);
            return;
        }

        character.SetIsHealing(true);
        receiver.SetBeingHealed(true);
        const message = await this.SendHealingEmbed(messageInfo, character, receiver);
        if (message == null) {
            return;
        }
        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const healing = character.GetHealingBasedOnRoll(roll);

        await receiver.GetHealthFromHealing(healing);
        await character.SetHealingCooldown();

        if (!selfHeal) {
            await character.GiveHealingPoints(healing, CampaignManager.GetBattle()?.GetId(), messageInfo);
        }

        await this.UpdateHealingEmbed(message, character, receiver, roll, healing);
        character.SetIsHealing(false);
        receiver.SetBeingHealed(false);

        await character.StopBeingInspired();

        await this.SaveHeal(character, receiver, healthBefore, character.GetFullModifierStats().wisdom, roll, healing);
    }

    private static async Sleep(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet slapen want je zit midden in een gevecht.', false);
            return;
        }

        if (character.IsHealing()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet slapen want je bent momenteel aan het healen.', false);
            return;
        }

        if (character.IsBeingHealed()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet slapen want je wordt momenteel geheald.', false);
            return;
        }

        if (character.IsFullHealth()) {
            MessageService.ReplyMessage(messageInfo, 'Het heeft weinig zin om te gaan slapen want je bent al full health.');
            return;
        }

        const cooldown = await character.GetBattleCooldown();

        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag slapen.`);
            return;
        }

        var healing = await character.Sleep();
        MessageService.ReplyMessage(messageInfo, `Je verstopt jezelf voor het monster om een dutje te kunnen doen en krijgt ${healing} health terug.`, true);
    }

    private static async ShowLowestHealth(messageInfo: IMessageInfo) {
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetLowestHealthEmbed());
    }

    private static async OnInspire(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanInspire()) {
            MessageService.ReplyMessage(messageInfo, `Alleen bards kunnen inspireren, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen inspireren wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet inspireren want je zit momenteel in een gevecht.', false);
            return;
        }

        if (character.IsInspiring()) {
            return;
        }

        if (character.IsBeingInspired()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet inspireren want je wordt momenteel zelf geïnspireerd.', false);
            return;
        }

        const cooldown = await character.GetInspireCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag inspireren.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt inspireren moet je die persoon taggen.\n`;inspireer @persoon`', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfInspire = receiver == character;

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet inspireren want die zit momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsInspired()) {
            MessageService.ReplyMessage(messageInfo, `${selfInspire ? 'Je bent ' : 'Deze persoon is '}al geïnspireerd.`, false);
            return;
        }

        if (receiver.IsBeingInspired()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet inspireren want die wordt momenteel al geïnspireerd.', false);
            return;
        }

        character.SetIsInspiring(true);
        receiver.SetBeingInspired(true);
        const message = await this.SendInspiringEmbed(messageInfo, character, receiver);
        if (message == null) {
            return;
        }

        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const inspiration = character.GetInspirationBasedOnRoll(roll);

        await character.SetInspireCooldown();
        await this.UpdateInspiringEmbed(message, character, receiver, roll, inspiration);
        await receiver.BecomeInspired(inspiration);

        character.SetIsInspiring(false);
        receiver.SetBeingInspired(false);

        if (!selfInspire) {
            await character.GiveInspirePoints(inspiration, CampaignManager.GetBattle()?.GetId(), messageInfo);
        }

        this.SaveInspire(character, receiver, character.GetFullModifierStats().charisma, roll, inspiration);
    }

    private static async OnEnchant(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanEnchant()) {
            MessageService.ReplyMessage(messageInfo, `Alleen wizards kunnen enchanten, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen enchanten wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet enchanten want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetEnchantmentCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag enchanten.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt enchanten moet je die persoon taggen.\n`;enchant @persoon`', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfEnchant = receiver == character;

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet enchanten want die zit momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsEnchanted()) {
            MessageService.ReplyMessage(messageInfo, `${selfEnchant ? 'Je bent ' : 'Deze persoon is '}al enchanted.`, false);
            return;
        }

        await receiver.BecomeEnchanted();
        await character.SetEnchantmentCooldown();

        if (!selfEnchant) {
            await character.GiveAbilityPoints(CampaignManager.GetBattle()?.GetId(), messageInfo);
        }

        this.SaveEnchantment(character, receiver);

        const receiverName = receiver == character ? 'zichzelf' : receiver.GetName();

        MessageService.ReplyMessage(messageInfo, character.GetEnchantmentDescription().replaceAll('\\[jij\\]', character.GetName()).replaceAll('\\[naam\\]', receiverName), true);
    }

    private static async OnPercept(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanPercept()) {
            MessageService.ReplyMessage(messageInfo, `Alleen rangers kunnen perception checken, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen perception checken wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet perception checken want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetPerceptionCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag perception checken.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf een perception check wilt geven moet je die persoon taggen.\n`;perception @persoon`', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfPerception = receiver == character;

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} geen perception check geven want die zit momenteel in een gevecht.`, false);
            return;
        }

        const battleCooldown = await receiver.GetBattleCooldown();

        if (battleCooldown == null || battleCooldown <= 0) {
            MessageService.ReplyMessage(messageInfo, 'Het heeft geen zin om een perception check te geven aan iemand die geen cooldown heeft.', false);
            return;
        }

        const newCooldown = await receiver.OnPerception();
        await character.SetPerceptionCooldown();

        if (!selfPerception) {
            await character.GiveAbilityPoints(CampaignManager.GetBattle()?.GetId(), messageInfo);
        }

        this.SavePerception(character, receiver, battleCooldown, newCooldown);

        const receiverName = receiver == character ? 'zichzelf' : receiver.GetName();

        MessageService.ReplyMessage(messageInfo, character.GetPerceptionDescription()
            .replaceAll('\\[jij\\]', character.GetName())
            .replaceAll('\\[naam\\]', receiverName)
            .replaceAll('\\[voor\\]', Utils.GetSecondsInMinutesAndSeconds(battleCooldown))
            .replaceAll('\\[na\\]', Utils.GetSecondsInMinutesAndSeconds(newCooldown)), true);
    }

    private static async OnReinforce(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanReinforce()) {
            MessageService.ReplyMessage(messageInfo, `Alleen fighters kunnen reinforcen, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen reinforcen wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet reinforcen want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetReinforcementCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag reinforcen.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt reinforcen moet je die persoon taggen.\n`;reinforce @persoon`', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        const selfEnchant = receiver == character;

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet reinforcen want die zit momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsReinforced()) {
            MessageService.ReplyMessage(messageInfo, `${selfEnchant ? 'Je bent ' : 'Deze persoon is '}al voorzien van reinforcement.`, false);
            return;
        }

        await receiver.BecomeReinforced();
        await character.SetReinforcementCooldown();

        if (!selfEnchant) {
            await character.GiveAbilityPoints(CampaignManager.GetBattle()?.GetId(), messageInfo);
        }

        this.SaveReinforcement(character, receiver);

        const receiverName = receiver == character ? 'zichzelf' : receiver.GetName();

        MessageService.ReplyMessage(messageInfo, character.GetReinforcementDescription().replaceAll('\\[jij\\]', character.GetName()).replaceAll('\\[naam\\]', receiverName), true);
    }

    private static async OnProtect(messageInfo: IMessageInfo, player: Player, mention: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanProtect()) {
            MessageService.ReplyMessage(messageInfo, `Alleen paladins kunnen protecten, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen protecten wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet protecten want je zit momenteel in een gevecht.', false);
            return;
        }

        if (character.IsProtecting()) {
            return;
        }

        const cooldown = await character.GetProtectCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag protecten.`);
            return;
        }

        var receiver = character;
        if (mention != null) {
            var receiverId = DiscordUtils.GetMemberId(mention);
            if (receiverId == null) {
                const member = await DiscordService.FindMember(mention, messageInfo.member.guild, true);
                if (member != null) {
                    receiverId = member.id;
                } else {
                    MessageService.ReplyMessage(messageInfo, 'Als je iemand anders dan jezelf wilt protecten moet je die persoon taggen.\n`;protect @persoon`', false);
                    return;
                }
            }

            const receiverPlayer = await PlayerManager.GetPlayer(receiverId);
            receiver = receiverPlayer?.GetCharacter();
            if (receiverPlayer == null || receiver == null) {
                MessageService.ReplyMessage(messageInfo, 'Deze persoon heeft geen character.', false);
                return;
            }
        }

        if (receiver.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, `Je kan ${receiver.GetName()} niet protecten want die zit momenteel in een gevecht.`, false);
            return;
        }

        if (receiver.IsProtected()) {
            MessageService.ReplyMessage(messageInfo, 'Deze persoon is al protected.', false);
            return;
        }

        if (receiver.IsBeingProtected()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan die niet protecten want die wordt momenteel al protected.', false);
            return;
        }

        character.SetIsProtecting(true);
        receiver.SetBeingProtected(true);
        const message = await this.SendProtectionEmbed(messageInfo, character, receiver);
        if (message == null) {
            return;
        }

        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const protection = character.GetProtectionBasedOnRoll(roll);

        await character.SetProtectCooldown();
        await receiver.BecomeProtected(protection);
        await this.UpdateProtectionEmbed(message, character, receiver, roll, protection);

        character.SetIsProtecting(false);
        receiver.SetBeingProtected(false);

        await character.GiveProtectionPoints(protection, CampaignManager.GetBattle()?.GetId(), messageInfo);

        this.SaveProtection(character, receiver, character.GetFullModifierStats().armor, roll, protection);
    }

    private static async OnPray(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (character.IsPraying()) {
            return;
        }

        if (character.IsHealing()) {
            return;
        }

        if (!character.CanPray()) {
            MessageService.ReplyMessage(messageInfo, `Alleen clerics kunnen bidden, en jij bent een ${character.GetClassName().toLowerCase()}.`, false);
            return;
        }

        const battle = CampaignManager.GetBattle();
        if (battle == null) {
            MessageService.ReplyMessage(messageInfo, 'Je kan alleen bidden wanneer er een monster is.', false);
            return;
        }

        if (character.IsInBattle()) {
            MessageService.ReplyMessage(messageInfo, 'Je kan niet bidden want je zit momenteel in een gevecht.', false);
            return;
        }

        const cooldown = await character.GetPrayCooldown();
        if (cooldown > 0) {
            MessageService.ReplyMessage(messageInfo, `Je hebt nog ${Utils.GetSecondsInMinutesAndSeconds(cooldown)} cooldown voordat je weer mag bidden.`);
            return;
        }

        character.SetIsPraying(true);
        const message = await this.SendPrayingEmbed(messageInfo, character);
        if (message == null) {
            return;
        }

        await Utils.Sleep(3);
        const roll = Utils.Dice(20);
        const blessing = character.GetBlessingBasedOnRoll(roll);

        await character.SetPrayCooldown();
        await character.BecomeBlessed(blessing);
        await this.UpdatePrayingEmbed(message, character, roll, blessing);

        character.SetIsPraying(false);

        this.SavePrayer(character, character.GetFullModifierStats().wisdom, roll, blessing);
    }

    private static async SaveHeal(character: Character, receiver: Character, receiverHealth: number, characterHealing: number, roll: number, finalHealing: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const heal = await Heal.STATIC_POST(battle, character, receiver, receiverHealth, characterHealing, roll, finalHealing);
        LogService.Log(character.GetPlayer(), heal.id, LogType.Heal, `${character.GetName()} heeft een heal gedaan op ${character.GetId() == receiver.GetId() ? 'zichzelf.' : `${receiver.GetName()}.`}`);
    }

    private static async SaveInspire(character: Character, receiver: Character, characterCharisma: number, roll: number, finalInspiration: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const inspire = await Inspire.STATIC_POST(battle, character, receiver, characterCharisma, roll, finalInspiration);
        await LogService.Log(character.GetPlayer(), inspire.id, LogType.Inspire, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} geïnspireerd.`);
    }

    private static async SaveEnchantment(character: Character, receiver: Character) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const enchantment = await Enchantment.STATIC_POST(battle, character, receiver);
        await LogService.Log(character.GetPlayer(), enchantment.id, LogType.Enchantment, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} enchanted.`);
    }

    private static async SavePerception(character: Character, receiver: Character, oldCooldown: number, newCooldown: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const perception = await Perception.STATIC_POST(battle, character, receiver, oldCooldown, newCooldown);
        await LogService.Log(character.GetPlayer(), perception.id, LogType.Perception, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} een perception check gegeven.`);
    }

    private static async SaveReinforcement(character: Character, receiver: Character) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const reinforcement = await Reinforcement.STATIC_POST(battle, character, receiver);
        await LogService.Log(character.GetPlayer(), reinforcement.id, LogType.Reinforcement, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} voorzien van reinforcement.`);
    }

    private static async SaveProtection(character: Character, receiver: Character, characterArmor: number, roll: number, finalProtection: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const protection = await Protection.STATIC_POST(battle, character, receiver, characterArmor, roll, finalProtection);
        await LogService.Log(character.GetPlayer(), protection.id, LogType.Protect, `${character.GetName()} heeft ${character.GetId() == receiver.GetId() ? 'zichzelf' : `${receiver.GetName()}`} beschermd.`);
    }

    private static async SavePrayer(character: Character, characterHealing: number, roll: number, finalBlessing: number) {
        const battle = CampaignManager.GetBattle();
        if (battle == null) { return; }
        const charge = await Prayer.STATIC_POST(battle, character, characterHealing, roll, finalBlessing);
        await LogService.Log(character.GetPlayer(), charge.id, LogType.Charge, `${character.GetName()} heeft een prayer gedaan.`);
    }

    private static async SendHealingEmbed(messageInfo: IMessageInfo, character: Character, receiver: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetHealingEmbed(character, receiver));
    }

    private static async SendInspiringEmbed(messageInfo: IMessageInfo, character: Character, receiver: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetInspiringEmbed(character, receiver));
    }

    private static async SendProtectionEmbed(messageInfo: IMessageInfo, character: Character, receiver: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetProtectionEmbed(character, receiver));
    }

    private static async SendPrayingEmbed(messageInfo: IMessageInfo, character: Character) {
        return await MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetPrayingEmbed(character));
    }

    private static async UpdateHealingEmbed(message: Message, character: Character, receiver: Character, roll: number, healing: number) {
        message.edit('', await CharacterEmbeds.GetHealingEmbed(character, receiver, roll, healing));
    }

    private static async UpdateInspiringEmbed(message: Message, character: Character, receiver: Character, roll: number, inspiration: number) {
        message.edit('', await CharacterEmbeds.GetInspiringEmbed(character, receiver, roll, inspiration));
    }

    private static async UpdateProtectionEmbed(message: Message, character: Character, receiver: Character, roll: number, protection: number) {
        message.edit('', await CharacterEmbeds.GetProtectionEmbed(character, receiver, roll, protection));
    }

    private static async UpdatePrayingEmbed(message: Message, character: Character, roll: number, blessing: number) {
        message.edit('', await CharacterEmbeds.GetPrayingEmbed(character, roll, blessing));
    }

    private static async EditAvatar(messageInfo: IMessageInfo, player: Player, url?: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (url != null && url != '') {
            if (!url.includes('http')) {
                MessageService.ReplyMessage(messageInfo, 'Zorg dat de url die je meegeeft begint met \'http\'.', false);
                return;
            }
        } else {
            const attachment = messageInfo.message?.attachments.first();
            if (attachment == null || !['.png', 'jpeg', '.jpg'].includes(attachment.name?.toLowerCase().slice(-4) || '')) {
                MessageService.ReplyNoImageAttached(messageInfo);
                return;
            }
            url = attachment.url;
        }

        await character.UpdateAvatarUrl(url);
        MessageService.ReplyMessage(messageInfo, 'De avatar van je character is aangepast.', true, true, await CharacterEmbeds.GetCharacterInfoEmbed(character));
    }

    private static async EditLore(messageInfo: IMessageInfo, player: Player, lore: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (lore == null || lore == '') {
            MessageService.ReplyMessage(messageInfo, 'Zorg dat je een lore meegeeft. `;lore [lore]`', false);
            return;
        }

        if (lore.length > SettingsConstants.LORE_MAX_LENGTH) {
            MessageService.ReplyMessage(messageInfo, `Je lore mag niet langer dan ${SettingsConstants.LORE_MAX_LENGTH} tekens zijn.`, false);
            return;
        }

        await character.UpdateLore(lore);
        MessageService.ReplyMessage(messageInfo, 'De lore van je character is aangepast.', true, true, await CharacterEmbeds.GetCharacterInfoEmbed(character));

    }

    private static async EditName(messageInfo: IMessageInfo, player: Player, name: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (name.length > 50) {
            MessageService.ReplyMessage(messageInfo, 'De naam van je character mag niet langer zijn dan 50 tekens.', false);
            return;
        }

        await character.UpdateName(name);
        MessageService.ReplyMessage(messageInfo, `Je naam is aangepast naar ${name}.`);
    }

    private static async EditAttackDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je aanval mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        if (description) {
            description = `"${description}"`.replace('""', '"');
        }

        await character.UpdateAttackDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je aanval beschrijving is aangepast.');
    }

    private static async EditAttackCritDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je aanval mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        if (description) {
            description = `"${description}"`.replace('""', '"');
        }

        await character.UpdateAttackCritDescription(`"${description}"`.replace('""', '"'));
        MessageService.ReplyMessage(messageInfo, 'Je crit aanval beschrijving is aangepast.');
    }

    private static async EditHealDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanHeal()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet healen!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je heal mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        if (description) {
            if (!description.includes('[naam]')) {
                MessageService.ReplyMessage(messageInfo, 'De beschrijving van je heal moet de \'[naam]\' tag bevatten.', false);
                return;
            }

            if (!description.includes('[health]')) {
                MessageService.ReplyMessage(messageInfo, 'De beschrijving van je heal moet de \'[health]\' tag bevatten.', false);
                return;
            }

            description = `"${description}"`.replace('""', '"');
        }

        await character.UpdateHealDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je heal beschrijving is aangepast.');
    }

    private static async EditHealFailDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanHeal()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet healen!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je gefaalde heal mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        if (description) {
            description = `"${description}"`.replace('""', '"');
        }

        await character.UpdateHealFailDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je gefaalde heal beschrijving is aangepast.');
    }

    private static async EditInspireDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanInspire()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet inspireren!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je inspire mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateInspireDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je inspire beschrijving is aangepast.');
    }

    private static async EditInspireFailDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanInspire()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet inspireren!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je inspire mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateInspireDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je inspire faal beschrijving is aangepast.');
    }

    private static async EditProtectionDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanProtect()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet protecten!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je protection mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateProtectionDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je protection beschrijving is aangepast.');
    }

    private static async EditProtectionFailDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanProtect()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet protecten!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je protection faal mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateProtectionFailDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je protection faal beschrijving is aangepast.');
    }

    private static async EditEnchantmentDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanEnchant()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet enchanten!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je enchantment mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateEnchantmentDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je enchantment beschrijving is aangepast.');
    }

    private static async EditPerceptionDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanPercept()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet perception checken!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je perception check mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdatePerceptionDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je perception check beschrijving is aangepast.');
    }

    private static async EditReinforcementDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanReinforce()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet reinforcen!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je reinforcement mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateReinforcementDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je reinforcement beschrijving is aangepast.');
    }

    private static async EditChargeDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanCharge()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet chargen!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je charge mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateChargeDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je charge beschrijving is aangepast.');
    }

    private static async EditChargeFailDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanCharge()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet chargen!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je charge faal mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdateChargeFailDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je charge faal beschrijving is aangepast.');
    }

    private static async EditPrayDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanPray()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet bidden!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je pray mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdatePrayDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je bid beschrijving is aangepast.');
    }

    private static async EditPrayFailDescription(messageInfo: IMessageInfo, player: Player, description: string) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        if (!character.CanPray()) {
            MessageService.ReplyMessage(messageInfo, 'Je character kan helemaal niet bidden!', false);
            return;
        }

        if (description.length > 250) {
            MessageService.ReplyMessage(messageInfo, 'De beschrijving van je pray faal mag niet langer zijn dan 250 tekens.', false);
            return;
        }

        await character.UpdatePrayFailDescription(description);
        MessageService.ReplyMessage(messageInfo, 'Je pray faal beschrijving is aangepast.');
    }

    private static OnReset(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        this.SetResetCharacterTimer(character);

        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetResetCharacterWarningEmbed());
    }

    private static async OnResetConfirm(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        const timer = await this.GetResetCharacterTimer(character);
        if (timer <= 0) {
            return;
        }

        await character.Stop();

        MessageService.ReplyMessage(messageInfo, 'Je character heeft de party verlaten.\nJe kan een nieuw character maken met `;class [class]`', true);
        LogService.Log(character.GetPlayer(), character.GetId(), LogType.CharacterStop, `${character.GetName()} is gestopt.`);
    }

    private static async GetResetCharacterTimer(character: Character) {
        return await Redis.ttl(CharacterHandler.resetConfirmTimerPrefix + character.GetId());
    }

    private static async SetResetCharacterTimer(character: Character) {
        await Redis.set(CharacterHandler.resetConfirmTimerPrefix + character.GetId(), '1', 'EX', Utils.GetMinutesInSeconds(CharacterConstants.RESET_CHARACTER_TIMER_DURATION));
    }

    private static async SendCharacterInfo(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterInfoEmbed(character));
    }

    private static async SendCharacterDescription(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterDescriptionEmbed(character));
    }

    private static async SendCooldownsInfo(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterCooldownsEmbed(character));
    }

    private static async SendStatsInfo(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }

        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterStatsEmbed(character));
    }

    private static async SendHistoryInfo(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetCharacterHistoryEmbed(character));
    }

    private static async SendTopList(messageInfo: IMessageInfo, category: string, topListType: TopListType) {
        category = category.toLowerCase();
        var battleId;
        var ignoreTopListType = false;
        switch (category) {
            case 'xp':
            case 'participatiepunten':
            case 'punten':
            case 'regen':
            case 'regenerated':
            case 'sleep':
            case 'slept':
            case 'slaap':
            case 'geslapen':
            case 'level':
            case 'puzzel':
            case 'puzzels':
            case 'puzzels opgelost':
            case 'puzzle':
            case 'puzzles':
            case 'puzzles solved':
            case 'snelste puzzel':
            case 'snelste puzzels':
            case 'snelste puzzels opgelost':
            case 'snelste puzzle':
            case 'snelste puzzles':
            case 'snelste puzzles solved':
            case 'alle snelste puzzels':
            case 'alle snelste opgelost':
            case 'opgegraven':
            case 'gegraven':
            case 'graven':
            case 'graaf':
            case 'afgepakt':
            case 'gestolen':
            case 'cooldowns':
            case 'cooldown':
            case 'cd':
                ignoreTopListType = true;
                break;
        }

        if (!ignoreTopListType) {
            if (topListType == TopListType.Current) {
                const battle = CampaignManager.GetBattle();
                if (battle == null) {
                    MessageService.ReplyMessage(messageInfo, 'Er is momenteel geen gevecht bezig. Gebruik `;top-pre` om de lijst van het vorige gevecht op te halen. Gebruik `;top-all` om de lijst van alle gevechten bij elkaar op te halen.', false);
                    return;
                }
                battleId = battle.GetId();
            } else if (topListType == TopListType.Previous) {
                const battle = CampaignManager.GetPreviousBattle();
                if (battle == null) {
                    MessageService.ReplyMessage(messageInfo, 'Dat vorige gevecht? Ja sorry maar dat ben ik allemaal weer vergeten. Sorry!', false);
                    return;
                }
                battleId = battle.GetId();
            }
        }

        switch (category) {
            case 'xp':
            case 'level':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopXPEmbed());
                break;
            case 'participatiepunten':
            case 'punten':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopRewardPointsEmbed());
                break;
            case 'regen':
            case 'regenerated':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopRegeneratedEmbed());
                break;
            case 'sleep':
            case 'slept':
            case 'slaap':
            case 'geslapen':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopSleptEmbed());
                break;
            case 'gevechten':
            case 'aanvallen':
            case 'fights':
            case 'attacks':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopFightsEmbed(topListType, battleId));
                break;
            case 'won':
            case 'gewonnen':
            case 'gevechten gewonnen':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopFightsWonEmbed(topListType, battleId));
                break;
            case 'lost':
            case 'verloren':
            case 'gevechten verloren':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopFightsLostEmbed(topListType, battleId));
                break;
            case 'win ratio':
            case 'winratio':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopWinRatioEmbed(topListType, battleId));
                break;
            case 'schade gedaan':
            case 'schade gegeven':
            case 'damage gedaan':
            case 'damage gegeven':
            case 'damage done':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopDamageDoneEmbed(topListType, battleId));
                break;
            case 'schade gekregen':
            case 'schade ontvangen':
            case 'damage gekregen':
            case 'damage ontvangen':
            case 'damage received':
            case 'damage get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopDamageReceivedEmbed(topListType, battleId));
                break;
            case 'crits gedaan':
            case 'crits gegeven':
            case 'crits done':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopCritsDoneEmbed(topListType, battleId));
                break;
            case 'crits gekregen':
            case 'crits ontvangen':
            case 'crits received':
            case 'crits get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopCritsReceivedEmbed(topListType, battleId));
                break;
            case 'heals gekregen':
            case 'heals ontvangen':
            case 'heals received':
            case 'heals get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopHealsReceivedEmbed(topListType, battleId));
                break;
            case 'healing gekregen':
            case 'healing ontvangen':
            case 'healing received':
            case 'healing get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopHealingReceivedEmbed(topListType, battleId));
                break;
            case 'heals gedaan':
            case 'heals gegeven':
            case 'heals done':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopHealsDoneEmbed(topListType, battleId));
                break;
            case 'healing gedaan':
            case 'healing gegeven':
            case 'healing done':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopHealingDoneEmbed(topListType, battleId));
                break;
            case 'inspires gekregen':
            case 'inspires ontvangen':
            case 'inspires received':
            case 'inspires get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopInspiresReceived(topListType, battleId));
                break;
            case 'inspiratie gekregen':
            case 'inspiratie ontvangen':
            case 'inspiration received':
            case 'inspiration get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopInspirationReceivedEmbed(topListType, battleId));
                break;
            case 'inspires':
            case 'inspires done':
            case 'inspires gegeven':
            case 'inspires gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopInspiresDone(topListType, battleId));
                break;
            case 'inspiratie':
            case 'inspiration':
            case 'inspiration done':
            case 'inspiratie gegeven':
            case 'inspiratie gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopInspirationDoneEmbed(topListType, battleId));
                break;
            case 'protects gekregen':
            case 'protects ontvangen':
            case 'protects received':
            case 'protects get':
            case 'protections gekregen':
            case 'protections ontvangen':
            case 'protections received':
            case 'protections get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopProtectsReceived(topListType, battleId));
                break;
            case 'protection gekregen':
            case 'protection ontvangen':
            case 'protection received':
            case 'protection get':
            case 'bescherming gekregen':
            case 'bescherming ontvangen':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopProtectionReceivedEmbed(topListType, battleId));
                break;
            case 'protects':
            case 'protects done':
            case 'protects gegeven':
            case 'protects gedaan':
            case 'protections':
            case 'protections done':
            case 'protections gegeven':
            case 'protections gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopProtectsDone(topListType, battleId));
                break;
            case 'protection':
            case 'protection done':
            case 'protection gegeven':
            case 'protection gedaan':
            case 'bescherming':
            case 'bescherming gegeven':
            case 'bescherming gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopProtectionDoneEmbed(topListType, battleId));
                break;
            case 'enchants gekregen':
            case 'enchants ontvangen':
            case 'enchants received':
            case 'enchants get':
            case 'enchantments gekregen':
            case 'enchantments ontvangen':
            case 'enchantments received':
            case 'enchantments get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopEnchantmentsReceivedEmbed(topListType, battleId));
                break;
            case 'enchants':
            case 'enchants done':
            case 'enchants gegeven':
            case 'enchants gedaan':
            case 'enchantments':
            case 'enchantments done':
            case 'enchantments gegeven':
            case 'enchantments gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopEnchantmentsDoneEmbed(topListType, battleId));
                break;
            case 'reinforcements gekregen':
            case 'reinforcements ontvangen':
            case 'reinforcements received':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopReinforcementsReceivedEmbed(topListType, battleId));
                break;
            case 'reinforcements':
            case 'reinforcements done':
            case 'reinforcements gegeven':
            case 'reinforcements gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopReinforcementsDoneEmbed(topListType, battleId));
                break;
            case 'perceptions gekregen':
            case 'perceptions ontvangen':
            case 'perceptions received':
            case 'perceptions get':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopPerceptionsReceivedEmbed(topListType, battleId));
                break;
            case 'perceptions':
            case 'perceptions done':
            case 'perceptions gegeven':
            case 'perceptions gedaan':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopPerceptionsDoneEmbed(topListType, battleId));
                break;
            case 'luck':
            case 'geluk':
            case 'rolls':
            case 'lucky':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopLuckEmbed(topListType, battleId));
                break;
            case 'unlucky':
            case 'pech':
            case 'laagste rolls':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopLuckEmbed(topListType, battleId, true));
                break;
            case 'cooldowns':
            case 'cooldown':
            case 'cd':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopCooldownsEmbed());
                break;
            case 'puzzel':
            case 'puzzels':
            case 'puzzels opgelost':
            case 'puzzle':
            case 'puzzles':
            case 'puzzles solved':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopPuzzlesSolvedEmbed());
                break;
            case 'snelste puzzel':
            case 'snelste puzzels':
            case 'snelste puzzels opgelost':
            case 'snelste puzzle':
            case 'snelste puzzles':
            case 'snelste puzzles solved':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopFastestPuzzlesSolvedEmbed(false));
                break;
            case 'alle snelste puzzles':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopFastestPuzzlesSolvedEmbed(true));
                break;
            case 'cards':
            case 'kaart':
            case 'kaarten':
            case 'kaartjes':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopUniqueCards());
                break;
            case 'opgegraven':
            case 'gegraven':
            case 'graven':
            case 'graaf':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopCardsReceivedByPieces());
                break;
            case 'afgepakt':
            case 'gestolen':
                MessageService.ReplyEmbed(messageInfo, await CharacterEmbeds.GetTopCardsTaken());
                break;
            default:
                MessageService.ReplyMessage(messageInfo, `Ik heb geen lijst van top 10 ${category}. Kijk ff in die pins voor de lijst van mogelijke lijsten.`, false);
                return;
        }
    }

    // private static async OnProfile(messageInfo: IMessageInfo, player: Player) {
    //     const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
    //     if (character == null) {
    //         return;
    //     }

    //     const applyText = (canvas: any, text: any) => {
    //         const ctx = canvas.getContext('2d');

    //         // Declare a base size of the font
    //         let fontSize = 70;

    //         do {
    //             // Assign the font to the context and decrement it so it can be measured again
    //             ctx.font = `${fontSize -= 10}px sans-serif`;
    //             // Compare pixel width of the text to the canvas minus the approximate avatar size
    //         } while (ctx.measureText(text).width > canvas.width - 300);

    //         // Return the result to use in the actual canvas
    //         return ctx.font;
    //     };

    //     const equipment = character.GetEquipment();

    //     const canvas = Canvas.createCanvas(700, 250 + 133 * Math.ceil(equipment.length / 5));
    //     const ctx = canvas.getContext('2d');

    //     // const background = await Canvas.loadImage('./wallpaper.jpg');
    //     // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    //     ctx.strokeStyle = '#000000';
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);

    //     // ctx.beginPath();
    //     // ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    //     // ctx.closePath();
    //     // ctx.clip();

    //     const avatar = await Canvas.loadImage(character.GetAvatarUrl());
    //     const higherWidth = avatar.width > avatar.height;
    //     const factor = higherWidth ? 200 / avatar.width : 200 / avatar.height;
    //     const width = avatar.width * factor;
    //     const height = avatar.height * factor;
    //     ctx.drawImage(avatar, 25 + (200 - width) / 2, 25 + (200 - height) / 2, width, height);

    //     var done = false;
    //     for (let i = 0; i < 3; i++) {
    //         for (let j = 0; j < 5; j++) {
    //             const index = i * 5 + j;
    //             if (index > equipment.length - 1) {
    //                 done = true;
    //                 break;
    //             }

    //             const card = equipment[index];
    //             const cardImage = await Canvas.loadImage(card.GetImageUrl());
    //             const higherWidth = cardImage.width > cardImage.height;
    //             const factor = higherWidth ? 125 / cardImage.width : 125 / cardImage.height;
    //             const width = cardImage.width * factor;
    //             const height = cardImage.height * factor;
    //             ctx.fillStyle = '#24120D';
    //             ctx.strokeStyle = '#693427';
    //             ctx.strokeWidth = 2;
    //             ctx.fillRect(25 + j * 130, 250 + i * 130, 125, 125);
    //             ctx.strokeRect(25 + j * 130, 250 + i * 130, 125, 125);
    //             ctx.drawImage(cardImage, 25 + j * 130 + (125 - width) / 2, 250 + i * 130 + (125 - height) / 2, width, height); j;
    //         }

    //         if (done) {
    //             break;
    //         }
    //     }

    //     // Add an exclamation point here and below
    //     // ctx.font = applyText(canvas, `${character.GetName()}!`);
    //     ctx.font = applyText(canvas, character.GetName());
    //     ctx.fillStyle = '#ffffff';
    //     ctx.fillText(character.GetName(), canvas.width / 2.5 - 20, 100);

    //     const attachment = DiscordService.GetMessageAttachment(canvas.toBuffer(), 'profile.png');

    //     MessageService.ReplyMessage(messageInfo, '', undefined, undefined, undefined, [attachment]);
    // }

    private static SendEquipment(messageInfo: IMessageInfo, player: Player) {
        const character = PlayerManager.GetCharacterFromPlayer(messageInfo, player);
        if (character == null) {
            return;
        }
        MessageService.ReplyEmbed(messageInfo, CharacterEmbeds.GetEquipmentEmbed(character));
    }

    private static SendUnknownClassName(messageInfo: IMessageInfo) {
        MessageService.ReplyMessage(messageInfo, `Kies een van de volgende classes:\n${this.classNames.join(', ')}`, false);
    }

    private static ReplyNotFullHealth(messageInfo: IMessageInfo, character: Character) {
        MessageService.ReplyMessage(messageInfo, `Je mag dit alleen doen wanneer je full health bent.\nHealth: ${character.GetCurrentHealth()}/${character.GetMaxHealth()}`, false);
    }
}