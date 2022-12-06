import MorConfig from '../../controller/utils/MorConfig.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Replies with a list of MOR's bot commands
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function helpCmd (interaction) {
  console.info('Bot::helpCmd ()') // TODO: replace

  try {
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} commands`, iconURL: MorConfig.SERVER_ICON_URL, url: 'https://github.com/mbalsdon/mor3' })
      .setDescription('`help` - Documentation on the bot\'s commands\n' +
            '`ping` - Checks if the bot is alive\n' +
            '`metadata` - Displays mor3 sheet metadata\n' +
            '`users` - Displays list of tracked users, sorted by PP\n' +
            '`user` - Displays a user\'s stats\n' +
            '`track` - Adds a user to be tracked [MODERATORS ONLY]\n' +
            '`untrack` - Removes a user from being tracked [MODERATORS ONLY]\n' +
            '`tracklist` - Lists all tracked users in a .txt file\n' +
            '`submit` - Manually submits a score to the database\n' +
            '`unsubmit` - Removes a submitted score from the database [MODERATORS ONLY]\n' +
            '`scores` - Displays list of scores for a given mod combo, sorted by PP\n')
      .setFooter({ text: 'https://github.com/mbalsdon/mor3' })

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    await interaction.editReply({
      content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
    })

    throw error
  }
}
