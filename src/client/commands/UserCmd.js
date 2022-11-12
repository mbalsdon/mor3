import Config from '../../controller/Config.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Replies with a MOR user's profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @return {Promise<void>}
 */
export default async function userCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`Bot::userCmd (${username})`) // TODO: replace
  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const user = await facade.getSheetUser(username)
    const embed = new EmbedBuilder()
      .setColor(Config.BOT_EMBED_COLOR)
      .setAuthor({ name: `MOR3 profile for ${user.username}`, iconURL: `${user.pfpLink}`, url: `https://osu.ppy.sh/users/${user.id}` })
      .setDescription( // TODO: some dupecode here from scores.js (medalemoji)
        `▸ **:globe_with_meridians: Global Rank:** #${user.globalRank}\n` +
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
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
