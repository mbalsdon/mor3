import MorConfig from '../../controller/utils/MorConfig.js'
import { AlreadyExistsError, NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

/**
 * Adds a user to the MOR sheet and replies with their profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function trackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  const at = interaction.options.getBoolean('autotrack')
  logger.info(`Executing trackCmd... username=${username}, autotrack=${at}`)

  try {
    const autotrack = at ? 'TRUE' : 'FALSE'
    const user = await facade.addSheetUser(username, autotrack)

    const countryRankStr = `▸ **:flag_${user.countryCode.toLowerCase()}: Country Rank:** ${(user.countryRank === 'null' ? 'n/a' : `#${user.countryRank}`)}\n`
    const globalRankStr = `▸ **:globe_with_meridians: Global Rank:** ${(user.globalRank === 'null' ? 'n/a' : `#${user.globalRank}`)}\n`
    const playstyleStr = `▸ **:video_game: Playstyle:** ${(user.playstyle === 'null' ? 'n/a' : user.playstyle)}\n`
    const ppStr = `▸ **:farmer: PP:** ${user.pp}pp\n`
    const accStr = `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n`
    const playtimeStr = `▸ **:desktop: Total Playtime:** ${user.playtime} hours\n\n`

    const autotrackStr = (user.autotrack === 'TRUE' ? '' : '\n**:warning: NOTE:** This user\'s plays are not being automatically tracked!')

    const descStr = countryRankStr + globalRankStr + playstyleStr + ppStr + accStr + playtimeStr + autotrackStr

    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} now tracking: ${user.username}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://osu.ppy.sh/users/${user.userId}` })
      .setDescription(descStr)
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `owobot: >track add "${user.username}" | Bathbot: <track "${user.username}"` })

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      await interaction.editReply({
        content: `\`\`\`User "${username}" has already been added!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })
    } else if (error instanceof NotFoundError) {
      await interaction.editReply({
        content: `\`\`\`User "${username}" could not be found!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })
    } else {
      await interaction.editReply({
        content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })

      throw error
    }
  }
}
