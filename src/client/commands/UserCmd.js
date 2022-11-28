import MorConfig from '../../controller/MorConfig.js'
import { NotFoundError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Replies with a MOR user's profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function userCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`Bot::userCmd (${username})`) // TODO: replace
  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const user = await facade.getSheetUser(username)
    const sheetRank = await facade.getSheetUserRank(username)
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `TODO profile for ${user.username}`, iconURL: `${user.pfpLink}`, url: `https://osu.ppy.sh/users/${user.id}` })
      .setDescription(
        `▸ **:video_game: Playstyle:** ${user.playstyle}\n` +
        `▸ **:globe_with_meridians: Global Rank:** #${user.globalRank}\n` +
        `▸ **:map: Country Rank:** #${user.countryRank}\n` +
        `▸ **:trophy: TODO Rank:** #${sheetRank}\n` +
        `▸ **:farmer: PP:** ${user.pp}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n` +
        `▸ **:desktop: Total Playtime:** ${user.playtime} hours\n\n` +

        `▸ **:first_place: Mod leaderboard #1s:** ${user.top1s}\n` +
        `▸ **:second_place: Mod leaderboard #2s:** ${user.top2s}\n` +
        `▸ **:third_place: Mod leaderboard #3s:** ${user.top3s}\n\n` +

        `▸ **:medal: Mod leaderboard Top 5s:** ${user.top5s}\n` +
        `▸ **:military_medal: Mod leaderboard Top 10s:** ${user.top10s}\n` +
        `▸ **:small_orange_diamond: Mod leaderboard Top 25s:** ${user.top25s}\n`
      )
      .setThumbnail(user.pfpLink)
      // .addFields(
      //   { name: '1', value: '1', inline: true},
      //   { name: '2', value: '2', inline: true},
      //   { name: '3', value: '3', inline: true}
      // )
      .setFooter({ text: `Last update: ${lastUpdated}` })
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
