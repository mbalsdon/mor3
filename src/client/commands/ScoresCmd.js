import Mods from '../../controller/Mods.js'
import MorConfig from '../../controller/MorConfig.js'
import { InvalidModsError, SheetEmptyError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

/**
 * Replies with a list of MOR scores
 * @param {MorFacade} facade
 * @param {Client<boolean>} client
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function scoresCmd (facade, client, interaction) {
  const inputMods = interaction.options.getString('mods').toUpperCase()
  console.info(`Bot::scoresCmd (${inputMods})`) // TODO: replace
  try {
    let currentPage = 1
    const perPage = 5
    const [lastUpdated, scores] = await Promise.all([facade.getSheetLastUpdated(), facade.getSheetScores(inputMods)])
    const numPages = Math.ceil(scores.length / perPage)
    if (numPages === 0) throw new SheetEmptyError(`The ${MorConfig.SHEETS[inputMods].NAME} sheet is empty!`)

    /**
     * Builds a scores embed for the given page
     * @param {number} page
     * @return {EmbedBuilder}
     */
    const buildEmbed = function (page) {
      console.info(`Bot::scoresCmd >> buildEmbed (${page})`)
      if (page < 1 || page > numPages) throw new RangeError(`Page must be between 1 and ${numPages} - this should never happen!`)
      // Avoid OOB errors (may have to display less than 'perPage' users if you're on the last page)
      const lim = (page === numPages && scores.length % perPage !== 0) ? scores.length % perPage : perPage
      // Build and concatenate score strings
      let desc = ''
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const s = scores[pageIndex]
        const medalEmoji = MorUtils.medalEmoji(pageIndex)
        const scoreStr = `**${pageIndex + 1}. [${s.beatmap}](https://osu.ppy.sh/scores/osu/${s.scoreId}) +${s.mods}** [${s.starRating}★]\n` +
              `▸ ${medalEmoji} ▸ **${s.pp}pp** ▸ ${s.accuracy}%\n` +
              `▸ Set by [${s.username}](https://osu.ppy.sh/users/${s.userId}) on ${s.date}\n`
        desc = desc + scoreStr
      }
      const beatmapImgLink = scores[perPage * (page - 1)].beatmapImgLink
      const embed = new EmbedBuilder()
        .setColor(MorConfig.BOT_EMBED_COLOR)
        .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} ${inputMods} Score Leaderboard`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://docs.google.com/spreadsheets/d/${MorConfig.SHEETS.SPREADSHEET.ID}/edit#gid=${MorConfig.SHEETS[inputMods].ID}` })
        .setThumbnail(`${beatmapImgLink}`)
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
          .setCustomId(`${inputMods}_start_${hash}`)
          .setLabel('◀◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`${inputMods}_prev_${hash}`)
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`${inputMods}_next_${hash}`)
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1),
        new ButtonBuilder()
          .setCustomId(`${inputMods}_last_${hash}`)
          .setLabel('▶▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(numPages === 1)
      ])

    /**
     * Updates buttons for the scores embed
     * @param {ChatInputCommandInteraction<CacheType>} interaction
     * @return {Promise<void>}
     */
    const pageButtons = async function (interaction) {
      if (!interaction.isButton()) return
      const buttonId = interaction.customId
      console.info(`Bot::scoresCmd >> button "${buttonId}" was pressed!`)
      if (buttonId === `${inputMods}_start_${hash}`) {
        currentPage = 1
        buttons.components[0].setDisabled(true)
        buttons.components[1].setDisabled(true)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `${inputMods}_prev_${hash}`) {
        currentPage--
        buttons.components[0].setDisabled(currentPage === 1)
        buttons.components[1].setDisabled(currentPage === 1)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `${inputMods}_next_${hash}`) {
        currentPage++
        buttons.components[0].setDisabled(false)
        buttons.components[1].setDisabled(false)
        buttons.components[2].setDisabled(currentPage === numPages)
        buttons.components[3].setDisabled(currentPage === numPages)
      } else if (buttonId === `${inputMods}_last_${hash}`) {
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
    console.info('Bot::scoresCmd >> listening for button presses...')
    client.on('interactionCreate', pageButtons)
    setTimeout(function () {
      console.info('Bot::scoresCmd >> no longer listening for button presses')
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
    } else if (error instanceof SheetEmptyError) {
      await interaction.editReply({
        content: `\`\`\`The "${inputMods}" sheet is empty!\n\n` +
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
