const Discord = require('discord.js')
const Grabity = require("grabity");
const getUrls = require('get-urls');
const URL = require('url').URL
const { stripInvites, extractInviteLink } = require('../util/Util');

module.exports = {
    run: async (msg) => {
        if (msg.author.bot) return;
        if (msg.channel.type !== 'text') return;

        // share/img channels
        if (msg.channel.id === process.env.SHARE_CHANNEL_ID_FR
            || msg.channel.id === process.env.SHARE_CHANNEL_ID_EN) {

            msg.react('👍');
            msg.react('👎');
            msg.react('🤷');
        }

        // gameservers pub
        if (
            ( -1 !== msg.channel.name.indexOf('-pub-serveurs') || -1 !== msg.channel.name.indexOf('-servers-pub') )
        ) {
            const inviteLink = extractInviteLink(msg.content)

            let content = Discord.Util.removeMentions(stripInvites(msg.content)).trim()
            if (!content) {
                return
            }

            const urls = getUrls(content);
            const link = inviteLink ? inviteLink : urls.values().next().value || null;

            const embed = new Discord.MessageEmbed()
                .setAuthor(`${msg.author.tag}`, `${msg.author.displayAvatarURL()}`, link)
                .setColor(Math.floor(Math.random() * 16777214) + 1)
            ;

            if (null !== inviteLink) {
                const metadata = await Grabity.grabIt(inviteLink)

                if (metadata.title && -1 !== metadata.title.indexOf('Join the ')) {
                    const title = metadata.title.replace('Discord Server!', '').replace('Join the', '')
                    embed
                        .setTitle(title)
                        .addField('Discord', `[${title}](${inviteLink})`, true)
                }
            }

            if (null !== link) {
                const url = new URL(link)
                const metadata = await Grabity.grabIt(link)

                if (metadata.image) {
                    if ('/' === metadata.image.substr(0, 1)) {
                        metadata.image = `${url.protocol}//${url.host}${metadata.image}`
                    }

                    const isValidUrl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(metadata.image)
                    if (isValidUrl) {
                        embed.setThumbnail(metadata.image)
                    }
                }
            }

            const items = urls.values()
            let item = items.next()

            do {
                if (!item.value) {
                    break
                }

                const metadata = await Grabity.grabIt(item.value)
                if (metadata && metadata.title) {
                    content = content.split(item.value).join('')
                    embed.addField('Top Serveur', `[${metadata.title}](${item.value})`, true)
                }
            }
            while (item = items.next())

            embed.setDescription(content)

            const attachments = msg.attachments.map(attachment => attachment)

            for (const attachment of attachments) {
                embed.attachFiles(new Discord.MessageAttachment(attachment.attachment))
                embed.setImage(`attachment://${attachment.name}`)
            }

            const embedMsg = await msg.channel.send({
                embed: embed,
            })

            embedMsg.react('👍');
            embedMsg.react('👎');

            msg.delete()
        }
    }
};