import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function trackCmd (facade, interaction) {
  const id = interaction.options.getString('id')
  console.info(`::trackCmd( ${id} )`)
  try {
    const user = await facade.putUser(id)
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setTitle(`Now tracking: ${user.username}`)
      .setURL(`https://osu.ppy.sh/users/${user.id}`)
      .setDescription(`Rank #${user.statistics.global_rank} (${user.statistics.pp}pp)`)
      .setThumbnail(user.avatar_url)
      .setFooter({ text: `Remember to >track add "${user.username}" and <track "${user.username}" !` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
