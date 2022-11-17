import MorUtils from '../../controller/MorUtils.js'

/**
 * Pings the bot and replies when ping is received
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function pingCmd (interaction) {
  console.info('Bot::pingCmd ()') // TODO: replace
  try {
    await interaction.reply('pong!')
  } catch (error) {
    await interaction.reply({
      content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
      ephemeral: true
    })
    throw error
  }
}
