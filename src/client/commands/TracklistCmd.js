import MorUtils from '../../controller/utils/MorUtils.js'

import * as fs from 'fs'

/**
 * Replies with a .txt file of MOR users
 * @param {MorFacade} facade
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function tracklistCmd (facade, interaction) {
  console.info('Bot::tracklistCmd ()') // TODO: replace

  try {
    const users = await facade.getSheetUsers()

    let ret = 'userID,username\n'
    for (const user of users) {
      ret = ret + `${user.userId},${user.username}\n`
    }

    fs.writeFileSync('./tracklist.txt', ret)
    await interaction.editReply({ files: ['./tracklist.txt'] })
    fs.unlinkSync('./tracklist.txt')
  } catch (error) {
    await interaction.editReply({
      content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
    })

    throw error
  }
}
