import MorConfig from '../../controller/MorConfig.js'
import { AlreadyExistsError, NotFoundError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

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
  console.info(`Bot::trackCmd (${username})`) // TODO: replace
  try {
    const autotrack = at ? 'TRUE' : 'FALSE'
    const user = await facade.addSheetUser(username, autotrack)
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} now tracking: ${user.username}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://osu.ppy.sh/users/${user.userId}` })
      .setDescription(
        `▸ **:video_game: Playstyle:** ${user.playstyle}\n` +
        `▸ **:globe_with_meridians: Global Rank:** #${user.globalRank}\n` +
        `▸ **:map: Country Rank:** #${user.countryRank}\n` +
        `▸ **:farmer: PP:** ${user.pp}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n` +
        `▸ **:desktop: Total Playtime:** ${user.playtime} hours\n` +
        (user.autotrack === 'TRUE' ? '' : `\n**:warning: NOTE:** This user's plays are not being automatically tracked!`)
      )
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `owobot: >track add "${user.username}" | Bathbot: <track "${user.username}"` })
    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      await interaction.editReply({
        content: `\`\`\`User "${username}" has already been added!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else if (error instanceof NotFoundError) {
      await interaction.editReply({
        content: `\`\`\`User "${username}" could not be found!\n\n` +
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
