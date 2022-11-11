import { EmbedBuilder } from 'discord.js'
import Config from '../../controller/Config.js'

/**
 * Removes a user from the MOR sheet and replies with their profile
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @return {Promise<void>}
 */
export default async function untrackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`Bot::untrackCmd (${username})`) // TODO: replace
  try {
    const user = await facade.deleteSheetUser(username)
    const embed = new EmbedBuilder()
      .setColor(Config.BOT_EMBED_COLOR)
      .setAuthor({ name: `MOR3 no longer tracking: ${user.username}`, iconURL: user.pfpLink, url: `https://osu.ppy.sh/users/${user.userId}` })
      .setDescription(
        `▸ **:globe_with_meridians: Global Rank:** #${user.globalRank}\n` +
        `▸ **:farmer: PP:** ${user.pp}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user.accuracy}%\n` +
        `▸ **:desktop: Total Playtime:** ${user.playtime} hours`
      )
      .setThumbnail(user.pfpLink)
      .setFooter({ text: `owobot: >track remove "${user.username}" | Bathbot: <untrack "${user.username}"` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
