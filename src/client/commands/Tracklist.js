import * as fs from 'fs'

export default async function tracklistCmd (facade, interaction) {
  console.info('::tracklistCmd()')
  try {
    const users = await facade.getUsers()
    let ret = 'userID,username\n'
    for (let i = 0; i < users.length; i++) {
      ret = ret.concat(`${users[i][0]},${users[i][1]}\n`) // TODO: magic num
    }
    fs.writeFileSync('./tracklist.txt', ret)
    await interaction.reply({ files: ['./tracklist.txt'] })
    fs.unlinkSync('./tracklist.txt')
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
