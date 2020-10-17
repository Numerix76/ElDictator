const mTxServCommand = require('../mTxServCommand.js')
const mTxServApi = require('../../api/mTxServApi')
const GameServerApi = require('../../api/GameServerApi')
const Discord = require('discord.js')

module.exports = class GameServerAddCommand extends mTxServCommand {
    constructor(client) {
        super(client, {
            name: 'add-server',
            aliases: ['server-add', 'serveur-add', 'add-serveur'],
            group: 'gameserver',
            memberName: 'add-server',
            description: 'Add a game servers',
            userPermissions: ['ADMINISTRATOR'],
            clientPermissions: ['SEND_MESSAGES'],
            guarded: true,
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 5,
            },
        });
    }

    async run(msg) {
        const userLang = this.resolveLangOfMessage(msg)
        const lang = require(`../../languages/${userLang}.json`)

        const api = new mTxServApi()
        const isAuthenticated = api.isAuthenticated(msg.author.id)
        if (!isAuthenticated) {
            return this.sayError(msg, lang['server_add']['not_logged'])
        }

        let oauth

        try {
            oauth = await api.loginFromCredentials(msg.author.id)
        } catch(err) {
            console.error(err)
            return this.sayError(msg, lang['me']['cant_fetch'])
        }

        await this.sayWarning(msg, 'Retrieving game servers, please wait..')

        const invoices = await api.call(oauth['access_token'], 'invoices')

        if (!invoices.length) {
            return this.sayError(msg, lang['server_add']['no_result'])
        }

        const gsApi = new GameServerApi()

        let embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTimestamp()

        const list = []

        for (const invoice of invoices) {
            if (invoice.type_id !== 1) {
                continue;
            }

            const status = await gsApi.status(invoice.game, invoice.host, invoice.port)
            list.push({
                invoice: invoice,
                status: status
            })
        }

        embed.setDescription(list.map((item, key) => `**${++key}.** ❯ \`${item.status.params.used_slots||0}/${item.status.params.max_slots||0}\` - \`${item.invoice.address.toUpperCase()}\` - \`${item.status.params.host_name||item.invoice.cache_hostname||item.invoice.name}\``))

        await msg.say({
            embed
        })

        let serverKey = await this.getInput(msg, 'Quel serveur voulez-vous ajouter (ex: 1)?', true);
        serverKey--

        if (typeof invoices[serverKey] === 'undefined') {
            return this.sayError(msg, 'Ce serveur n\'existe pas.')
        }

        this.saySuccess(msg, 'Le serveur a été ajouté!')

        this.client.guildSettings.addGameServer(msg.guild.id, {
            game: invoices[serverKey].game,
            address: invoices[serverKey].address
        })

        embed = await gsApi.generateEmbed(msg, invoices[serverKey].game, invoices[serverKey].address, userLang)
        return msg.say({
            embed
        })
    }
};