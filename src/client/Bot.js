import helpCmd from './commands/HelpCmd.js'
import metadataCmd from './commands/MetadataCmd.js'
import pingCmd from './commands/PingCmd.js'
import usersCmd from './commands/UsersCmd.js'
import userCmd from './commands/UserCmd.js'
import scoresCmd from './commands/ScoresCmd.js'
import tracklistCmd from './commands/TracklistCmd.js'
import trackCmd from './commands/TrackCmd.js'
import untrackCmd from './commands/UntrackCmd.js'
import submitCmd from './commands/SubmitCmd.js'
import unsubmitCmd from './commands/UnsubmitCmd.js'

import { ConstructorError } from '../controller/MorErrors.js'
import MorFacade from '../controller/MorFacade.js'

import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'

/**
 * MOR Discord Bot client - To run the bot, build it and then call start.
 * @example
 *  const bot = await Bot.build()
 *  await bot.start()
 */
export default class Bot {
  #FACADE
  #DISCORD

  /**
   * Constructs the bot client.
   * Not meant to be called directly - use Bot.build() instead!
   * @see {@link build}
   * @param {MorFacade} morFacade
   * @param {Client} botClient
   * @throws {@link ConstructorError} if clients dont exist
   */
  constructor (morFacade, botClient) {
    if (morFacade === 'undefined') throw new ConstructorError('morFacade is undefined! NOTE: Constructor cannot be called directly.')
    if (botClient === 'undefined') throw new ConstructorError('botClient is undefined! NOTE: Constructor cannot be called directly.')
    this.#FACADE = morFacade
    this.#DISCORD = botClient
  }

  /**
   * Initializes MorFacade and Discord Client, then constructs Bot object
   * @return {Promise<Bot>}
   * @example
   *  const bot = await Bot.build()
   */
  static async build () {
    console.info('Bot::build ()') // TODO: replace
    const morFacade = await MorFacade.build()
    const botClient = new Client({ intents: [GatewayIntentBits.Guilds] })
    return new Bot(morFacade, botClient)
  }

  /**
   * Initializes and starts the bot
   * @return {Promise<void>}
   * @example
   * await Bot.startBot()
   */
  static async startBot () {
    console.info('Bot::startBot ()') // TODO: replace
    const bot = await Bot.build()
    await bot.start()
  }

  /**
   * Causes the bot to begin listening for commands (i.e. starts the bot)
   * @example
   *  const bot = await Bot.build()
   *  await bot.start()
   */
  async start () {
    console.info('Bot::start ()') // TODO: replace

    this.#DISCORD.once('ready', () => {
      console.info('Bot >> MOR3 is online!') // TODO: replace
    })

    // Listen for chat commands
    this.#DISCORD.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return

      await interaction.deferReply()
      const { commandName } = interaction
      console.info(`Bot >> received command "${commandName}"`) // TODO: replace

      if (commandName === 'help') await helpCmd(interaction)
      else if (commandName === 'ping') await pingCmd(interaction)
      else if (commandName === 'metadata') await metadataCmd(this.#FACADE, interaction)
      else if (commandName === 'users') await usersCmd(this.#FACADE, this.#DISCORD, interaction)
      else if (commandName === 'user') await userCmd(this.#FACADE, interaction)
      else if (commandName === 'track') await trackCmd(this.#FACADE, interaction)
      else if (commandName === 'untrack') await untrackCmd(this.#FACADE, interaction)
      else if (commandName === 'tracklist') await tracklistCmd(this.#FACADE, interaction)
      else if (commandName === 'submit') await submitCmd(this.#FACADE, interaction)
      else if (commandName === 'unsubmit') await unsubmitCmd(this.#FACADE, interaction)
      else if (commandName === 'scores') await scoresCmd(this.#FACADE, this.#DISCORD, interaction)
    })

    // Attempt to restart the bot on error
    this.#DISCORD.on('error', error => {
      console.info(`Bot >> RECEIEVED ERROR "${error.name}: ${error.message}"`) // TODO: replace
      this.#DISCORD.removeAllListeners()
      Bot.startBot()
    })

    // Authenticate the bot; must be the last line of code
    await this.#DISCORD.login(process.env.DISCORD_API_BOT_TOKEN)
  }
}
