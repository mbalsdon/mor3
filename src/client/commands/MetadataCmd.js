import MorConfig from '../../controller/MorConfig.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder } from '@discordjs/builders'

/**
 * Replies with MOR sheet metadata
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function metadataCmd (facade, interaction) {
  console.info('Bot::metadataCmd ()') // TODO: replace

  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const metadata = await facade.getSheetMetadata()

    let ret = ''
    for (const sheet of metadata.sheets.slice(1)) {
      const rowCount = sheet.properties.gridProperties.rowCount - 1
      ret = ret + `**${sheet.properties.title}:** ${rowCount === 1 ? '0 or 1' : rowCount} ${rowCount === 1 ? 'entry' : 'entries'}\n`
    }

    const embed = new EmbedBuilder()
      .setColor(MorConfig.BOT_EMBED_COLOR)
      .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} Metadata`, iconURL: MorConfig.SERVER_ICON_URL, url: 'https://docs.google.com/spreadsheets/d/1hduRLLIFjVwLGjXyt7ph3301xfXS6qjSnYCm18YP4iA/edit#gid=0' })
      .setDescription(ret)
      .setFooter({ text: `Last update: ${MorUtils.prettifyDate(lastUpdated)}` })

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    await interaction.editReply({
      content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
    })

    throw error
  }
}
