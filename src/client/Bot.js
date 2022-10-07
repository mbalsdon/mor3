import 'dotenv/config'
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js'
import MorFacade from '../controller/MorFacade.js'
import * as fs from 'fs'
import Mods from '../controller/Mods.js'

const primaryColor = 0xFF05E6
export default class Bot {
  #facade
  #client

  constructor (morFacade, botClient) {
    if (typeof morFacade === 'undefined' || typeof botClient === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#facade = morFacade
    this.#client = botClient
  }

  static async build () {
    console.info('Bot::build()')
    const morFacade = await MorFacade.build()
    const botClient = new Client({ intents: [GatewayIntentBits.Guilds] })
    return new Bot(morFacade, botClient)
  }

  async start () {
    console.info('Bot::start()')

    this.#client.once('ready', () => {
      console.log('MOR3 is online!')
    })

    this.#client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return

      const { commandName } = interaction

      if (commandName === 'help') { // TODO
        console.info('Bot >> help{}')
        await interaction.reply('Not implemented yet...')
      } else if (commandName === 'ping') {
        console.info('Bot >> ping{}')
        await interaction.reply('pong!')
      } else if (commandName === 'metadata') {
        console.info('Bot >> metadata{}')
        const metadata = await this.#facade.getMetadata()
        let ret = '```'
        ret = ret.concat(`Sheet title: ${metadata.properties.title} | Locale: ${metadata.properties.locale} | Time zone: ${metadata.properties.timeZone}\n\n`)
        for (const sheet of metadata.sheets.slice(1)) {
          ret = ret.concat(`${sheet.properties.title}: ${sheet.properties.gridProperties.rowCount - 1} ${sheet.properties.gridProperties.rowCount - 1 === 1 ? 'entry' : 'entries'}\n`)
        }
        ret = ret.concat('```')
        await interaction.reply(ret)
      } else if (commandName === 'users') {
        const page = interaction.options.getNumber('page')
        console.info(`Bot >> users{ page=${page} }`)
        const perPage = 8
        const users = await this.#facade.getUsers()
        const numPages = Math.ceil(users.length / perPage)
        if (page < 1 || page > numPages) {
          await interaction.reply({ content: `Page must be between 1 and ${numPages}`, ephemeral: true })
        } else {
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
          let lim = 0
          if (page === numPages && users.length % perPage !== 0) {
            lim = users.length % perPage
          } else {
            lim = perPage
          }
          for (let i = 0; i < lim; i++) {
            const pageIndex = perPage * (page - 1) + i
            const userId = users[pageIndex][0]
            const username = users[pageIndex][1]
            const rank = users[pageIndex][2]
            const pp = users[pageIndex][3]
            embed.addFields([
              { name: `${pageIndex + 1}) ${username}`, value: `${userId}`, inline: true },
              { name: `Global #${rank}`, value: `${pp}pp`, inline: true },
              { name: '\u200b', value: '\u200b', inline: true }
            ])
          }
          await interaction.reply({ embeds: [embed] })
        }
      } else if (commandName === 'track') {
        const id = interaction.options.getString('id')
        console.info(`Bot >> track{ id=${id} }`)
        try {
          const user = await this.#facade.putUser(id)
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(`Now tracking: ${user.username}`)
            .setURL(`https://osu.ppy.sh/users/${user.id}`)
            .setDescription(`Rank #${user.statistics.global_rank} (${user.statistics.pp}pp)`)
            .setThumbnail(user.avatar_url)
            .setFooter({ text: `Remember to >track add "${user.username}" and <track "${user.username}" !` })
          await interaction.reply({ embeds: [embed] })
        } catch (error) {
          await interaction.reply({ content: error.message, ephemeral: true })
        }
      } else if (commandName === 'untrack') {
        const id = interaction.options.getString('id')
        console.info(`Bot >> track{ id=${id} }`)
        try {
          const user = await this.#facade.deleteUser(id)
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(`No longer tracking: ${user.username}`)
            .setURL(`https://osu.ppy.sh/users/${user.id}`)
            .setDescription(`Rank #${user.statistics.global_rank} (${user.statistics.pp}pp)`)
            .setThumbnail(user.avatar_url)
            .setFooter({ text: `Remember to >track remove "${user.username}" and <untrack "${user.username}" !` })
          await interaction.reply({ embeds: [embed] })
        } catch (error) {
          await interaction.reply({ content: error.message, ephemeral: true })
        }
      } else if (commandName === 'tracklist') {
        console.info('Bot >> tracklist{}')
        const users = await this.#facade.getUsers()
        let ret = ''
        for (let i = 0; i < users.length; i++) {
          ret = ret.concat(`${users[i][0]}, ${users[i][1]}\n`)
        }
        fs.writeFileSync('./tracklist.txt', ret)
        await interaction.reply({ files: ['./tracklist.txt'] })
        fs.unlinkSync('./tracklist.txt')
      } else if (commandName === 'submit') {
        const id = interaction.options.getString('id')
        console.info(`Bot >> submit{ id=${id} }`)
        try {
          const s = await this.#facade.putSubmittedScore(id)
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(`${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}] +${(s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', '')}`)
            .setURL(`https://osu.ppy.sh/scores/osu/${s.id}`)
            .setDescription(`Score set by ${s.user.username}\n${s.pp}pp`)
            .setThumbnail(s.beatmapset.covers['list@2x'])
            .setFooter({ text: `${s.created_at}` })
          await interaction.reply({ embeds: [embed] })
        } catch (error) {
          await interaction.reply({ content: error.message, ephemeral: true })
        }
      } else if (commandName === 'unsubmit') {
        const id = interaction.options.getString('id')
        console.info(`Bot >> unsubmit{ id=${id} }`)
        try {
          const s = await this.#facade.deleteSubmittedScore(id)
          // TODO: URL & thumbnail
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(`${s[2]} +${s[3]}`)
            .setDescription(`Score set by ${s[1]}\n${s[5]}pp`)
            .setFooter({ text: `${s[6]}` })
          await interaction.reply({ embeds: [embed] })
        } catch (error) {
          await interaction.reply({ content: error.message, ephemeral: true })
        }
      } else if (commandName === 'scores') { // TODO
        const mods = interaction.options.getString('mods').toUpperCase()
        const page = interaction.options.getNumber('page')
        console.info(`Bot >> scores{ mods=${mods}, page=${page} }`)
        if (Mods.toSheetId(mods) === -1) {
          await interaction.reply({ content: `${mods} is not a valid mod combination`, ephemeral: true })
        } else {
          const perPage = 8
          const scores = await this.#facade.getModScores(mods)
          const numPages = Math.ceil(scores.length / perPage)
          if (Mods.toSheetId(mods) === -1) {
            await interaction.reply({ content: `${mods} is not a valid mod combination`, ephemeral: true })
          } else if (page < 1 || page > numPages) {
            await interaction.reply({ content: `Page must be between 1 and ${numPages}`, ephemeral: true })
          } else {
            const embed = new EmbedBuilder()
              .setColor(primaryColor)
            let lim = 0
            if (page === numPages && scores.length % perPage !== 0) {
              lim = scores.length % perPage
            } else {
              lim = perPage
            }
            for (let i = 0; i < lim; i++) {
              const pageIndex = perPage * (page - 1) + i
              const scoreId = scores[pageIndex][0]
              const username = scores[pageIndex][1]
              const beatmap = scores[pageIndex][2]
              const accuracy = scores[pageIndex][4]
              const pp = scores[pageIndex][5]
              const date = scores[pageIndex][6]
              embed.addFields([
                { name: `${pageIndex + 1} ${username}`, value: `${scoreId}`, inline: true },
                { name: `${beatmap}`, value: `\u200b`, inline: true },
                { name: `${accuracy}% | ${pp ? pp : '?'}pp`, value: `${date}`, inline: true }
              ])
            }
            await interaction.reply({ embeds: [embed] })
          }
        }
      } else if (commandName === 'user') { // TODO
        const id = interaction.options.getString('id')
        console.info(`Bot >> user{ id=${id} }`)
        await interaction.reply('Not implemented yet...')
      } else if (commandName === 'zeklewa') {
        const embed = new EmbedBuilder()
          .setColor(primaryColor)
          .setThumbnail('https://static.wikia.nocookie.net/supermarioglitchy4/images/f/f3/Big_chungus.png/')
          .setFooter({ text: 'bitch u thought 🤣😂' })
        await interaction.reply({ embeds: [embed] })
      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
