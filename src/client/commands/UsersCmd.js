import MorConfig from '../../controller/MorConfig.js'
import { SheetEmptyError } from '../../controller/MorErrors.js'
import MorUtils from '../../controller/MorUtils.js'

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

/**
 * Replies with a list of MOR users
 * @param {MorFacade} facade
 * @param {Client<boolean>} client
 * @param {ChatInputCommandInteraction<CacheType>} interaction
 * @throws {@link Error} if any unhandled exceptions are caught
 * @return {Promise<void>}
 */
export default async function usersCmd (facade, client, interaction) {
  const sortFlag = interaction.options.getString('sort') === null ? 'pp' : interaction.options.getString('sort')
  console.info(`Bot::usersCmd (${sortFlag})`) // TODO: replace

  try {
    let currentPage = 1
    const perPage = 5

    const lastUpdated = await facade.getSheetLastUpdated()
    const users = await facade.getSheetUsers()

    if (sortFlag === 'accuracy') users.sort((a, b) => { return parseFloat(b.accuracy) - parseFloat(a.accuracy) })
    else if (sortFlag === 'playtime') users.sort((a, b) => { return parseInt(b.playtime) - parseInt(a.playtime) })
    else if (sortFlag === 'top1s') users.sort((a, b) => { return parseInt(b.top1s) - parseInt(a.top1s) })
    else if (sortFlag === 'top2s') users.sort((a, b) => { return parseInt(b.top2s) - parseInt(a.top2s) })
    else if (sortFlag === 'top3s') users.sort((a, b) => { return parseInt(b.top3s) - parseInt(a.top3s) })

    const numPages = Math.ceil(users.length / perPage)
    if (numPages === 0) throw new SheetEmptyError(`The ${MorConfig.SHEETS.USERS.NAME} sheet is empty!`)

    /**
     * Builds a users embed for the given page
     * @param {number} page
     * @return {EmbedBuilder}
     */
    const buildEmbed = function (page) {
      console.info(`Bot::usersCmd >> buildEmbed (${page})`)
      if (page < 1 || page > numPages) throw new RangeError(`Page must be between 1 and ${numPages} - this should never happen!`)

      // Avoid OOB errors (may have to display less than 'perPage' users if you're on the last page)
      const lim = (page === numPages && users.length % perPage !== 0) ? users.length % perPage : perPage

      // Build and concatenate player strings
      let desc = `\`SORT BY: ${sortFlag}\`\n\n`
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const u = users[pageIndex]
        
        const usernameStr = `:flag_${u.countryCode.toLowerCase()}: [${u.username}](https://osu.ppy.sh/users/${u.userId})`
        const globalRankStr = `${(u.globalRank === 'null' ? 'n/a' : `#${u.globalRank}`)}`
        const ppStr = `${Math.round(parseFloat(u.pp)).toString()}pp`
        const accStr = `${u.accuracy}%`
        const playtimeStr = `${u.playtime}hrs`

        const summaryStr = `**${pageIndex + 1}. ${usernameStr} (${globalRankStr} | ${ppStr} | ${accStr} | ${playtimeStr})**\n`
        const top1Str = `▸ :first_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} #1s: ${(u.top1s === '-1' ? 'n/a' : u.top1s)}\n`
        const top2Str = `▸ :second_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} #2s: ${(u.top2s === '-1' ? 'n/a' : u.top2s)}\n`
        const top3Str = `▸ :third_place: ${MorConfig.SHEETS.SPREADSHEET.NAME} #3s: ${(u.top3s === '-1' ? 'n/a' : u.top3s)}\n`

        const userStr =  summaryStr + top1Str + top2Str + top3Str
        desc = desc + userStr
      }
      const pfpLink = users[perPage * (page - 1)].pfpLink

      const embed = new EmbedBuilder()
        .setColor(MorConfig.BOT_EMBED_COLOR)
        .setAuthor({ name: `${MorConfig.SHEETS.SPREADSHEET.NAME} User Leaderboard`, iconURL: MorConfig.SERVER_ICON_URL, url: `https://docs.google.com/spreadsheets/d/${MorConfig.SHEETS.SPREADSHEET.ID}/edit#gid=${MorConfig.SHEETS.USERS.ID}` })
        .setThumbnail(`${pfpLink}`)
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

    /**
     * Updates buttons for the users embed
     * @param {ChatInputCommandInteraction<CacheType>} interaction
     * @return {Promise<void>}
     */
    const pageButtons = async function (interaction) {
      if (!interaction.isButton()) return

      const buttonId = interaction.customId
      console.info(`Bot::usersCmd >> button "${buttonId}" was pressed!`)

      if (buttonId === `Users_start_${hash}`) {
        currentPage = 1
        buttons.components[0].setDisabled(true)
        buttons.components[1].setDisabled(true)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Users_prev_${hash}`) {
        currentPage--
        buttons.components[0].setDisabled(currentPage === 1)
        buttons.components[1].setDisabled(currentPage === 1)
        buttons.components[2].setDisabled(false)
        buttons.components[3].setDisabled(false)
      } else if (buttonId === `Users_next_${hash}`) {
        currentPage++
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

    // Listen for buttonpresses for 60 seconds
    console.info('Bot::usersCmd >> listening for button presses...')
    client.on('interactionCreate', pageButtons)
    setTimeout(function () {
      console.info('Bot::usersCmd >> no longer listening for button presses')
      client.off('interactionCreate', pageButtons)
      interaction.editReply({ embeds: [embed], components: [] })
    }, 60000)

    await interaction.editReply({ embeds: [embed], components: [buttons] })
  } catch (error) {
    if (error instanceof SheetEmptyError) {
      await interaction.editReply({
        content: `\`\`\`The "${MorConfig.SHEETS.USERS.NAME}" sheet is empty!\n\n` +
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
