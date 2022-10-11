export default async function pingCmd (interaction) {
  console.info('::pingCmd()')
  await interaction.reply('pong!')
}
