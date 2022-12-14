import MorConfig from '../../controller/utils/MorConfig.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

/**
 * Replies with a list of MOR's bot commands
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function helpCmd (interaction) {
  logger.info('Executing helpCmd...')

  try {
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} Commands`, iconURL: MorConfig.SERVER_ICON_URL, url: 'https://github.com/mbalsdon/mor3' })
      .setDescription('`help` - List the bot\'s commands\n' +
            '`ping` - Check if the bot is alive\n' +
            `\`metadata\` - Display ${MorConfig.SHEETS.SPREADSHEET.NAME} sheet metadata\n` +
            '`users` - Display leaderboard for currently tracked users \n' +
            '`user` - Display a tracked user\'s stats\n' +
            '`track` - Add a user and begin tracking their plays [MODERATORS ONLY]\n' +
            '`untrack` - Remove a user and stop tracking their plays [MODERATORS ONLY]\n' +
            '`tracklist` - Generate a .txt file containing all currently tracked users\n' +
            '`submit` - Manually submit a score\n' +
            '`unsubmit` - Remove a submitted score [MODERATORS ONLY]\n' +
            '`scores` - Display the leaderboard for all scores set by tracked users\n' +
            '`leaderboard` - Display the leaderboard for scores set by tracked users on a specific map\n')
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
