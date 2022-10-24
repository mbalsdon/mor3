import * as fs from 'fs'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function usersCmd (facade, client, interaction) {
  console.info('::usersCmd()')

  try {
    let currentPage = 1
    const perPage = 5
    const users = await facade.getUsers()
    const numPages = Math.ceil(users.length / perPage)

    if (numPages === 0) {
      await interaction.reply({ content: '```No users to display - The sheet is empty!\nDM spreadnuts#1566 on Discord if you believe that this is a bug.```', ephemeral: true })
      return
    }

    const lastUpdated = await facade.getLastUpdated()

    // Modularized due to the fact that using buttons requires the interaction to be updated with new data
    const buildEmbed = function (page) {
      console.info(`::usersCmd >> buildEmbed( ${page} )`)

      if (page < 1 || page > numPages) {
        throw new Error(`Page must be between 1 and ${numPages} - this should never happen!`)
      }

      // Avoid OOB errors (may have to display less than 'perPage' users if you're on the last page)
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
      const pfpLink = users[perPage * (page - 1)][12]

      // Create the embed object
      const embed = new EmbedBuilder()
        .setColor(config.BOT_EMBED_COLOR)
        .setThumbnail(`${pfpLink}`)
        .setDescription(desc)
        .setFooter({ text: `Last update: ${lastUpdated}` })

      return embed
    }

    let embed = buildEmbed(currentPage)
    // Using date as a hash to give every button a unique ID
    // If /users is called twice without a hash, the two button listeners would both respond to either buttonpress due to non-unique IDs
    const hash = new Date(Date.now()).toISOString()
    const buttons = new ActionRowBuilder()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(`Users_start_${hash}`)
          .setLabel('◀◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`Users_prev_${hash}`)
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`Users_next_${hash}`)
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1),
        new ButtonBuilder()
          .setCustomId(`Users_last_${hash}`)
          .setLabel('▶▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1)
      ])

    const pageButtons = async function (interaction) {
      if (!interaction.isButton()) return
      const buttonId = interaction.customId
      console.log(`::usersCmd >> button "${buttonId}" was pressed!`)
      if (buttonId === `Users_start_${hash}`) {
        currentPage = 1
        buttons.components[0].setDisabled(true)
        buttons.components[1].setDisabled(true)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Users_prev_${hash}`) {
        currentPage = currentPage - 1
        buttons.components[0].setDisabled(currentPage === 1)
        buttons.components[1].setDisabled(currentPage === 1)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Users_next_${hash}`) {
        currentPage = currentPage + 1
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(currentPage === numPages)
        buttons.components[3].setDisabled(currentPage === numPages)
      } else if (buttonId === `Users_last_${hash}`) {
        currentPage = numPages
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(true)
        buttons.components[3].setDisabled(true)
      } else {
        return
      }
      embed = buildEmbed(currentPage)
      await interaction.update({ embeds: [embed], components: [buttons] })
    }

    // Listen for buttonpresses for 20 seconds
    console.info('::usersCmd >> listening for button presses...')
    client.on('interactionCreate', pageButtons)
    setTimeout(function () {
      console.info('::usersCmd >> no longer listening for button presses')
      client.off('interactionCreate', pageButtons)
    }, 20000)

    await interaction.reply({ embeds: [embed], components: [buttons] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
