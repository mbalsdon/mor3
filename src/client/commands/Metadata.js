export default async function metadataCmd (facade, interaction) {
  console.info('::metadataCmd()')
  const metadata = await facade.getMetadata()
  let ret = '```'
  for (const sheet of metadata.sheets.slice(1)) {
    ret = ret.concat(`${sheet.properties.title}: ${sheet.properties.gridProperties.rowCount - 1} ${sheet.properties.gridProperties.rowCount - 1 === 1 ? 'entry' : 'entries'}\n`)
  }
  ret = ret.concat('```')
  await interaction.reply(ret)
}
