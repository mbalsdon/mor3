import 'dotenv/config'
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js'
import MorFacade from '../controller/MorFacade.js'

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

      if (commandName === 'help') {
        console.info('Bot >> help{}')
        await interaction.reply('Not implemented yet...')

      } else if (commandName === 'ping') {
        console.info('Bot >> ping{}')
        await interaction.reply('pong!')

      } else if (commandName === 'echo') {
        const input = interaction.options.getString('input')
        console.info(`Bot >> echo{ input=${input} }`)
        await interaction.reply(input)

      } else if (commandName === 'metadata') { // TODO
        console.info('Bot >> metadata{}')
        // const metadata = await this.#facade.getMetadata()
        await interaction.reply('Not implemented yet...')

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
          if (page === numPages) {
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
        
      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
