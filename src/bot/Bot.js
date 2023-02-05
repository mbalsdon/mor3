import helpCmd from './commands/HelpCmd.js'
import leaderboardCmd from './commands/LeaderboardCmd.js'
import metadataCmd from './commands/MetadataCmd.js'
import pingCmd from './commands/PingCmd.js'
import scoresCmd from './commands/ScoresCmd.js'
import submitCmd from './commands/SubmitCmd.js'
import trackCmd from './commands/TrackCmd.js'
import tracklistCmd from './commands/TracklistCmd.js'
import unsubmitCmd from './commands/UnsubmitCmd.js'
import untrackCmd from './commands/UntrackCmd.js'
import userCmd from './commands/UserCmd.js'
import usersCmd from './commands/UsersCmd.js'

import MorConfig from '../controller/utils/MorConfig.js'
import { ConstructorError } from '../controller/utils/MorErrors.js'
import MorUtils from '../controller/utils/MorUtils.js'

import MorFacade from '../controller/MorFacade.js'

import { Client, GatewayIntentBits } from 'discord.js'

import '../controller/utils/Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

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
    logger.info('Building Discord bot...')

    const morFacade = await MorFacade.build()
    const botClient = new Client({ intents: [GatewayIntentBits.Guilds] })

    return new Bot(morFacade, botClient)
  }

  /**
   * Initializes and starts the bot after a cooldown period
   * @return {Promise<void>}
   * @example
   * await Bot.restart()
   */
  static async restart () {
    const restartTimeMs = 60000
    logger.warn(`Attempting to restart bot after ${restartTimeMs / 1000} seconds...`)

    await MorUtils.sleep(restartTimeMs)
    const bot = await Bot.build()
    await bot.start()
    logger.warn('Bot successfully restarted!')
  }

  /**
   * Causes the bot to begin listening for commands (i.e. starts the bot)
   * @example
   *  const bot = await Bot.build()
   *  await bot.start()
   */
  async start () {
    logger.info('Starting Discord bot...')

    this.#DISCORD.once('ready', () => {
      logger.info('Discord bot is online!')
    })

    // Listen for chat commands
    this.#DISCORD.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return

      await interaction.deferReply()
      const { commandName } = interaction
      logger.info(`Received command "${commandName}"!`)

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
      else if (commandName === 'leaderboard') await leaderboardCmd(this.#FACADE, this.#DISCORD, interaction)
    })

    // Attempt to restart the bot on error
    this.#DISCORD.on('error', error => {
      logger.error(error)

      this.#DISCORD.removeAllListeners()
      Bot.restart()
    })

    // Authenticate the bot; must be the last line of code
    await this.#DISCORD.login(MorConfig.DISCORD_API_BOT_TOKEN)
  }
}
