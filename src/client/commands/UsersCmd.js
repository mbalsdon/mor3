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
  console.info('Bot::usersCmd ()') // TODO: replace
  try {
    let currentPage = 1
    const perPage = 5
    const users = await facade.getSheetUsers()
    const numPages = Math.ceil(users.length / perPage)
    if (numPages === 0) throw new SheetEmptyError(`The ${MorConfig.SHEETS.USERS.NAME} sheet is empty!`)
    const lastUpdated = await facade.getSheetLastUpdated()

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
      let desc = ''
      for (let i = 0; i < lim; i++) {
        const pageIndex = perPage * (page - 1) + i
        const u = users[pageIndex]
        const userStr = `**${pageIndex + 1}. [${u.username}](https://osu.ppy.sh/users/${u.userId}) (Global #${u.globalRank} | ${u.pp}pp | ${u.accuracy}% | ${u.playtime} hours)**\n` +
              `▸ :first_place: Mod leaderboard #1s: ${u.top1s}\n` +
              `▸ :second_place: Mod leaderboard #2s: ${u.top2s}\n` +
              `▸ :third_place: Mod leaderboard #3s: ${u.top3s}\n`
        desc = desc + userStr
      }
      const pfpLink = users[perPage * (page - 1)].pfpLink
      const embed = new EmbedBuilder()
        .setColor(MorConfig.BOT_EMBED_COLOR)
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

    // Listen for buttonpresses for 20 seconds
    console.info('Bot::usersCmd >> listening for button presses...')
    client.on('interactionCreate', pageButtons)
    setTimeout(function () {
      console.info('Bot::usersCmd >> no longer listening for button presses')
      client.off('interactionCreate', pageButtons)
    }, 20000)
    await interaction.editReply({ embeds: [embed], components: [buttons] })
  } catch (error) {
    if (error instanceof SheetEmptyError) {
      await interaction.editReply({
        content: `\`\`\`The "${MorConfig.SHEETS.USERS.NAME}" sheet is empty!\n\n` +
                                         `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
    } else {
      await interaction.editReply({
        content: `\`\`\`${error.name}: ${error.message}\n\n` +
                                       `${MorUtils.DISCORD_BOT_ERROR_STR}\`\`\``,
        ephemeral: true
      })
      throw error
    }
  }
}
