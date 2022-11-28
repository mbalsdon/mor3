import 'dotenv/config'
import { SlashCommandBuilder, Routes, PermissionFlagsBits } from 'discord.js'
import { REST } from '@discordjs/rest'

const token = process.env.DISCORD_API_BOT_TOKEN
const clientId = process.env.DISCORD_API_CLIENT_ID
const moderatorPermFlags = PermissionFlagsBits.ModerateMembers
const userPermFlags = PermissionFlagsBits.SendMessages

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Documentation on the bot\'s commands')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Checks if the bot is alive')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('metadata')
    .setDescription('Displays the number of entries in each sheet')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('users')
    .setDescription('Displays list of tracked users, sorted by PP')
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Displays a user\'s stats')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username of the player you want to view')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags),

  new SlashCommandBuilder()
    .setName('track')
    .setDescription('Adds a user to be tracked')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username of the player you want to track')
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
    .setDescription('Displays list of scores for a given mod combo, sorted by PP')
    .addStringOption(option =>
      option.setName('mods')
        .setDescription('Mod combo of the leaderboard you want to look at')
        .setRequired(true))
    .setDMPermission(true)
    .setDefaultMemberPermissions(userPermFlags)
]
  .map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(token)

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.info('Successfully registered application commands.'))
  .catch(console.error)
