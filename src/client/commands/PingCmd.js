export default async function pingCmd (interaction) {
  console.info('Bot::pingCmd ()') // TODO: replace
  try {
    await interaction.reply('pong!')
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
