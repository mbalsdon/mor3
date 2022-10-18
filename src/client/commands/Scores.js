import * as fs from 'fs'
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import Mods from '../../controller/Mods.js'

import 'dotenv/config'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function scoresCmd (facade, client, interaction) {
  const inputMods = interaction.options.getString('mods').toUpperCase()
  console.info(`::scoresCmd( ${inputMods} )`)

  try {
    if (!Mods.modStrings.includes(inputMods)) {
      await interaction.reply({
        content: `\`\`\`${inputMods} is not a valid mod combination!\n\n` +
  'Valid mods:\n' +
  'NM, DT, HR, HD, EZ, HT, FL\n' +
  'HDDT, HRDT, EZDT, DTFL, EZHT, HDHR, HDHT, EZHD, HRHT, EZFL, HRFL, HTFL, HDFL\n' +
  'HDHRDT, HDDTFL, EZHDDT, HRDTFL, EZDTFL, HDHTFL, HDHRHT, HRHTFL, EZHDHT, EZHTFL, EZHDFL, HDHRFL\n' +
  'HDHRDTFL, EZHDDTFL, EZHDHTFL, HDHRHTFL\n\n' +
  'DM spreadnuts#1566 on Discord if you believe that this is a bug.```'
      })
      return
    }

    let currentPage = 1
    const perPage = 5
    const scores = await facade.getModScores(inputMods)
    const numPages = Math.ceil(scores.length / perPage)

    if (numPages === 0) {
      await interaction.reply({ content: `\`\`\`No scores to display - The ${inputMods} sheet is empty!\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
      return
    }

    const lastUpdated = await facade.getLastUpdated()

    // Modularized due to the fact that using buttons requires the interaction to be updated with new data
    const buildEmbed = function (page) {
      console.info(`::scoresCmd >> buildEmbed( ${page} )`)

      if (page < 1 || page > numPages) {
        throw new Error(`Page must be between 1 and ${numPages} - this should never happen!`)
      }

      // Avoid OOB errors (may have to display less than 'perPage' users if you're on the last page)
      const lim = (page === numPages && scores.length % perPage !== 0) ? scores.length % perPage : perPage

      // Build and concatenate score strings
      let desc = ''
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const scoreId = scores[pageIndex][0]
        const userId = scores[pageIndex][1]
        const username = scores[pageIndex][2]
        const beatmap = scores[pageIndex][3]
        const mods = scores[pageIndex][4]
        const accuracy = scores[pageIndex][5]
        const pp = scores[pageIndex][6]
        const stars = scores[pageIndex][7]
        const date = scores[pageIndex][8]
        let medalEmoji = ''
        if (pageIndex === 0) {
          medalEmoji = ':first_place:'
        } else if (pageIndex === 1) {
          medalEmoji = ':second_place:'
        } else if (pageIndex === 2) {
          medalEmoji = ':third_place:'
        } else if (pageIndex <= 4) {
          medalEmoji = ':medal:'
        } else if (pageIndex <= 9) {
          medalEmoji = ':military_medal:'
        } else if (pageIndex <= 24) {
          medalEmoji = ':small_orange_diamond:'
        } else {
          medalEmoji = ':skull:'
        }

        const scoreStr = `**${pageIndex + 1}. [${beatmap}](https://osu.ppy.sh/scores/osu/${scoreId}) +${mods}** [${stars}★]\n` +
              `▸ ${medalEmoji} ▸ **${pp}pp** ▸ ${accuracy}%\n` +
              `▸ Set by [${username}](https://osu.ppy.sh/users/${userId}) on ${date}\n`
        desc = desc + scoreStr
      }
      const beatmapImgLink = scores[perPage * (page - 1)][9]

      // Create the embed object
      const embed = new EmbedBuilder()
        .setColor(config.primaryColor)
        .setAuthor({ name: `+${inputMods} Score Leaderboard`, iconURL: `${beatmapImgLink}`, url: `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}/edit#gid=${Mods.toSheetId(inputMods)}` })
        .setThumbnail(`${beatmapImgLink}`)
        .setDescription(desc)
        .setFooter({ text: `Last update: ${lastUpdated}` })

      return embed
    }

    let embed = await buildEmbed(currentPage)
    const buttons = new ActionRowBuilder()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(`${inputMods} start`)
          .setLabel('◀◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`${inputMods} prev`)
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`${inputMods} next`)
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1),
        new ButtonBuilder()
          .setCustomId(`${inputMods} last`)
          .setLabel('▶▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1)
      ])

    client.on('interactionCreate', interaction => {
      if (!interaction.isButton()) return

      const buttonId = interaction.customId
      if (buttonId === `${inputMods} start`) {
        console.info('::usersCmd >> start')
        currentPage = 1
        embed = buildEmbed(currentPage)
        buttons.components[0].setDisabled(true)
        buttons.components[1].setDisabled(true)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `${inputMods} prev`) {
        console.info('::usersCmd >> prev')
        currentPage = currentPage - 1
        embed = buildEmbed(currentPage)
        buttons.components[0].setDisabled(currentPage === 1)
        buttons.components[1].setDisabled(currentPage === 1)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `${inputMods} next`) {
        console.info('::usersCmd >> next')
        currentPage = currentPage + 1
        embed = buildEmbed(currentPage)
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(currentPage === numPages)
        buttons.components[3].setDisabled(currentPage === numPages)
      } else if (buttonId === `${inputMods} last`) {
        console.info('::usersCmd >> last')
        currentPage = numPages
        embed = buildEmbed(currentPage)
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(true)
        buttons.components[3].setDisabled(true)
      } else {
        return
      }

      interaction.update({ embeds: [embed], components: [buttons] })
    })

    await interaction.reply({ embeds: [embed], components: [buttons] })
  } catch (error) {
    await interaction.reply({ content: `\`\`\`${error.message}\nDM spreadnuts#1566 on Discord if you believe that this is a bug.\`\`\``, ephemeral: true })
  }
}
