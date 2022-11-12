import Config from '../../controller/Config.js'

import { EmbedBuilder } from '@discordjs/builders'

/**
 * Replies with MOR sheet metadata
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @return {Promise<void>}
 */
export default async function metadataCmd (facade, interaction) {
  console.info('Bot::metadataCmd ()') // TODO: replace
  try {
    const lastUpdated = await facade.getSheetLastUpdated()
    const metadata = await facade.getSheetMetadata()
    let ret = ''
    for (const sheet of metadata.sheets.slice(1)) {
      ret = ret + `**${sheet.properties.title}:** ${sheet.properties.gridProperties.rowCount - 1} ${sheet.properties.gridProperties.rowCount - 1 === 1 ? 'entry' : 'entries'}\n`
    }
    const embed = new EmbedBuilder()
      .setColor(Config.BOT_EMBED_COLOR)
      .setAuthor({ name: `${metadata.properties.title} metadata`, iconURL: 'https://spreadnuts.s-ul.eu/MdfvA3q5', url: 'https://docs.google.com/spreadsheets/d/1hduRLLIFjVwLGjXyt7ph3301xfXS6qjSnYCm18YP4iA/edit#gid=0' })
      .setDescription(ret)
      .setFooter({ text: `Last update: ${lastUpdated}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
