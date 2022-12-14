import MorConfig from '../controller/utils/MorConfig.js'

import { SlashCommandBuilder, Routes, PermissionFlagsBits } from 'discord.js'
import { REST } from '@discordjs/rest'

import '../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('bot')

const token = MorConfig.DISCORD_API_BOT_TOKEN
const clientId = MorConfig.DISCORD_API_CLIENT_ID
const moderatorPermFlags = PermissionFlagsBits.ModerateMembers
const userPermFlags = PermissionFlagsBits.SendMessages

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Documentation on the bot\'s commands')
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks if the bot is alive')
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('metadata')
    .setDescription('Displays the number of entries in each sheet')
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('users')
    .setDescription('Displays list of tracked users')
    .addStringOption(option =>
      option.setName('sort')
        .setDescription('The data to sort the users by (defaults to pp)')
        .setRequired(false)
        .addChoices(
          { name: 'pp', value: 'pp' },
          { name: 'accuracy', value: 'accuracy' },
          { name: 'playtime', value: 'playtime' },
          { name: 'top1s', value: 'top1s' },
          { name: 'top2s', value: 'top2s' },
          { name: 'top3s', value: 'top3s' }
        ))
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Displays a user\'s stats')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username of the player you want to view')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Adds a user to be tracked')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username of the player you want to track')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('autotrack')
        .setDescription('Whether or not to automatically track the user\'s tops and firsts')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Removes a user from being tracked')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username of the player you no longer want to track')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('tracklist')
    .setDescription('Lists all tracked users in a .txt file')
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Manually submits a score to the database')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Score ID of the score you want to submit')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('unsubmit')
    .setDescription('Removes a submitted score from the database')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Score ID of the score you want to remove')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('scores')
    .setDescription('Displays list of scores')
    .addStringOption(option =>
      option.setName('mods')
        .setDescription('Mod combo of the leaderboard you want to look at (defaults to COMBINED)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('sort')
        .setDescription('The data to sort the scores by (defaults to pp)')
        .setRequired(false)
        .addChoices(
          { name: 'accuracy', value: 'accuracy' },
          { name: 'pp', value: 'pp' },
          { name: 'star_rating', value: 'star_rating' },
          { name: 'date_set', value: 'date_set' }
        ))
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays top plays on a map set by tracked users')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('ID of the beatmap you want to look at the leaderboard of')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('mods')
        .setDescription('Mod combo of the scores you want to look at (defaults to COMBINED)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('sort')
        .setDescription('The data to sort the scores by (defaults to pp)')
        .setRequired(false)
        .addChoices(
          { name: 'accuracy', value: 'accuracy' },
          { name: 'pp', value: 'pp' },
          { name: 'date_set', value: 'date_set' }
        ))
    .setDMPermission(false)
    .setDefaultMemberPermissions(userPermFlags)
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

logger.info(`Refreshing ${commands.length} application slash commands.`)
rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then((data) => logger.info(`Successfully reloaded ${data.length} application slash commands!`))
  .catch((error) => logger.error(`Received error "${error.name}: ${error.message}"`))
