import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function submitCmd (facade, interaction) {
  const id = interaction.options.getString('id')
  console.info(`::submitCmd( ${id} )`)
  try {
    const s = await facade.putSubmittedScore(id)
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setTitle(`${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}] +${(s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', '')}`)
      .setURL(`https://osu.ppy.sh/scores/osu/${s.id}`)
      .setDescription(`Score set by ${s.user.username}\n${s.pp}pp`)
      .setThumbnail(s.beatmapset.covers['list@2x'])
      .setFooter({ text: `${s.created_at}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
