import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

import '../../controller/utils/Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

/**
 * Removes a user from the MOR sheet and replies with their profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function untrackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  logger.info(`Executing untrackCmd... username=${username}`)

  try {
    const user = await facade.deleteSheetUser(username)

    const countryRankStr = `▸ **:flag_${user.countryCode.toLowerCase()}: Country Rank:** ${(user.countryRank === 'null' ? 'n/a' : `#${user.countryRank}`)}\n`
    const globalRankStr = `▸ **:globe_with_meridians: Global Rank:** ${(user.globalRank === 'null' ? 'n/a' : `#${user.globalRank}`)}\n`
    const playstyleStr = `▸ **:video_game: Playstyle:** ${(user.playstyle === 'null' ? 'n/a' : user.playstyle)}\n`
    const ppStr = `▸ **:farmer: PP:** ${user.pp}pp\n`
    const accStr = `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n`
    const playtimeStr = `▸ **:desktop: Total Playtime:** ${user.playtime} hours\n\n`

    const descStr = countryRankStr + globalRankStr + playstyleStr + ppStr + accStr + playtimeStr

    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} no longer tracking: ${user.username}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://osu.ppy.sh/users/${user.userId}` })
      .setDescription(descStr)
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `owobot: >track remove "${user.username}" | Bathbot: <untrack "${user.username}"` })

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof NotFoundError) {
      await interaction.editReply({
        content: `\`\`\`Could not find user "${username}"!\n\n` +
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
