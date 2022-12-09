import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import { InvalidModsError, NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

/**
 * Replies with the top plays of tracked users for given beatmap
 * @param {MorFacade} facade
 * @param {Client<boolean>} client
 * @param {ChatInputApplicationInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function leaderboardCmd (facade, client, interaction) {
  const beatmapId = interaction.options.getString('id')
  const inputMods = interaction.options.getString('mods') === null ? Mods.COMBINED : interaction.options.getString('mods').toUpperCase()
  const sortFlag = interaction.options.getString('sort') === null ? 'pp' : interaction.options.getString('sort')
  logger.info(`Executing leaderboardCmd... id=${beatmapId}, mods=${inputMods}, sort=${sortFlag}`)

  try {
    let currentPage = 1
    const perPage = 5

    const [scores, beatmap] = await Promise.all([facade.getSheetScores(inputMods), facade.getOsuBeatmap(beatmapId)])
    const beatmapString = `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`
    const lastUpdated = await facade.getSheetLastUpdated()
    const filteredScores = scores.filter(s => beatmapString === s.beatmap)

    if (sortFlag === 'pp') filteredScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
    else if (sortFlag === 'accuracy') filteredScores.sort((a, b) => { return parseFloat(b.accuracy) - parseFloat(a.accuracy) })
    else if (sortFlag === 'date_set') filteredScores.sort((a, b) => { return Date.parse(b.date) - Date.parse(a.date) })

    const numPages = Math.ceil(filteredScores.length / perPage)
    if (numPages === 0) throw new NotFoundError(`No scores found for beatmap with ID ${beatmapId}!`)

    /**
     * Builds a scores embed for the given page
     * @param {number} page
     * @return {EmbedBuilder}
     */
    const buildEmbed = function (page) {
      if (page < 1 || page > numPages) throw new RangeError(`Page must be between 1 and ${numPages} - this should never happen!`)

      // Avoid OOB errors (may have to display less than 'perPage' scores if you're on the last page)
      const lim = (page === numPages && filteredScores.length % perPage !== 0) ? filteredScores.length % perPage : perPage

      // Build and concatenate score strings
      let desc = `\`MODS: ${inputMods}\`\n`
      desc = desc + `\`SORT BY: ${sortFlag}\`\n\n`
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const s = filteredScores[pageIndex]
        const medalEmoji = MorUtils.medalEmoji(pageIndex)
        const scoreStr = `**${pageIndex + 1}. [${s.beatmap}](https://osu.ppy.sh/scores/osu/${s.scoreId}) +${s.mods}** [${s.starRating}★]\n` +
              `▸ ${medalEmoji} ▸ **${s.pp}pp** ▸ ${s.accuracy}%\n` +
              `▸ Set by [${s.username}](https://osu.ppy.sh/users/${s.userId}) on ${MorUtils.prettifyDate(s.date)}\n`
        desc = desc + scoreStr
      }
      const beatmapImgLink = filteredScores[perPage * (page - 1)].beatmapImgLink

      const embed = new EmbedBuilder()
        .setColor(MorConfig.BOT_EMBED_COLOR)
        .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} Score Leaderboard for ${beatmapString}`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://docs.google.com/spreadsheets/d/${MorConfig.SHEETS.SPREADSHEET.ID}/edit#gid=${MorConfig.SHEETS[inputMods].ID}` })
        .setThumbnail(`${beatmapImgLink}`)
        .setDescription(desc)
        .setFooter({ text: `Last update: ${MorUtils.prettifyDate(lastUpdated)}` })

      return embed
    }

    let embed = buildEmbed(currentPage)

    // Using date as a hash to give every button a unique ID
    const hash = new Date(Date.now()).toISOString()
    const buttons = new ActionRowBuilder()
      .addComponents([
        new ButtonBuilder()
          .setCustomId(`Leaderboard_${inputMods}_start_${hash}`)
          .setLabel('◀◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`Leaderboard_${inputMods}_prev_${hash}`)
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`Leaderboard_${inputMods}_next_${hash}`)
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1),
        new ButtonBuilder()
          .setCustomId(`Leaderboard_${inputMods}_last_${hash}`)
          .setLabel('▶▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1)
      ])

    /** Updates buttons for the leaderboard embed
     * @param {ChatInputCommandInteraction<CacheType>} interaction
     * @return {Promise<void>}
    */
    const pageButtons = async function (interaction) {
      if (!interaction.isButton()) return

      const buttonId = interaction.customId
      logger.info(`Button "${buttonId}" was pressed!`)

      if (buttonId === `Leaderboard_${inputMods}_start_${hash}`) {
        currentPage = 1
        buttons.components[0].setDisabled(true)
        buttons.components[1].setDisabled(true)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Leaderboard_${inputMods}_prev_${hash}`) {
        currentPage--
        buttons.components[0].setDisabled(currentPage === 1)
        buttons.components[1].setDisabled(currentPage === 1)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Leaderboard_${inputMods}_next_${hash}`) {
        currentPage++
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(currentPage === numPages)
        buttons.components[3].setDisabled(currentPage === numPages)
      } else if (buttonId === `Leaderboard_${inputMods}_last_${hash}`) {
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

    // Listen for buttonpresses for 60 seconds
    logger.info('Listening for button presses...')
    client.on('interactionCreate', pageButtons)
    setTimeout(function () {
      logger.info('No longer listening for button presses!')
      client.off('interactionCreate', pageButtons)
      interaction.editReply({ embeds: [embed], components: [] })
    }, 60000)

    await interaction.editReply({ embeds: [embed], components: [buttons] })
  } catch (error) {
    if (error instanceof InvalidModsError) {
      await interaction.editReply({
        content: `\`\`\`"${inputMods}" is not a valid mod combo!\n` +
                                         `Valid mod combos: ${Mods.validModStrings().join(' ')}\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })
    } else if (error instanceof NotFoundError && error.message.includes('beatmapId')) {
      await interaction.editReply({
        content: `\`\`\`Could not find beatmap with ID "${beatmapId}"!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })
    } else if (error instanceof NotFoundError && error.message.includes(`No scores found for beatmap with ID ${beatmapId}!`)) {
      await interaction.editReply({
        content: `\`\`\`No scores set by tracked users could be found for beatmap with ID "${beatmapId}" with mods "${inputMods}"!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })
    } else {
      await interaction.editReply({
        content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``
      })

      throw error
    }
  }
}
