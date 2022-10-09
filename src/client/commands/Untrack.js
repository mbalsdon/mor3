import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function untrackCmd (facade, interaction) {
  const id = interaction.options.getString('id')
  console.info(`::untrackCmd( ${id} )`)
  try {
    const user = await facade.deleteUser(id)
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setTitle(`No longer tracking: ${user.username}`)
      .setURL(`https://osu.ppy.sh/users/${user.id}`)
      .setDescription(`Rank #${user.statistics.global_rank} (${user.statistics.pp}pp)`)
      .setThumbnail(user.avatar_url)
      .setFooter({ text: `Remember to >track remove "${user.username}" and <untrack "${user.username}" !` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
