const mTxServCommand = require('../mTxServCommand.js');
const { formatNumber } = require('../../util/Util');
require('moment-duration-format');

module.exports = class BotStatsCommand extends mTxServCommand {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: ['bot-stats'],
            group: 'bot',
            memberName: 'stats',
            description: 'Display bot stats.',
            guarded: true,
        });
    }

    async run(msg) {
        const lang = require(`../../languages/${await this.resolveLangOfMessage(msg)}.json`)
        return this.sayMessage(msg, lang['stats']['servers'].replace('%count%', formatNumber(this.client.guilds.cache.size)))
    }
};