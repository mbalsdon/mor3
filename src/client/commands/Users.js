import * as fs from 'fs'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function usersCmd (facade, client, interaction) {
  let page = interaction.options.getNumber('page')
  console.info(`::usersCmd( page=${page} }`)
  if (page === null) {
    page = 1
  }
  const perPage = 5
  const users = await facade.getUsers()
  const numPages = Math.ceil(users.length / perPage)
  if (page < 1 || page > numPages) {
    await interaction.reply({ content: `Page must be between 1 and ${numPages}`, ephemeral: true })
  } else {
    let lim = 0
    if (page === numPages && users.length % perPage !== 0) {
      lim = users.length % perPage
    } else {
      lim = perPage
    }
    let desc = ''
    for (let i = 0; i < lim; i++) {
      const pageIndex = perPage * (page - 1) + i
      const userId = users[pageIndex][0]
      const username = users[pageIndex][1]
      const rank = users[pageIndex][2] === '' ? '?' : users[pageIndex][2]
      const pp = users[pageIndex][3]
      const acc = parseFloat(users[pageIndex][4]).toFixed(2)
      const playtime = Math.round(users[pageIndex][5])
      const top1s = users[pageIndex][6]
      const top2s = users[pageIndex][7]
      const top3s = users[pageIndex][8]
      const userStr = `**${pageIndex + 1}. [${username}](https://osu.ppy.sh/users/${userId}) (Global #${rank} | ${pp}pp | ${acc}% | ${playtime} hours)**\n` +
            `▸ :first_place: Mod leaderboard #1s: ${top1s}\n` +
            `▸ :second_place: Mod leaderboard #2s: ${top2s}\n` +
            `▸ :third_place: Mod leaderboard #3s: ${top3s}\n`
      desc = desc + userStr
    }
    const pfpLink = users[perPage * (page - 1)][9]
    const lastUpdated = await facade.getLastUpdated()
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setThumbnail(`${pfpLink}`)
      .setDescription(desc)
      .setFooter({ text: `Last update: ${lastUpdated}` })

    const row = new ActionRowBuilder()
      .addComponents([
        new ButtonBuilder()
          .setCustomId('start')
          .setLabel('◀◀')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('▶▶')
          .setStyle(ButtonStyle.Secondary)
      ])
    client.on('interactionCreate', interaction => {
      if (!interaction.isButton()) return
      const buttonId = interaction.customId
      if (buttonId === 'start') {
        console.info('Bot >> users >> start')
        // Set page to 1; grey out start/prev
      } else if (buttonId === 'prev') {
        console.info('Bot >> users >> prev')
        // Set page to previous; grey out start/prev if page===1
      } else if (buttonId === 'next') {
        console.info('Bot >> users >> next')
        // Set page to next; grey out next/last if page===numPages
      } else {
        console.info('Bot >> users >> last')
        // Set page to last; grey out next/last if page===numPages
      }
    })
    await interaction.reply({ embeds: [embed], components: [row] })
  }
}
