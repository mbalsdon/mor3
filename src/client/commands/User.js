import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function userCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`::userCmd( ${username} )`)
  try {
    const lastUpdated = await facade.getLastUpdated()
    const user = await facade.getSheetUser(username)
    // TODO: build user object for compiler typechecking
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setAuthor({ name: `MOR3 profile for ${user[1]}`, iconURL: `${user[12]}`, url: `https://osu.ppy.sh/users/${user[0]}` })
      .setDescription( // TODO: some dupecode here from scores.js (medalemoji)
        `▸ **:globe_with_meridians: Global Rank:** #${user[2]}\n` +
        `▸ **:farmer: PP:** ${user[3]}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user[4]}%\n` +
        `▸ **:desktop: Total Playtime:** ${user[5]} hours\n\n` +

        `▸ **:first_place: Mod leaderboard #1s:** ${user[6]}\n` +
        `▸ **:second_place: Mod leaderboard #2s:** ${user[7]}\n` +
        `▸ **:third_place: Mod leaderboard #3s:** ${user[8]}\n\n` +

        `▸ **:medal: Mod leaderboard Top 5s:** ${user[9]}\n` +
        `▸ **:military_medal: Mod leaderboard Top 10s:** ${user[10]}\n` +
        `▸ **:small_orange_diamond: Mod leaderboard Top 25s:** ${user[11]}\n`
      )
      .setThumbnail(user[12])
      // .addFields(
      //   { name: '1', value: '1', inline: true},
      //   { name: '2', value: '2', inline: true},
      //   { name: '3', value: '3', inline: true}
      // )
      .setFooter({ text: `Last update: ${lastUpdated}` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true })
  }
}
