export default async function pingCmd (interaction) {
  console.info('::pingCmd()')
  try {
    await interaction.reply('pong!')
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
