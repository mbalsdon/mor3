import 'dotenv/config'
import { REST } from '@discordjs/rest'
import { SlashCommandBuilder, Routes, PermissionFlagsBits } from 'discord.js'

const token = process.env.DISCORD_API_BOT_TOKEN
const clientId = process.env.DISCORD_API_CLIENT_ID
const moderatorPermFlags = PermissionFlagsBits.ModerateMembers
const userPermFlags = PermissionFlagsBits.SendMessages

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Documents all of the bot commands')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks if the bot is alive')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('metadata')
    .setDescription('Returns mor3 sheet metadata')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('users')
    .setDescription('Displays list of tracked users sorted by PP')
    .addNumberOption(option =>
      option.setName('page')
        .setDescription('Page number of the tracked user list')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Adds a user to be tracked')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('User ID of the person you want to track')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Removes a user from being tracked')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('User ID of the person you no longer want to track')
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
    .setDescription('Manually submit a score to the database')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Score ID of the score you want to submit')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('unsubmit')
    .setDescription('Remove a submitted score from the database')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Score ID of the score you want to remove')
        .setRequired(true))
    .setDMPermission(false)
    .setDefaultMemberPermissions(moderatorPermFlags),

  new SlashCommandBuilder()
    .setName('scores')
    .setDescription('View the pp leaderboard for a given mod combo')
    .addStringOption(option =>
      option.setName('mods')
        .setDescription('Mod combo of the leaderboard you want to look at')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('page')
        .setDescription('Page number of the score leaderboard')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('user')
    .setDescription('View a user\'s stats relating to pp records')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('User ID of the person you want to view')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
      .setName('zeklewa')
      .setDescription('View Zeklewa\'s mouse-only top 100')
      .setDMPermission(true)
      .setDefaultMemberPermissions(userPermFlags)

  // TODO: database manip commands only in Mouse City (163444845644349440), viewing commands global
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
