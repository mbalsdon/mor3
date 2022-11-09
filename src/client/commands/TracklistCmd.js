import * as fs from 'fs'

export default async function tracklistCmd (facade, interaction) {
  console.info('Bot::tracklistCmd ()') // TODO: replace
  try {
    const users = await facade.getSheetUsers()
    let ret = 'userID,username\n'
    for (const user of users) {
      ret = ret + `${user.userId},${user.username}\n`
    }
    fs.writeFileSync('./tracklist.txt', ret)
    await interaction.reply({ files: ['./tracklist.txt'] })
    fs.unlinkSync('./tracklist.txt')
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.name}: ${error.message}\n\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
