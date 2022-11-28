import MorConfig from '../../controller/MorConfig.js'
import { AlreadyExistsError, NotFoundError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder } from 'discord.js'

/**
 * Adds a score to the MOR sheet and replies with the score
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function submitCmd (facade, interaction) {
  const scoreId = interaction.options.getString('id')
  console.info(`Bot::submitCmd (${scoreId})`) // TODO: replace
  try {
    const score = await facade.addSubmittedScore(scoreId)
    const lastUpdated = await facade.getSheetLastUpdated()
    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `Successfully added score to ${MorConfig.SHEETS.SPREADSHEET.NAME}:` })
      .setThumbnail(`${score.beatmapImgLink}`)
      .setDescription(`**[${score.beatmap}](https://osu.ppy.sh/scores/osu/${score.scoreId}) +${score.mods}** [${score.starRating}★]\n` +
              `▸ :farmer: **${score.pp}pp** ▸ ${score.accuracy}%\n` +
              `▸ :calendar_spiral: Set by [${score.username}](https://osu.ppy.sh/users/${score.userId}) on ${score.date}\n`)
      .setFooter({ text: `Last update: ${lastUpdated}` })
    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      await interaction.editReply({
        content: `\`\`\`Score with ID "${scoreId}" has already been added!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else if (error instanceof TypeError) {
      await interaction.editReply({
        content: `\`\`\`Score ID must be a positive number! Your input: "${scoreId}".\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else if (error instanceof NotFoundError && error.message.includes('scoreId')) {
      await interaction.editReply({
        content: `\`\`\`Could not find score with ID "${scoreId}"!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else if (error instanceof NotFoundError && error.message.includes('username')) {
      const username = error.message.slice(error.message.indexOf('=') + 1, error.message.length)
      await interaction.editReply({
        content: `\`\`\`User ${username} could not be found in the ${MorConfig.SHEETS.SPREADSHEET.NAME} sheet! You may only submit scores set by added users.\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else {
      await interaction.editReply({
        content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
      throw error
    }
  }
}
