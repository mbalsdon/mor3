import MorConfig from '../../controller/MorConfig.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Adds a score to the MOR sheet and replies with the score
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @return {Promise<void>}
 */
export default async function submitCmd (facade, interaction) {
  const scoreId = interaction.options.getString('id')
  console.info(`Bot::submitCmd (${scoreId})`) // TODO: replace
  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const score = await facade.addSubmittedScore(scoreId)
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: 'Successfully added score:' })
      .setThumbnail(`${score.beatmapImgLink}`)
      .setDescription(`**[${score.beatmap}](https://osu.ppy.sh/scores/osu/${score.scoreId}) +${score.mods}** [${score.starRating}★]\n` +
              `▸ **${score.pp}pp** ▸ ${score.accuracy}%\n` +
              `▸ Set by [${score.username}](https://osu.ppy.sh/users/${score.userId}) on ${score.date}\n`)
      .setFooter({ text: `Last update: ${lastUpdated}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
