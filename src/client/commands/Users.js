import * as fs from 'fs'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function usersCmd (facade, client, interaction) {
  console.info('::usersCmd()')

  let currentPage = 1
  const perPage = 5
  const users = await facade.getUsers()
  const numPages = Math.ceil(users.length / perPage)
  const lastUpdated = await facade.getLastUpdated()

  // Modularized due to the fact that using buttons requires the interaction to be updated with new data
  const buildEmbed = function (page) {
    console.info(`::userCmd >> buildEmbed(${page})`)

    if (page < 1 || page > numPages) {
      throw new Error(`Page must be between 1 and ${numPages} - this should never happen!`)
    }

    // Avoid OOB errors (may have to display less than 'perpage' users if you're on the last page)
    const lim = (page === numPages && users.length % perPage !== 0) ? users.length % perPage : perPage

    // Build and concatenate player strings
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

    // Create the embed object
    const embed = new EmbedBuilder()
      .setColor(config.primaryColor)
      .setThumbnail(`${pfpLink}`)
      .setDescription(desc)
      .setFooter({ text: `Last update: ${lastUpdated}` })

    return embed
  }

  let embed = await buildEmbed(currentPage)
  const buttons = new ActionRowBuilder()
    .addComponents([
      new ButtonBuilder()
        .setCustomId('start')
        .setLabel('◀◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId('last')
        .setLabel('▶▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)
    ])

  client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return

    const buttonId = interaction.customId
    if (buttonId === 'start') {
      console.info('Bot >> users >> start')
      currentPage = 1
      embed = buildEmbed(currentPage)
      buttons.components[0].setDisabled(true)
      buttons.components[1].setDisabled(true)
      buttons.components[2].setDisabled(false)
      buttons.components[3].setDisabled(false)
    } else if (buttonId === 'prev') {
      console.info('Bot >> users >> prev')
      currentPage = currentPage - 1
      embed = buildEmbed(currentPage)
      buttons.components[0].setDisabled(currentPage === 1)
      buttons.components[1].setDisabled(currentPage === 1)
      buttons.components[2].setDisabled(false)
      buttons.components[3].setDisabled(false)
    } else if (buttonId === 'next') {
      console.info('Bot >> users >> next')
      currentPage = currentPage + 1
      embed = buildEmbed(currentPage)
      buttons.components[0].setDisabled(false)
      buttons.components[1].setDisabled(false)
      buttons.components[2].setDisabled(currentPage === numPages)
      buttons.components[3].setDisabled(currentPage === numPages)
    } else {
      console.info('Bot >> users >> last')
      currentPage = numPages
      embed = buildEmbed(currentPage)
      buttons.components[0].setDisabled(false)
      buttons.components[1].setDisabled(false)
      buttons.components[2].setDisabled(true)
      buttons.components[3].setDisabled(true)
    }

    interaction.update({ embeds: [embed], components: [buttons] })
  })

  await interaction.reply({ embeds: [embed], components: [buttons] })
}