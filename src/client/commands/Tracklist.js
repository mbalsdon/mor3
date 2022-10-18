import * as fs from 'fs'

export default async function tracklistCmd (facade, interaction) {
  console.info('::tracklistCmd()')
  const users = await facade.getUsers()
  let ret = 'userID,username\n'
  for (let i = 0; i < users.length; i++) {
    ret = ret.concat(`${users[i][0]},${users[i][1]}\n`) // TODO: magic num
  }
  fs.writeFileSync('./tracklist.txt', ret)
  await interaction.reply({ files: ['./tracklist.txt'] })
  fs.unlinkSync('./tracklist.txt')
}
