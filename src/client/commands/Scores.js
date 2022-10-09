import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'
import Mods from '../../controller/Mods.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function scoresCmd (facade, client, interaction) {
  const mods = interaction.options.getString('mods').toUpperCase()
  const page = interaction.options.getNumber('page')
  console.info(`::scoresCmd( ${mods}, ${page} )`)
  if (Mods.toSheetId(mods) === -1) {
    await interaction.reply({ content: `${mods} is not a valid mod combination`, ephemeral: true })
  } else {
    const perPage = 8
    const scores = await facade.getModScores(mods)
    const numPages = Math.ceil(scores.length / perPage)
    if (Mods.toSheetId(mods) === -1) {
      await interaction.reply({ content: `${mods} is not a valid mod combination`, ephemeral: true })
    } else if (page < 1 || page > numPages) {
      await interaction.reply({ content: `Page must be between 1 and ${numPages}`, ephemeral: true })
    } else {
      const embed = new EmbedBuilder()
        .setColor(config.primaryColor)
      let lim = 0
      if (page === numPages && scores.length % perPage !== 0) {
        lim = scores.length % perPage
      } else {
        lim = perPage
      }
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const scoreId = scores[pageIndex][0]
        const username = scores[pageIndex][1]
        const beatmap = scores[pageIndex][2]
        const accuracy = scores[pageIndex][4]
        const pp = scores[pageIndex][5]
        const date = scores[pageIndex][6]
        embed.addFields([
          { name: `${pageIndex + 1} ${username}`, value: `${scoreId}`, inline: true },
          { name: `${beatmap}`, value: '\u200b', inline: true },
          { name: `${accuracy}% | ${pp || '?'}pp`, value: `${date}`, inline: true }
        ])
      }
      await interaction.reply({ embeds: [embed] })
    }
  }
}
