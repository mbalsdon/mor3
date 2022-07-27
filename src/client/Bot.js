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

      if (commandName === 'ping') {
        await interaction.reply('pong!')

      } else if (commandName === 'echo') {
        const input = interaction.options.getString('input')
        await interaction.reply(input)

      } else if (commandName === 'metadata') {
        const metadata = await this.#facade.getMetadata()
        await interaction.reply('Not implemented yet...')

      } else if (commandName === 'users') {
        const users = await this.#facade.getUsers()
        const page = interaction.options.getNumber('page')
        const numPages = Math.ceil(users.length / 10)
        if (page > numPages) {
          await interaction.reply({ content: `There are only ${numPages} pages!`, ephemeral: true})
        }
        const embedList = []
        for (let i = 0; i < 10; i++) {
          const pageIndex = 10 * page + i
          const username = users[pageIndex][1]
          const rank = users[pageIndex][2]
          const pp = users[pageIndex][3]
          const url = `https://osu.ppy.sh/users/${users[pageIndex][0]}`
          const embed = new EmbedBuilder()
            .setColor(primaryColor)
            .setTitle(username)
            .setURL(url)
            .setDescription(`${pp}pp (#${rank})`)
          embedList.push(embed)
        }
        await interaction.reply({ embeds: embedList })

      } else if (commandName === 'track') {
        // const userId = interaction.options.getString('id')
        // const response = await this.#facade.putUser(userId)
        await interaction.reply('Not implemented yet...')

      } else if (commandName === 'untrack') {
        // const userId = interaction.options.getString('id')
        // const response = await this.#facade.deleteUser(userId)
        await interaction.reply('Not implemented yet...')

      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
