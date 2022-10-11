import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function unsubmitCmd (facade, interaction) {
  const id = interaction.options.getString('id')
  console.info(`::unsubmitCmd( ${id} )`)
  try {
    const s = await facade.deleteSubmittedScore(id)
    // TODO: thumbnail
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setTitle(`${s[2]} +${s[3]}`)
      .setURL(`https://osu.ppy.sh/scores/osu/${s[0]}`)
      .setDescription(`Score set by ${s[1]}\n${s[5]}pp`)
      .setFooter({ text: `${s[6]}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
