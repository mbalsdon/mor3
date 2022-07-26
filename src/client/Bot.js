import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'
import MorFacade from '../controller/MorFacade.js'

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
        await interaction.reply(JSON.stringify(metadata))
      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
