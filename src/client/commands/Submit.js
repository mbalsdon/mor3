import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function submitCmd (facade, interaction) {
  const id = interaction.options.getString('id')
  console.info(`::submitCmd( ${id} )`)

  const lastUpdated = await facade.getLastUpdated()
  
  try {
    const s = await facade.putSubmittedScore(id)
    console.log(s)
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setAuthor({ name: 'Successfully added score:' })
      .setThumbnail(`${s[9]}`)
      .setDescription(`**[${s[3]}](https://osu.ppy.sh/scores/osu/${s[0]}) +${s[4]}** [${s[7]}★]\n` +
              `▸ **${s[6]}pp** ▸ ${s[5]}%\n` + 
              `▸ Set by [${s[2]}](https://osu.ppy.sh/users/${s[0]}) on ${s[8]}\n`)
      .setFooter({ text: `Last update: ${lastUpdated}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
