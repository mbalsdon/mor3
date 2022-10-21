import * as fs from 'fs'
import { EmbedBuilder } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function untrackCmd (facade, interaction) {
  const username = interaction.options.getString('username')
  console.info(`::untrackCmd( ${username} )`)
  try {
    const user = await facade.deleteUser(username)
    const embed = new EmbedBuilder()
      .setColor(config.BOT_EMBED_COLOR)
      .setAuthor({ name: `MOR3 no longer tracking: ${user[1]}`, iconURL: user[12], url: `https://osu.ppy.sh/users/${user[0]}` })
      .setDescription( // TODO: some dupecode here from scores.js (medalemoji)
        `▸ **:globe_with_meridians: Global Rank:** #${user[2]}\n` +
        `▸ **:farmer: PP:** ${user[3]}pp\n` +
        `▸ **:dart: Profile Accuracy:** ${user[4]}%\n` +
        `▸ **:desktop: Total Playtime:** ${user[5]} hours`
      )
      .setThumbnail(user[12])
      .setFooter({ text: `owobot: >track remove "${user.username}" | Bathbot: <untrack "${user.username}"` })
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
