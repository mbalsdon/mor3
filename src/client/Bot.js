import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'
import MorFacade from '../controller/MorFacade.js'
import usersCmd from './commands/Users.js'
import helpCmd from './commands/Help.js'
import pingCmd from './commands/Ping.js'
import metadataCmd from './commands/Metadata.js'
import userCmd from './commands/User.js'
import trackCmd from './commands/Track.js'
import untrackCmd from './commands/Untrack.js'
import tracklistCmd from './commands/Tracklist.js'
import submitCmd from './commands/Submit.js'
import unsubmitCmd from './commands/Unsubmit.js'
import scoresCmd from './commands/Scores.js'

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
      console.info(`Bot >> command "${commandName}"`)

      if (commandName === 'help') {
        await helpCmd(interaction)
      } else if (commandName === 'ping') {
        await pingCmd(interaction)
      } else if (commandName === 'metadata') {
        await metadataCmd(this.#facade, interaction)
      } else if (commandName === 'users') {
        await usersCmd(this.#facade, this.#client, interaction)
      } else if (commandName === 'user') {
        await userCmd(this.#facade, interaction)
      } else if (commandName === 'track') {
        await trackCmd(this.#facade, interaction)
      } else if (commandName === 'untrack') {
        await untrackCmd(this.#facade, interaction)
      } else if (commandName === 'tracklist') {
        await tracklistCmd(this.#facade, interaction)
      } else if (commandName === 'submit') {
        await submitCmd(this.#facade, interaction)
      } else if (commandName === 'unsubmit') {
        await unsubmitCmd(this.#facade, interaction)
      } else if (commandName === 'scores') {
        await scoresCmd(this.#facade, this.#client, interaction)
      }
    })

    // Must be the last line of code
    this.#client.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
