const mTxServCommand = require('../mTxServCommand.js');
const Discord = require('discord.js');

module.exports = class GiveawayCommand extends mTxServCommand {
    constructor(client) {
        super(client, {
            name: 'giveaway',
            aliases: ['concour', 'concours'],
            group: 'mtxserv',
            memberName: 'giveaway',
            description: 'Show current giveaway',
            clientPermissions: ['SEND_MESSAGES'],
            throttling: {
                usages: 2,
                duration: 5,
            },
        });
    }

    async run(msg) {
        const lang = require(`../../languages/${await this.resolveLangOfMessage(msg)}.json`);

        const prizes = [
            '1x [VPS SSD 4 Go](https://mtxserv.com/fr/vps-ssd) - 1 mois',
            '1x [Serveur Minecraft 3 Go](https://mtxserv.com/fr/hebergeur-serveur-minecraft) - 1 mois',
            '1x [Serveur GMod Starter](https://mtxserv.com/fr/hebergeur-serveur-garry-s-mod) - 1 mois',
            //'1x [Serveur Rust Starter](https://mtxserv.com/fr/hebergeur-serveur-rust) - 1 mois',
            //'1x [Serveur ARK Starter](https://mtxserv.com/fr/hebergeur-serveur-ark) - 1 mois',
        ]

        const actions = [
            '> **+10 points**・Réagissez à ce message avec :gift:',
            '> **+10 points**・Retweetez le [message sur twitter](https://twitter.com/mTxServ/status/1321140385880645634) et suivez le compte [@mTxServ](https://twitter.com/mTxServ)',
            '> **+10 points**・Partager le giveaway sur discord  avec \`m!giveaway\` (le <#769619263078006844> doit être sur votre serveur)',
            '> **+30 points**・Suivez le channel <#563304015924953108> sur votre serveur discord',
            '> **+30 points**・Boostez le serveur discord de mTxServ',
        ]

        const reaction = ':alarm_clock:'
        const endDate = '01 Nov 2020 à 20H'

        const prizeLabel = prizes.map(prize => `> ❯ ${prize}`).join('\n')

        const embed = new Discord.MessageEmbed()
            .setTitle('GIVEAWAY')
            .setColor('YELLOW')
        ;

        let giveawayMsg = null

        if (this.client.isMainGuild(msg.guild.id) && this.client.isOwner(msg.author)) {
            embed.setDescription(`Tirage au sort le **${endDate}**\n\n:four_leaf_clover: **Participer et Augmenter ses chances** :four_leaf_clover:\n\n${actions.join('\n')}\n\n:gift_heart: **Lots** :gift_heart:\n\n${prizeLabel}`)

            const channel = await this.client.channels.cache.get('563304015924953108')
            giveawayMsg = await channel.messages.fetch('770702367049252874').catch(console.error)

            if (giveawayMsg) {
                await giveawayMsg.edit({
                    content: `C'est parti pour un nouveau giveaway!`,
                    embed: embed
                })
            } else {
                giveawayMsg = await msg.channel.send({
                    //content: `@everyone C'est parti pour un nouveau giveaway!`,
                    embed: embed,
                })
            }

            msg.delete()
        } else {
            embed.setDescription(`**Pour participer** au giveaway organisé par [mTxServ](https://mtxserv.com/fr/), rendez-vous dans <#563304015924953108> (ou utilisez cette [invitation pour le discord du giveaway](${this.client.options.invite})).\n\n${reaction} Tirage au sort le **${endDate}**\n\n:gift_heart: **Lots** :gift_heart:\n\n${prizeLabel}`)
            embed.addField('Comment participer?', `[Rejoindre le discord du giveaway](${this.client.options.invite})`)

            giveawayMsg = await msg.say({
                embed
            });
        }

        giveawayMsg.react('🎁')

        if (!this.client.isMainGuild(msg.guild.id)) {
            await this.client.provider.set(isDev ? 'giveaway_msg_dev' : 'giveaway_msg', msg.author.id, {
                guildId: msg.guild.id,
                guildName: msg.guild.name,
                messageId: giveawayMsg.id
            })
        }

        return giveawayMsg
    }
};