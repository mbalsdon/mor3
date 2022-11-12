import Config from '../../controller/Config.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Replies with a list of MOR's bot commands
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @return {Promise<void>}
 */
export default async function helpCmd (interaction) {
  console.info('Bot::helpCmd ()') // TODO: replace
  try {
    const embed = new EmbedBuilder()
      .setColor(Config.BOT_EMBED_COLOR)
      .setAuthor({ name: 'mor3 commands', iconURL: 'https://spreadnuts.s-ul.eu/MdfvA3q5', url: 'https://github.com/mbalsdon/mor3' })
      .setDescription('`help` - Documentation on the bot\'s commands\n' +
            '`ping` - Checks if the bot is alive\n' +
            '`metadata` - Displays mor3 sheet metadata\n' +
            '`users` - Displays list of tracked users, sorted by PP\n' +
            '`user` - Displays a user\'s stats\n' +
            '`track` - Adds a user to be tracked\n' +
            '`untrack` - Removes a user from being tracked\n' +
            '`tracklist` - Lists all tracked users in a .txt file\n' +
            '`submit` - Manually submits a score to the database\n' +
            '`unsubmit` - Removes a submitted score from the database\n' +
            '`scores` - Displays list of scores for a given mod combo, sorted by PP\n')
      .setFooter({ text: 'https://github.com/mbalsdon/mor3' })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
