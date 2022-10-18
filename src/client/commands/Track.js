import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function trackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`::trackCmd( ${username} )`)
  try {
    const user = await facade.putUser(username)
    const playstyleStr = (user.playstyle === null) ? ' ' : `▸ **:video_game: Playstyle:** ${user.playstyle.map(p => { return p[0].toUpperCase() + p.substring(1) }).join(', ')}`
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setAuthor({ name: `MOR3 now tracking: ${user.username}`, iconURL: `${user.avatar_url}`, url: `https://osu.ppy.sh/users/${user.id}` })
      .setDescription( // TODO: dupecode, build user object
        `▸ **:globe_with_meridians: Global Rank:** #${user.statistics.global_rank}\n` +
        `▸ **:farmer: PP:** ${user.statistics.pp}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user.statistics.hit_accuracy.toFixed(2)}%\n` +
        `▸ **:desktop: Total Playtime:** ${Math.round(user.statistics.play_time / 3600)} hours\n` +
        playstyleStr
      )
      .setThumbnail(user.avatar_url)
      .setFooter({ text: `owobot: >track add "${user.username}" | Bathbot: <track "${user.username}"` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
