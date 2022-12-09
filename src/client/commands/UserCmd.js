import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

/**
 * Replies with a MOR user's profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function userCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  logger.info(`Executing userCmd... username=${username}`)

  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const user = await facade.getSheetUser(username)
    const sheetRank = await facade.getSheetUserRank(username)

    const sheetRankStr = `▸ **:trophy: ${MorConfig.SHEETS.SPREADSHEET.NAME} Rank:** ${(user.autotrack === 'FALSE' ? 'n/a' : `#${sheetRank}`)}\n`
    const countryRankStr = `▸ **:flag_${user.countryCode.toLowerCase()}: Country Rank:** ${(user.countryRank === 'null' ? 'n/a' : `#${user.countryRank}`)}\n`
    const globalRankStr = `▸ **:globe_with_meridians: Global Rank:** ${(user.globalRank === 'null' ? 'n/a' : `#${user.globalRank}`)}\n`
    const playstyleStr = `▸ **:video_game: Playstyle:** ${(user.playstyle === 'null' ? 'n/a' : user.playstyle)}\n`
    const ppStr = `▸ **:farmer: PP:** ${user.pp}pp\n`
    const accStr = `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n`
    const playtimeStr = `▸ **:desktop: Total Playtime:** ${user.playtime} hours\n\n`

    const top1Str = `▸ **:first_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard #1s:** ${(user.top1s === '-1' ? 'n/a' : user.top1s)}\n`
    const top2Str = `▸ **:second_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard #2s:** ${(user.top2s === '-1' ? 'n/a' : user.top2s)}\n`
    const top3Str = `▸ **:third_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard #3s:** ${(user.top3s === '-1' ? 'n/a' : user.top3s)}\n`
    const top5Str = `▸ **:medal: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard Top 5s:** ${(user.top5s === '-1' ? 'n/a' : user.top5s)}\n`
    const top10Str = `▸ **:military_medal: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard Top 10s:** ${(user.top10s === '-1' ? 'n/a' : user.top10s)}\n`
    const top25Str = `▸ **:small_orange_diamond: ${MorConfig.SHEETS.SPREADSHEET.NAME} Mod Leaderboard Top 25s:** ${(user.top25s === '-1' ? 'n/a' : user.top25s)}\n`

    const autotrackStr = (user.autotrack === 'TRUE' ? '' : '\n**:warning: NOTE:** This user\'s plays are not being automatically tracked!')

    const descStr = sheetRankStr + countryRankStr + globalRankStr + playstyleStr + ppStr + accStr + playtimeStr +
                    top1Str + top2Str + top3Str + top5Str + top10Str + top25Str +
                    autotrackStr

    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} Profile for ${user.username}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://osu.ppy.sh/users/${user.id}` })
      .setDescription(descStr)
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `Last update: ${MorUtils.prettifyDate(lastUpdated)}` })

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
