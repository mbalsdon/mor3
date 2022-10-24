import UserRow from "../../controller/User.js"

export default async function pingCmd (interaction) {
  console.info('::pingCmd()')
  try {
    const myUser = new UserRow(2, 'peppy', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'https://google.com')
    console.log(myUser.toArray())
    await interaction.reply('pong!')
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
