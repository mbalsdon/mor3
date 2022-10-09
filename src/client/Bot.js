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
        const embed = new EmbedBuilder()
          .setColor(primaryColor)
          .setAuthor({ name: 'mor3 commands', iconURL: 'https://spreadnuts.s-ul.eu/MdfvA3q5', url: 'https://github.com/mbalsdon/mor3'})
          .setDescription('`help` - Documentation on the bot\'s commands\n' +
            '`ping` - Checks if the bot is alive\n' +
            '`metadata` - Displays mor3 sheet metadata\n' + 
            '`users` - Displays list of tracked users, sorted by PP\n' +
            '`track` - Adds a user to be tracked\n' +
            '`untrack` - Removes a user from being tracked\n' +
            '`tracklist` - Lists all tracked users in a .txt file\n' +
            '`submit` - Manually submits a score to the database\n' +
            '`unsubmit` - Removes a submitted score from the database\n' +
            '`scores` - Displays list of scores for a given mod combo, sorted by PP\n' +
            '`user` - Displays a user\'s stats (WIP)')
          .setFooter({ text: 'https://github.com/mbalsdon/mor3'})
        await interaction.reply({ embeds: [embed] })
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
        let page = interaction.options.getNumber('page')
        console.info(`Bot >> users{ page=${page} }`)
        if (page === null) {
          page = 1
        }
        const perPage = 5
        const users = await this.#facade.getUsers()
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
            const user_str = `**${pageIndex + 1}. [${username}](https://osu.ppy.sh/users/${userId}) (Global #${rank} | ${pp}pp | ${acc}% | ${playtime} hours)**\n` +
            `▸ :first_place: Mod leaderboard #1s: ${top1s}\n` +
            `▸ :second_place: Mod leaderboard #2s: ${top2s}\n` +
            `▸ :third_place: Mod leaderboard #3s: ${top3s}\n`
            desc = desc + user_str
          }
          const pfpLink = users[perPage * (page - 1)][9]
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setThumbnail(`${pfpLink}`)
            .setDescription(desc)
            .setFooter({ text: `Last update: ${'TODO'}`})
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
          // TODO: thumbnail
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(`${s[2]} +${s[3]}`)
            .setURL(`https://osu.ppy.sh/scores/osu/${s[0]}`)
            .setDescription(`Score set by ${s[1]}\n${s[5]}pp`)
            .setFooter({ text: `${s[6]}` })
          await interaction.reply({ embeds: [embed] })
        } catch (error) {
          await interaction.reply({ content: error.message, ephemeral: true })
        }
      } else if (commandName === 'scores') {
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
      // } else if (commandName === 'zeklewa') {
      //   const embed = new EmbedBuilder()
      //     .setColor(primaryColor)
      //     .setThumbnail('https://static.wikia.nocookie.net/supermarioglitchy4/images/f/f3/Big_chungus.png/')
      //     .setFooter({ text: 'bitch u thought 🤣😂' })
      //   await interaction.reply({ embeds: [embed] })
      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
