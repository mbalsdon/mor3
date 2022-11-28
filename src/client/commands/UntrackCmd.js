import MorConfig from '../../controller/MorConfig.js'
import { NotFoundError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Removes a user from the MOR sheet and replies with their profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function untrackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`Bot::untrackCmd (${username})`) // TODO: replace
  try {
    const user = await facade.deleteSheetUser(username)
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} no longer tracking: ${user.username}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://osu.ppy.sh/users/${user.userId}` })
      .setDescription(
        `▸ **:video_game: Playstyle:** ${user.playstyle}\n` +
        `▸ **:globe_with_meridians: Global Rank:** #${user.globalRank}\n` +
        `▸ **:map: Country Rank:** #${user.countryRank}\n` +
        `▸ **:farmer: PP:** ${user.pp}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n` +
        `▸ **:desktop: Total Playtime:** ${user.playtime} hours`
      )
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `owobot: >track remove "${user.username}" | Bathbot: <untrack "${user.username}"` })
    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof NotFoundError) {
      await interaction.editReply({
        content: `\`\`\`Could not find user "${username}"!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else {
      await interaction.editReply({
        content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
      throw error
    }
  }
}
