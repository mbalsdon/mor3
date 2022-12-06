import MorUtils from '../../controller/utils/MorUtils.js'

/**
 * Pings the bot and replies when ping is received
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function pingCmd (interaction) {
  console.info('Bot::pingCmd ()') // TODO: replace

  try {
    await interaction.editReply('pong!')
  } catch (error) {
    await interaction.editReply({
      content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
    })

    throw error
  }
}
